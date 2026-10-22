// Hardcoded content snapshot from CLONE_SPEC.md section 4.
export const LIVE = 'https://www.glaze.app'

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: `${LIVE}/pricing` },
  { label: 'Store', href: `${LIVE}/store` },
  { label: 'Blog', href: `${LIVE}/blog` },
  { label: 'Changelog', href: `${LIVE}/changelog` },
]

export const SIGNUP_HREF = `${LIVE}/signup`
export const downloadHref = (cta) => `${LIVE}/api/download?cta=${cta}`

// YouTube embeds (S1 / S3 / Overlays)
export const VIDEOS = {
  intro: { src: 'https://www.youtube.com/embed/2s_NbPY_XuY', aspect: '16/9' },
  reinvent: { src: 'https://www.youtube.com/embed/NBVlr5xWEOE', aspect: '4/3' },
  demo: { src: 'https://www.youtube.com/embed/4yztdmf6858', aspect: '16/9' },
}

const app = (slug, name, author, iconExt = 'png', avatarExt = 'jpg') => ({
  slug,
  name,
  author,
  href: `${LIVE}/app/${slug}`,
  icon: `/assets/apps/${slug}-icon.${iconExt}`,
  avatar: `/assets/apps/${slug}-avatar.${avatarExt}`,
})

// Award badge shown after the app name (live site: img.ml-0.5.size-4 "<Tier> winner")
export const AWARDS = {
  gold: { alt: 'Gold winner', src: '/assets/award-gold@2x-C2t6avtW.png' },
  silver: { alt: 'Silver winner', src: '/assets/award-silver@2x-Bg8X11yF.png' },
  bronze: { alt: 'Bronze winner', src: '/assets/award-bronze@2x-CZBT3HSE.png' },
}
const award = (a, tier) => ({ ...a, award: AWARDS[tier] })

export const PERSONAS = [
  {
    slug: 'personal',
    label: 'Daily Life',
    title: 'Build tools for everyday life',
    description: 'Trackers, planners, and tiny helpers people made just for themselves:',
    apps: [
      app('mia-calendar-N2NgPq', 'Mia Calendar', 'Daniela Muntyan'),
      app('flor-8Q7yXM', 'Flor', 'David Martín Suárez', 'png', 'png'),
      app('reading-corner-k3tfty', 'Reading Corner', 'Ivo Fonseca'),
      app('alto-cvSTku', 'Alto', 'Wael', 'png', 'png'),
    ],
  },
  {
    slug: 'design',
    label: 'Design',
    title: 'Tools for the way you design',
    description: 'Product designers use Glaze to fill the gaps in their workflow. A few favorites:',
    apps: [
      award(app('my-stash-CDBw9Z', 'My Stash', 'Noman'), 'silver'),
      app('icon-keeper-x9TGum', 'Icon Keeper', 'Yann-Edern Gillet'),
      app('radius-match-6p1dce', 'Radius Match', 'Kristina Loewen'),
      app('font-finder-O2kYPe', 'Font Finder', 'Alexander Artsvuni'),
    ],
  },
  {
    slug: 'development',
    label: 'Development',
    title: 'Solve the problem at hand',
    description: 'Engineers skip the side project and just make the tool. Some of what they shipped:',
    apps: [
      app('yolo-PSjYlj', 'Yolo', 'Alexandr Subbotin'),
      app('awesome-script-commands-Hi544G', 'Awesome Script Commands', 'Thiago Holanda'),
      app('ai-skills-browser-vMg0FR', 'AI Skills Browser', 'alexi.build'),
      app('pro-usage-2iVSvr', 'Pro⁺ Usage', 'Boufford'),
    ],
  },
  {
    slug: 'creativity',
    label: 'Creativity',
    title: 'New instruments for your ideas',
    description: "Creators use Glaze to dream up instruments that don't exist anywhere else:",
    apps: [
      award(app('elsewhere-khfW1h', 'Elsewhere', 'Yann-Edern Gillet'), 'bronze'),
      app('cs-glaze-synth-9TGenH', 'CS Glaze Synth', 'Combustion Studio', 'png', 'png'),
      app('image-sequencer-IxkyCn', 'Image Sequencer', 'Nichlas Wærnes Andersen', 'png', 'png'),
      app('paper-shaders-bjDU1y', 'Paper Shaders', 'Pedro Duarte'),
    ],
  },
  {
    slug: 'fun',
    label: 'Fun',
    title: 'Your ideas, now playable',
    description: 'Games and toys people made simply because they could:',
    apps: [
      award(app('the-last-blockbuster-oRLCOs', 'The Last Blockbuster', '@zenithquinn', 'png', 'png'), 'gold'),
      app('pixel-runner-dZpJ2d', 'Pixel Runner', 'Per Nielsen Tikær', 'png', 'png'),
      app('raycast-maze-Meh4qI', 'Raycast Maze', '騎山豬跑山', 'png', 'png'),
      app('toob-riVQfp', 'Toob', 'Maik Klotz'),
    ],
  },
  {
    slug: 'teams',
    label: 'Your Team',
    title: 'Built around your team',
    description: 'Glaze is used to solve problems and improve workflows at:',
    apps: null,
  },
]

