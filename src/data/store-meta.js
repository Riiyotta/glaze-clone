// Light-weight store head data (no snapshot import) so route modules stay out of the big JSON chunk.
export const CATEGORY_META = {
  remixable: {
    label: 'Remixable',
    title: 'Remixable Apps. Start from an app someone already built.',
    description: 'Browse Glaze apps you can remix: open one in Glaze, make it yours, and publish your own version to the Store.',
  },
  'developer-tools': {
    label: 'Developer Tools',
    title: 'Developer Tools for Mac — Coding & API Apps | Glaze',
    description: 'Discover developer tools for Mac, including API clients, database utilities, coding helpers, usage monitors, and automation apps built with Glaze.',
  },
  productivity: {
    label: 'Productivity',
    title: 'Productivity Apps for Mac — Focus & Workflow Tools | Glaze',
    description: 'Explore productivity apps for Mac that help you focus, plan projects, manage tasks, track time, and streamline everyday workflows with Glaze.',
  },
  utilities: {
    label: 'Utilities',
    title: 'Mac Utilities — Menu Bar & System Tools | Glaze',
    description: 'Find Mac utilities for menu bar workflows, system monitoring, file management, shortcuts, and everyday desktop tasks, all built with Glaze.',
  },
  media: {
    label: 'Media',
    title: 'Media Apps for Mac — Audio, Video & Music Tools | Glaze',
    description: 'Browse media apps for Mac for audio, video, music, recording, playback, and creative workflows, built by the Glaze community.',
  },
  design: {
    label: 'Design',
    title: 'Design Apps for Mac — Color, Image & UI Tools | Glaze',
    description: 'Discover design apps for Mac for colors, images, interface work, creative assets, and visual workflows, built by the Glaze community.',
  },
  lifestyle: {
    label: 'Lifestyle',
    title: 'Lifestyle Apps for Mac — Personal & Everyday Tools | Glaze',
    description: 'Explore lifestyle apps for Mac for personal routines, wellness, hobbies, home life, and everyday organization, built with Glaze.',
  },
  'games-and-fun': {
    label: 'Games & Fun',
    title: 'Games & Fun Apps for Mac — Playful Desktop Apps | Glaze',
    description: 'Discover games and fun apps for Mac, from quick diversions and playful utilities to creative desktop experiences built with Glaze.',
  },
}
export const STORE_TITLE = 'Glaze Store. Explore desktop apps built with Glaze.'
export const STORE_DESCRIPTION = 'Explore desktop apps built with Glaze.'

// Page counts from store-snapshot.json categoryPages; lets the route head clamp ?page= without loading the snapshot.
export const CATEGORY_PAGE_COUNTS = { design: 5, 'developer-tools': 16, 'games-and-fun': 5, lifestyle: 3, media: 7, productivity: 26, remixable: 23, utilities: 21 }
