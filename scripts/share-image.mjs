// Draws public/share.png, the picture a link preview shows (og:image), from the built page's first screen.
//   npm run build && node scripts/share-image.mjs && npm run build
import { chromium } from 'playwright-core'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
