// SPEC_marketing section 1.2 / 1.3 (copy is exact).
export const PLANS = [
  {
    id: 'free',
    title: 'Free',
    features: [
      { text: 'Use your Claude subscription', badge: 'Unlimited during Beta', icon: 'claude' },
      { text: 'Use any agent with app sources' },
      { text: 'Use Glaze Fast models' },
      { text: '50 credits launch welcome pack' },
      { text: 'Credit top-ups' },
      { text: 'Browse and install apps' },
      { text: 'Publish apps to Public Store' },
    ],
    caption: 'Try Glaze for free',
  },
  {
    id: 'pro',
    title: 'Pro',
    highlighted: true,
    lead: 'Everything in Free, plus:',
    features: [
      { text: 'Use Glaze Smart models' },
      { text: '100 monthly Glaze credits' },
      { text: 'Credit top-ups without platform fee' },
      {
        text: 'Creator Hub analytics',
        info: 'Track installs, active users, store conversion and user feedback for every app you publish.',
      },
      { text: 'Publish apps as Unlisted' },
      {
        text: 'Disable remixing of your apps',
        info: 'Pro users can choose whether apps they publish can be remixed by others.',
      },
    ],
    price: { amount: '$10', unit: 'per month' },
  },
  {
    id: 'team',
    title: 'Team',
    features: [
      { text: 'Create your private Team Store' },
      { text: 'Invite teammates' },
      { text: 'Distribute apps within your team' },
      { text: 'Available for Free and Pro users' },
    ],
    caption: 'Free during Beta',
  },
]

export const PRICING_FAQS = [
  { q: 'What is Glaze?', a: 'Glaze lets you build your own desktop apps just by describing what you want. They live on your Mac, launch instantly, and work offline, so you get real software that fits the way you work.' },
  { q: 'How do I get started?', a: 'Download Glaze for Mac and start building. Glaze currently requires macOS Tahoe and Apple Silicon, with Windows and Linux support planned down the road.' },
  { q: 'How do I use my Claude subscription?', a: "Sign in with Claude CLI, then connect Glaze and allow it to use your subscription. Your Claude models appear in the model picker next to Glaze's own models. Runs on your subscription don't spend Glaze credits and are unlimited on Glaze's side during the Beta, subject only to Claude's own usage limits." },
  { q: 'How do I use Glaze without a Claude subscription?', a: "You don't need one. You can build with Glaze using credits from your Free or Pro plan. Free includes a one-time pack of welcome credits and optional top-ups. Pro adds a monthly credit allowance that refreshes every billing month, plus top-ups without the platform fee." },
  { q: 'Can I work on my apps with other agents?', a: "Yes. Every Glaze app's sources live in a regular folder on your Mac, so you can open a project with Claude Code, Cursor, Codex, or any editor and work on it directly. Glaze sets each project up so external agents know how to build and package your app, and your changes show up in Glaze like any other edit." },
  { q: 'What is a credit?', a: "Credits are what the agent spends when it builds or edits an app with Glaze's own models. The more work a turn involves, the more it costs, so a quick tweak is cheap while building an app from scratch costs more, and more capable models cost more per turn. Credits track real usage rather than a flat per-message charge. Building on your own Claude subscription doesn't spend credits at all." },
  { q: 'What do I get on the Free plan?', a: "The whole product. You can browse, install and run any app, build with your own Claude subscription or any other agent, and publish to the public store. To build with Glaze's own models you get a one-time pack of welcome credits, so you can start right away without waiting for a refresh, and you can buy top-ups at any time. There's no recurring credit allowance on Free, so that part pauses once your balance reaches zero. Pro adds monthly credits, our most capable models, top-ups without the platform fee and unlisted publishing." },
  { q: 'Do credits roll over?', a: 'On Pro, unused monthly subscription credits roll over into your next billing month (ie they are valid for 2 months from grant). Purchased top-up credits are valid for 3 months. Free welcome credits are a one-time allocation and do not roll over or recur.' },
  { q: 'What happens when I run out of credits?', a: "Building with Glaze's models pauses until you have credits again. You can buy a top-up on any plan, wait for the next monthly refill on Pro, or connect your own Claude subscription and keep building on that. Installing and running the apps you already have is unaffected." },
  { q: 'Can I buy more credits before my next refill?', a: 'Yes, on any plan. Top-ups are one-off packs you can buy at any time, priced at what the tokens cost us plus a small platform fee. Pro waives that fee.' },
  { q: 'Are credits refundable?', a: "Credits aren't refundable. They remain usable until they expire." },
  { q: 'How does the Team plan work?', a: "The Team plan gives you a private Team Store: create one, invite teammates, and distribute apps that only your team can see. It's free during the Beta, and each member builds with their own Free or Pro subscription." },
]
