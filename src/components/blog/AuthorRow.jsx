export function Avatar({ author }) {
  return (
    <span className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.08] object-cover text-xs font-medium text-text-secondary ring-2 ring-[#121212]">
      <img src={author.avatar} alt="" width="24" height="24" draggable="false" className="h-full w-full object-cover" />
    </span>
  )
}

export default function AuthorRow({ author, className = '' }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 text-[15px] leading-[22px] text-text-tertiary ${className}`}>
      <Avatar author={author} />
      <span className="min-w-0 truncate">{author.name}</span>
    </div>
  )
}