export const FEATURE_ROWS = [
  [
    {
      title: 'Describe and create',
      description: 'Our agent helps you build anything, from first idea to finished app.',
      desktop: '/assets/feature-agent@2x-DiXdV7jJ.png',
      mobile: '/assets/feature-agent-m@2x-SqlCEaw_.png',
      alt: 'AI agent building a desktop app from a prompt',
      demo: true,
    },
  ],
  [
    {
      title: 'Bring your own agent',
      description: 'Use a Claude subscription or Glaze credits to build, open app sources with any agent.',
      desktop: '/assets/feature-byo-agent@2x-O6LGWpOW.png',
      mobile: '/assets/feature-byo-agent-m@2x-DzJfhShO.png',
      alt: 'Model picker with Glaze Fast, Glaze Smart, and Claude subscription models',
    },
    {
      title: 'Annotate',
      description: 'Send changes to your agent directly in your app.',
      desktop: '/assets/feature-annotate@2x-CEgsXauF.png',
      mobile: '/assets/feature-annotate-m@2x-BUOqd2MG.png',
      alt: 'In-app annotation prompting the agent to add a year option',
    },
  ],
  [
    {
      title: 'Publish effortlessly',
      description: 'Easily share with your team or release publicly.',
      desktop: '/assets/feature-publish@2x-BAnZng48.png',
      mobile: '/assets/feature-publish-m@2x-CA9HDStp.png',
      alt: 'Publishing an app to the store',
    },
    {
      title: 'Made for teams',
      description: 'Build software for your specific tools and processes.',
      desktop: '/assets/feature-teams@2x-BMpRWF7u.png',
      mobile: '/assets/feature-teams-m@2x-DAeBdK0q.png',
      alt: 'Team dashboard showing launch progress',
    },
  ],
  [
    {
      title: 'Discover & install',
      description: 'Explore apps from your team and our wider community of builders.',
      desktop: '/assets/feature-store@2x-C0XIoenz.png',
      mobile: '/assets/feature-store-m@2x-D2JyDUG_.png',
      alt: 'App store with community extensions',
    },
  ],
]

// `link` marks the one answer with an inline "Browse the store" link.
export const FAQS = [
  { q: 'What is Glaze?', a: 'Glaze lets you build your own desktop apps just by describing what you want. They live on your Mac, launch instantly, and work offline, so you get real software that fits the way you work.' },
  { q: 'How do I get started?', a: 'Download Glaze for Mac and start building. Glaze currently requires macOS Tahoe and Apple Silicon, with Windows and Linux support planned down the road.' },
  { q: 'Do I need to know how to code?', a: 'No. You describe what you want in plain language and Glaze builds it. If something isn’t right, just talk to it and change it. And if you do know how to code, you’ll feel right at home shaping things further.' },
  { q: 'How is Glaze different from Lovable, Replit, or v0?', a: 'Those tools build for the browser. Glaze builds for your desktop. That means your apps can access your file system, keyboard shortcuts, menu bar integration, background processes, and deeper integration with your OS. Your data stays on your machine, not on someone else’s server. It’s a different category entirely.' },
  { q: 'What kind of apps can I build?', a: 'Anything that comes to mind. Internal tools for your team, personal utilities, menu bar apps, workflow automations, or just quick one-off things that make your life easier. If you can describe it, Glaze can build it. ', link: { label: 'Browse the store', href: `${LIVE}/store`, after: ' for inspiration.' } },
  { q: 'How do I use my Claude subscription?', a: "Sign in with Claude CLI, then connect Glaze and allow it to use your subscription. Your Claude models appear in the model picker next to Glaze's own models. Runs on your subscription don't spend Glaze credits and are unlimited on Glaze's side during the Beta, subject only to Claude's own usage limits." },
  { q: 'Do I own the apps I build with Glaze?', a: 'Yes! You own your app, its code and content.' },
  { q: "How do I share the apps I've built?", a: "You can share an app with anyone, they just need Glaze installed and to be signed in to their account. They don't have to be a paid subscriber to run it. On any plan you can publish to the public Glaze Store, where anyone can discover, download and use your app, or create a private Team Store to distribute apps inside your team, free while Team Stores are in Beta. Pro adds unlisted publishing for 1:1 sharing." },
  { q: 'Can I integrate with my tools or AI?', a: 'Yes. Glaze apps run on your Mac, so they can connect to your APIs, local files, and hardware. You can hook into the tools you already use, pull in AI models, or connect to any service with an API.' },
  { q: 'What platforms does Glaze support?', a: 'Mac to start. Glaze currently requires macOS Tahoe and Apple Silicon. Windows and Linux will come down the road.' },
]
