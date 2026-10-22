// Inline SVG markup copied from CLONE_SPEC.md section 7 / _reference/original.html.

export const PLAY_CIRCLE_SRC =
  "data:image/svg+xml,%3csvg%20width='48'%20height='48'%20viewBox='0%200%2048%2048'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='24'%20cy='24'%20r='12'%20fill='black'/%3e%3cpath%20d='M24%203C35.598%203%2045%2012.402%2045%2024C45%2035.598%2035.598%2045%2024%2045C12.402%2045%203%2035.598%203%2024C3%2012.402%2012.402%203%2024%203ZM21.4668%2015.3574C20.7745%2014.9123%2019.8943%2014.881%2019.1719%2015.2754C18.4495%2015.6698%2018%2016.427%2018%2017.25V30.75C18%2031.573%2018.4495%2032.3302%2019.1719%2032.7246C19.8943%2033.119%2020.7745%2033.0877%2021.4668%2032.6426L31.9668%2025.8926C32.6107%2025.4786%2033%2024.7656%2033%2024C33%2023.2344%2032.6107%2022.5214%2031.9668%2022.1074L21.4668%2015.3574Z'%20fill='white'/%3e%3c/svg%3e"

export const SQUIRCLE_PATH =
  'M0 28.16C0 18.30 0 13.38 1.92 9.60C3.61 6.31 6.31 3.61 9.60 1.92C13.38 0 18.30 0 28.16 0H35.84C45.70 0 50.62 0 54.40 1.92C57.69 3.61 60.39 6.31 62.08 9.60C64 13.38 64 18.30 64 28.16V35.84C64 45.70 64 50.62 62.08 54.40C60.39 57.69 57.69 60.39 54.40 62.08C50.62 64 45.70 64 35.84 64H28.16C18.30 64 13.38 64 9.60 62.08C6.31 60.39 3.61 57.69 1.92 54.40C0 50.62 0 45.70 0 35.84V28.16Z'

export function AppleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 17 20" fill="currentColor" aria-hidden="true" className="relative -top-px shrink-0">
      <path d="M13.981 10.587c-.022-2.233 1.833-3.304 1.917-3.357-1.046-1.53-2.668-1.74-3.244-1.764-1.381-.14-2.695.813-3.396.813-.697 0-1.778-.792-2.923-.77-1.504.022-2.89.875-3.664 2.223-1.562 2.71-.4 6.724 1.123 8.92.744 1.076 1.632 2.285 2.797 2.24 1.123-.045 1.547-.726 2.904-.726s1.739.726 2.923.704c1.207-.023 1.973-1.097 2.711-2.178.854-1.249 1.207-2.458 1.229-2.52-.027-.012-2.351-.902-2.373-3.585ZM11.75 4.01c.617-.748 1.035-1.79.922-2.824-.89.036-1.968.593-2.606 1.34-.572.662-1.071 1.724-.936 2.738.993.077 2.008-.506 2.62-1.254Z" />
    </svg>
  )
}

const lucideProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function HardDriveIcon({ className }) {
  return (
    <svg {...lucideProps} className={className}>
      <line x1="22" x2="2" y1="12" y2="12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <line x1="6" x2="6.01" y1="16" y2="16" />
      <line x1="10" x2="10.01" y1="16" y2="16" />
    </svg>
  )
}

export function LaptopMinimalCheckIcon({ className }) {
  return (
    <svg {...lucideProps} className={className}>
      <path d="M2 20h20" />
      <path d="m9 10 2 2 4-4" />
      <rect x="3" y="4" width="18" height="12" rx="2" />
    </svg>
  )
}

export function SparklesIcon({ className }) {
  return (
    <svg {...lucideProps} className={className}>
      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
      <path d="M20 2v4" />
      <path d="M22 4h-4" />
      <circle cx="4" cy="20" r="2" />
    </svg>
  )
}

