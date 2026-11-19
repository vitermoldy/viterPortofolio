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
