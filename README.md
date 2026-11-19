# viterPortofolio

My GitHub profile in 3D: **https://vitermoldy.github.io/viterPortofolio/**

![The first screen: the pixel-art portrait standing up as blocks](public/share.png)

- **The portrait** from my profile, 64 by 64 pixels, as 4,096 blocks. Brighter pixels stand further out. Switch
  the sky between moon and sunset and the same blocks re-press into the other picture in one wave.
- **Every contribution** as a skyline: the GitHub calendar, one block per day in GitHub's own shade, on a log
  scale so a quiet day still shows beside a day of thousands. Flat heat map or 3D, the last 12 months or a past
  year, hover a day for its count.
- **The pixel art** of my README (the room, StudyCabin at night, the sunset field) read pixel by pixel into a
  relief you can turn.
- **Every project card** from the README as a relief. Public repositories get their links; private ones say so.

Drag to turn any of them, double-click to face it again, or focus it and use the arrow keys.

## How the numbers stay current

`scripts/sync-profile.mjs` reads the account, its public repositories and the public contribution calendar
from GitHub and writes them to `public/data/`. The pixel art is copied from the profile repository
([vitermoldy/vitermoldy](https://github.com/vitermoldy/vitermoldy)). The Pages workflow runs the sync before
every build and once a day, so the skyline grows on its own.

## Run it

Node 22 or newer.

```bash
npm install