export function ChevronDownIcon({ className }) {
  return (
    <svg {...lucideProps} className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

// lucide `check` (standard lucide path; not present in the saved HTML)
export function CheckIcon({ className }) {
  return (
    <svg {...lucideProps} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

// lucide `x` (standard lucide paths; close buttons use strokeWidth 2.25)
export function XIcon({ className, size = 20 }) {
  return (
    <svg {...lucideProps} width={size} height={size} strokeWidth={2.25} className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function ArrowRightIcon({ className }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

export function FaqChevron({ className }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary" />
    </svg>
  )
}

const SOCIAL_PATHS = {
  X: { d: 'M1.034 1.467 6.44 8.674 1 14.534h1.224l4.762-5.13 3.848 5.13H15L9.29 6.92l5.063-5.454H13.13L8.744 6.192 5.2 1.467H1.034Zm1.8.899h1.914L13.2 13.634h-1.913L2.834 2.366Z' },
  Slack: { d: 'M3.651 9.979c0 .867-.707 1.576-1.575 1.576A1.58 1.58 0 0 1 .5 9.979a1.58 1.58 0 0 1 1.576-1.576h1.575v1.576Zm.794 0a1.58 1.58 0 0 1 1.576-1.576 1.58 1.58 0 0 1 1.576 1.576v3.945A1.58 1.58 0 0 1 6.021 15.5a1.58 1.58 0 0 1-1.576-1.576V9.98ZM6.021 3.65a1.579 1.579 0 0 1-1.576-1.575A1.58 1.58 0 0 1 6.021.5a1.58 1.58 0 0 1 1.576 1.576v1.575H6.021Zm0 .794a1.58 1.58 0 0 1 1.576 1.576 1.58 1.58 0 0 1-1.576 1.577H2.076A1.58 1.58 0 0 1 .5 6.02a1.58 1.58 0 0 1 1.576-1.576h3.945Zm6.328 1.576c0-.867.707-1.576 1.575-1.576A1.58 1.58 0 0 1 15.5 6.021a1.58 1.58 0 0 1-1.576 1.577h-1.575V6.02Zm-.794 0a1.58 1.58 0 0 1-1.576 1.577A1.58 1.58 0 0 1 8.403 6.02V2.076A1.58 1.58 0 0 1 9.979.5a1.58 1.58 0 0 1 1.576 1.576v3.945ZM9.979 12.35c.867 0 1.576.707 1.576 1.575A1.58 1.58 0 0 1 9.979 15.5a1.58 1.58 0 0 1-1.576-1.576V12.35h1.576Zm0-.794a1.58 1.58 0 0 1-1.576-1.576 1.58 1.58 0 0 1 1.576-1.576h3.945A1.58 1.58 0 0 1 15.5 9.979a1.58 1.58 0 0 1-1.576 1.576H9.979Z' },
  YouTube: { evenodd: true, d: 'M13.965 13.56a1.994 1.994 0 0 0 1.676-1.6c.16-.92.32-2.28.359-3.96 0-1.68-.2-3.04-.36-3.96a1.994 1.994 0 0 0-1.675-1.6C12.608 2.24 10.454 2 7.98 2s-4.668.24-5.985.44c-.838.12-1.516.76-1.676 1.6C.16 4.96 0 6.32 0 8c0 1.68.16 3.04.32 3.96.159.84.837 1.48 1.675 1.6 1.357.2 3.551.44 5.985.44 2.474 0 4.668-.24 5.985-.44ZM11.172 8 6.384 5.2v5.6L11.172 8Z' },
  Reddit: { evenodd: true, d: 'M15.5 8a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0ZM9.933 4.06c.453.13.947-.131 1.077-.607a.861.861 0 0 0-.606-1.056.866.866 0 0 0-1.077.606.99.99 0 0 0-.022.39L7.123 4.86a.216.216 0 0 0-.086.194l.13 1.25c-.995.087-1.926.368-2.662.844a1.204 1.204 0 0 0-1.92.974c0 .433.216.8.54 1.017a2.07 2.07 0 0 0-.022.281c0 1.732 2.161 3.137 4.832 3.137 2.68 0 4.842-1.405 4.842-3.137 0-.086 0-.173-.022-.26a1.202 1.202 0 1 0-1.363-1.97c-.736-.476-1.688-.779-2.725-.887L8.56 5.184l1.775-1.19c.064.023.129.045.194.066ZM5.47 9.29c-.432 0-.778-.346-.778-.779s.346-.78.779-.78.779.347.779.78a.775.775 0 0 1-.78.779Zm4.54 1.428c-.52.52-1.494.563-2.075.563-.585 0-1.559-.043-2.078-.563a.234.234 0 0 1 0-.347.234.234 0 0 1 .346 0c.326.325.996.412 1.732.412.736 0 1.405-.087 1.731-.412a.234.234 0 0 1 .346 0c.087.087.087.26 0 .347Zm-.238-1.428c.433 0 .779-.346.779-.779s-.346-.78-.78-.78c-.432 0-.778.347-.778.78s.346.78.779.78Z' },
}

export const SOCIAL_LINKS = [
  { label: 'X', href: 'https://x.com/glazeapp' },
  { label: 'Slack', href: 'https://glaze.app/community' },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UCZltNInxFzkNzBqg_G4EdXg' },
  { label: 'Reddit', href: 'https://reddit.com/r/glazeapp' },
]

export function SocialIcon({ name }) {
  const { d, evenodd } = SOCIAL_PATHS[name]
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" className="h-5 w-5">
      <path fill="currentColor" d={d} {...(evenodd ? { fillRule: 'evenodd', clipRule: 'evenodd' } : {})} />
    </svg>
  )
}

export function RaycastMark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <path fill="currentColor" d="M7.454 14.372 10.919 17.838 10.006 18.75l-4.378-4.378h1.826ZM11.372 14.372l1.502 1.501-.914.914-2.415-2.415h1.827ZM14.836 13.914l-.913.914-.979-.98.91-.911.982.977ZM5.628 12.546v1.826L1.25 9.994l.917-.91 3.461 3.462ZM18.75 9.998l-.912.913-3.462-3.459v2.089l2.416 2.416-.913.912-1.503-1.502v1.05h-6.79v-6.79h1.047L7.131 4.126l.913-.913 2.413 2.411h2.089L9.09 2.164 10.002 1.25l8.748 8.748ZM5.628 8.628v1.827L3.213 8.04l.914-.914 1.501 1.502ZM7.063 6.146l-.912.914-.979-.979.913-.914.978.98Z" />
    </svg>
  )
}

export const TEAM_LOGOS = [
  { name: 'Raycast', d: 'M6.004 15.492v2.504L0 11.992l1.258-1.249Zm2.504 2.504H6.004L12.008 24l1.253-1.253zm14.24-4.747L24 11.997 12.003 0 10.75 1.251 15.491 6h-2.865L9.317 2.692 8.065 3.944l2.06 2.06H8.691v9.31H18v-1.432l2.06 2.06 1.252-1.252-3.312-3.32V8.506ZM6.63 5.372 5.38 6.625l1.342 1.343 1.251-1.253Zm10.655 10.655-1.247 1.251 1.342 1.343 1.253-1.251zM3.944 8.059 2.692 9.31l3.312 3.314v-2.506zm9.936 9.937h-2.504l3.314 3.312 1.25-1.252z' },
  { name: 'Linear', d: 'M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z' },
  { name: 'Vercel', d: 'm12 1.608 12 20.784H0Z' },
  { name: 'Cursor', d: 'M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23' },
]

export function TeamLogo({ d, className, label }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} role="img" aria-label={label}>
      <path d={d} />
    </svg>
  )
}
