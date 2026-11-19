// Pulls the GitHub profile this site draws in 3D and writes it into public/ as plain files.
//
//   node scripts/sync-profile.mjs                  profile, repositories, contributions and pixel art
//   node scripts/sync-profile.mjs --user someone   another account
//   node scripts/sync-profile.mjs --skip-pixel     data only (the pixel art is already in public/pixel)
//
// The contribution calendar is the public one the profile page shows (github.com/users/<name>/contributions),
// read year by year, so it needs no token. The account and its public repositories come from the REST API;
