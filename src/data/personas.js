// SPEC_legal_persona.md A.1 / A.2. Only these five slugs are valid persona routes; the six
// showcase tab ids (design, development, creativity, personal, fun, productivity) are NOT
// routes and fall through to NotFound (A.3).

// `/` (A.2 baseline row). `\n` = line break in the h1; in the sub it is a <br class="hidden xs:block">.
export const LANDING_HERO = {
  heroHeadline: 'Desktop apps,\nreimagined by you.',
  heroSubheadline: 'Create any app in minutes by chatting with AI.\nBeautiful, powerful, and truly personal.',
  initialPersona: 'personal',
}

// initialPersona = showcase tab id preselected (A.1 `yC` map).
export const PERSONA_PAGES = {
  designers: {
    heroHeadline: 'Ship the Mac app you\nalways wanted to make',
    heroSubheadline:
      'Your design sense and an idea are all it takes. Glaze builds, packages, and publishes the app for you.',
    initialPersona: 'design',
  },
  'product-managers': {
    heroHeadline: 'Turn product ideas into\nworking desktop apps',
    heroSubheadline: 'Describe the idea. Glaze turns it into a working Mac app, no engineering time required.',
    initialPersona: 'personal',
  },
  engineers: {
    heroHeadline: 'Solve any problem\nwith a desktop app',
    heroSubheadline: 'The tools you keep meaning to build, finally built. Glaze does the heavy lifting.',
    initialPersona: 'development',
  },
  creators: {
    heroHeadline: 'Your creative workflow,\nnow a desktop app',
    heroSubheadline: 'Describe how you write, edit, or publish. Glaze shapes a Mac app around your process.',
    initialPersona: 'creativity',
  },
  teams: {
    heroHeadline: 'Desktop apps built\naround your team',
    heroSubheadline: "Create tools that fit your team's unique workflow, shared as Mac apps for everyone.",
    initialPersona: 'teams',
  },
}

// A.1 head(): title = headline with "\n" -> " " + ". Glaze by Raycast."
export const personaTitle = (p) => `${p.heroHeadline.replace('\n', ' ')}. Glaze by Raycast.`
