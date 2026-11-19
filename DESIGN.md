# viterPortofolio: design direction

The vitermoldy GitHub profile, built in 3D.

**Direction (from the owner, 19 November 2026).** "Saya ingin profile GitHub-ku bisa dilihat secara 3D, mau dari
pixel, commit, intinya profil GitHub-ku bisa 3D." The owner supplied the Contribution Skyline component
(`Prompt.txt`) for the commits. Everything else follows the profile README's own design
(`../vitermoldy/DESIGN.md`), because this site is that profile seen in 3D.

**Design Read.** Reading this as: the owner's GitHub profile as a 3D page for classmates, lecturers and
recruiters, in the profile's pixel-art "Hutan" style turned into voxels, dial **ENERGY 3 / RHYTHM 2 / MOTION 3**.

## Decisions and their reasons

| Decision | Reason |
| --- | --- |
| Hutan palette: ink `#121a14`, greens `#0f3d2e` `#1f6e44` `#52c879`, yellows `#f0b429` `#fff36b`, paper `#eef0e6`, muted `#aab6a5` | The profile's palette, so the 3D page and the README read as one piece |
| Dark only, no theme switch | Every pixel piece is a night scene on the profile's ink plates (moon portrait, room at night, aurora banner), and the lit blocks only read as light against dark |
| Tiny5 for headings, numbers and buttons | The profile's pixel face; its letters are pixels, like the blocks |
| GitHub's system font stack for body text | The descriptions are the README's own words and read as they do on github.com |
| Square corners everywhere, 2 px borders | Pixels have no radius; the profile's stats cards use `border_radius=0` |
| Hard 4 px shadow under the main button, pressed into on click | Pixel-art depth for the one thing to press first, the profile link |
| A small three-step voxel before every h2 | The page's motif: one block, the unit everything here is made of |
| Hot yellow only for headings and big numbers, amber only on the main button | One accent with a clear job; green carries everything else |
| Soft light pool behind each 3D stage | The dark sides of the blocks need a slightly lighter ground to read as depth |
| Block depth follows pixel brightness | Lit screens, the moon and the neon come forward; the night stays at the wall. Seen head-on, the front faces are the exact pixel art |
| Skyline heights on a log scale, colours from GitHub's own levels | The calendar spans 1 to 23,752 a day; linear heights would hide every quiet day. The shades match the profile page exactly |
| Same-size pictures morph in a wave (portrait sky, project cards); other sizes fly in | Shows that the blocks are the pixels: the same 4,096 or 27,200 blocks re-press into the next picture |
| Section layouts vary: split hero, full-width skyline, list beside a sticky stage, stage beside a detail, big type contact | RHYTHM 2: one system, a different composition per content |

## Motion (MOTION 3)

- The hero text rises once on load; each stage's blocks fly in the first time it scrolls into view.
- Switching a picture of the same size is a wave from a corner (cards) or the centre (portrait).
- The skyline folds up from the flat heat map when it first shows.
