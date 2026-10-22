import { useEffect, useRef, useState } from 'react'
import { useColumns, useWheelNav } from './hooks'
import { LIcon } from './StoreIcons'

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

// Paged slider (SPEC_store 4.4). sizes = page size per column count. Title omitted for the plain
// category grid (single page, no header).
export default function Slider({ title, accessory, items, sizes = { 1: 6, 2: 8, 3: 6, 4: 12 }, pad = true, renderItem }) {
  const cols = useColumns()
  const size = sizes[cols]
  const pages = chunk(items, size)
  const [index, setIndex] = useState(0)
  const i = Math.min(index, Math.max(0, pages.length - 1))
  const wheelRef = useRef(null)
  useEffect(() => setIndex(0), [size, items.length])
  const go = (d) => setIndex((v) => Math.min(Math.max(0, Math.min(v, pages.length - 1) + d), pages.length - 1))
  useWheelNav(wheelRef, go)
  const multi = pages.length > 1

  return (
    <section className="flex flex-col gap-1.5 xs:gap-2">
      {title && (
        <div className="flex min-h-7 items-center justify-between gap-4">
          <div className="flex min-h-7 items-center gap-3">
            <h2 className="text-base font-medium leading-[22px] text-white">{title}</h2>
            {accessory}
          </div>
          {multi && (
            <div className="flex shrink-0 items-center gap-1.5">
              {[-1, 1].map((d) => {
                const disabled = d < 0 ? i === 0 : i === pages.length - 1
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={disabled}
                    aria-label={`${d < 0 ? 'Previous' : 'Next'} ${title}`}
                    onClick={() => go(d)}
                    className={`liquid-glass grid size-7 place-items-center rounded-full text-text-secondary transition-colors ${
                      disabled ? 'cursor-pointer opacity-[.35]' : 'hover:bg-surface-panel hover:text-white'
                    }`}
                  >
                    <LIcon name={d < 0 ? 'chevron-left' : 'chevron-right'} size={16} style={{ transform: `translateX(${d}px)` }} />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
      <div ref={wheelRef} className="-mx-2 overflow-hidden">
        <div
          className="flex w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none"
          style={{ transform: `translate3d(-${i * 100}%,0,0)` }}
        >
          {pages.map((page, p) => (
            <div key={p} className="w-full shrink-0 px-2" aria-hidden={p === i ? undefined : 'true'} inert={p === i ? undefined : ''}>
              <div className="grid grid-cols-1 gap-x-5 gap-y-1 xs:grid-cols-2 md:grid-cols-3 min-[1920px]:grid-cols-4">
                {page.map(renderItem)}
                {pad && multi && p === pages.length - 1 && Array.from({ length: size - page.length }, (_, k) => <div key={`pad${k}`} aria-hidden="true" className="h-[72px]" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
