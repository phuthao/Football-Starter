import React from 'react'

interface Props<T extends string | number> {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  className?: string
}

export function SegmentControl<T extends string | number>({ options, value, onChange, className = '' }: Props<T>) {
  return (
    <div className={`flex p-0.5 bg-[var(--bg-sunken)] rounded-lg border border-[var(--border-subtle)] ${className}`}>
      {options.map(opt => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`flex-1 h-8 text-sm font-semibold rounded-md transition-all ${
            value === opt.value
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-[var(--fg-3)] hover:text-[var(--fg-2)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
