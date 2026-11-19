<#
  commit-push.ps1
  Membuat satu commit untuk setiap file baru, berubah atau terhapus di repo viterPortofolio ini, lalu push sekali di akhir.
  Commit memakai nama dan email dari git config Anda sendiri. Tidak ada baris Co-Authored-By atau penulis lain.
  File di .gitignore (node_modules/, dist/, .shots/) dan skrip ini sendiri tidak ikut.

  Pemakaian, dari folder repo:
    powershell -ExecutionPolicy Bypass -File .\commit-push.ps1 -DryRun   lihat daftar commit, tanpa mengubah apa pun
    powershell -ExecutionPolicy Bypass -File .\commit-push.ps1 -NoPush   commit saja, push nanti: git push -u origin main
    powershell -ExecutionPolicy Bypass -File .\commit-push.ps1           commit semua file satu per satu, lalu push
#>
param(
  [string]$Remote = 'origin',
  [string]$Branch = '',
  [switch]$NoPush,
  [switch]$DryRun
)

$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Set-Location -LiteralPath $PSScriptRoot

git rev-parse --is-inside-work-tree 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host 'Folder ini bukan repo git.' -ForegroundColor Red; exit 1 }
if (-not $Branch) { $Branch = (git branch --show-current).Trim() }
if (-not $Branch) { Write-Host 'Tidak sedang berada di sebuah branch.' -ForegroundColor Red; exit 1 }

# Penulis commit: hanya Anda, dari git config
$name  = (git config user.name)
$email = (git config user.email)
if (-not $name -or -not $email) {
  Write-Host 'Nama atau email git belum diisi. Isi dulu:' -ForegroundColor Red
  Write-Host '  git config --global user.name "Nama Anda"'
  Write-Host '  git config --global user.email "email@anda"'
  exit 1
}
if ("$name $email" -match '(?i)claude|anthropic') {
  Write-Host "Identitas git '$name <$email>' bukan milik Anda. Ganti dulu dengan git config." -ForegroundColor Red
  exit 1
}
Write-Host "Penulis commit: $name <$email>" -ForegroundColor Cyan

# git prints NUL-separated paths with -z, so names with spaces stay whole
function Get-Paths([string[]]$GitArgs) {
  $out = & git -c core.quotepath=off @GitArgs 2>$null
  if (-not $out) { return @() }
  return @(($out -join "`0") -split "`0" | Where-Object { $_ -ne '' })
}

$self    = Split-Path -Leaf $PSCommandPath
$new     = Get-Paths @('ls-files', '--others', '--exclude-standard', '-z')
$deleted = Get-Paths @('ls-files', '--deleted', '-z')
$changed = Get-Paths @('ls-files', '--modified', '-z') | Where-Object { $deleted -notcontains $_ }

$items = @()
$items += $new     | ForEach-Object { [pscustomobject]@{ Path = $_; Verb = 'Tambah' } }
$items += $changed | ForEach-Object { [pscustomobject]@{ Path = $_; Verb = 'Ubah' } }
$items += $deleted | ForEach-Object { [pscustomobject]@{ Path = $_; Verb = 'Hapus' } }
$items = @($items | Where-Object { $_.Path -ne $self })

# Penjaga: folder kerja dan file asisten tidak pernah ikut, walau .gitignore terhapus
$blocked = '^(\.work/|\.taste-skill/|\.claude/|\.shots/|node_modules/|dist/)|(^|/)(CLAUDE|AGENTS)\.md$'
$skip = @($items | Where-Object { $_.Path -match $blocked })
foreach ($s in $skip) { Write-Host "  tidak ikut: $($s.Path)" -ForegroundColor Yellow }
$items = @($items | Where-Object { $_.Path -notmatch $blocked })

# Penjaga: tidak ada file yang menyebut Co-Authored-By
foreach ($it in $items) {
  if ($it.Verb -eq 'Hapus') { continue }
  if ($it.Path -match '\.(jpg|jpeg|png|ttf|woff2?)$') { continue }
  if (Select-String -LiteralPath $it.Path -Pattern 'Co-Authored-By' -SimpleMatch -Quiet) {
    Write-Host "Berhenti: $($it.Path) memuat 'Co-Authored-By'. Hapus baris itu dulu." -ForegroundColor Red
    exit 1
  }
}

# .gitignore dulu, supaya aturan abaikan ada sejak awal; README.md terakhir
$items = @($items | Sort-Object @{ Expression = {
  if ($_.Path -eq '.gitignore') { 0 } elseif ($_.Path -eq 'README.md') { 2 } else { 1 } } }, Path)

$total = $items.Count
if ($total -eq 0) { Write-Host 'Tidak ada file baru atau berubah. Tidak ada yang di-commit.'; exit 0 }
Write-Host "$total file akan di-commit satu per satu ke branch '$Branch'." -ForegroundColor Cyan

$made = 0; $i = 0
foreach ($it in $items) {
  $i++
  $msg = "$($it.Verb) $($it.Path)"
  Write-Host ("[{0}/{1}] {2}" -f $i, $total, $msg)
  if ($DryRun) { continue }
  git -c core.safecrlf=false add -A -- "$($it.Path)" 2>$null
  git -c core.safecrlf=false commit --quiet -m $msg -- "$($it.Path)" 2>$null
  if ($LASTEXITCODE -eq 0) { $made++ } else { Write-Host "  dilewati: tidak ada perubahan untuk $($it.Path)" -ForegroundColor Yellow }
}

if ($DryRun) { Write-Host "Dry run: $total commit akan dibuat. Tidak ada yang diubah." -ForegroundColor Cyan; exit 0 }
Write-Host "$made commit dibuat." -ForegroundColor Green

if ($NoPush) { Write-Host "Push dilewati. Jalankan nanti: git push -u $Remote $Branch"; exit 0 }
Write-Host "Push ke $Remote/$Branch ..." -ForegroundColor Cyan
git push -u $Remote $Branch
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Push gagal. Commit-nya tetap tersimpan di komputer Anda.' -ForegroundColor Red
  Write-Host "Cek login GitHub atau isi remote, lalu jalankan lagi: git push -u $Remote $Branch"
  exit 1
}
Write-Host 'Selesai. GitHub Actions akan membangun dan menerbitkan situsnya ke https://vitermoldy.github.io/viterPortofolio/' -ForegroundColor Green
