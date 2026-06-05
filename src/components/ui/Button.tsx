import React from 'react'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
}

export function Button({ variant = 'primary', size = 'md', block, className = '', children, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all active:scale-95 select-none disabled:opacity-40 disabled:pointer-events-none'
  const sz = { sm: 'h-9 px-4 text-sm', md: 'h-11 px-5 text-base', lg: 'h-14 px-6 text-lg' }[size]
  const v = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm',
    ghost:   'bg-transparent border border-[var(--border-default)] text-[var(--fg-2)] hover:bg-[var(--bg-overlay)] hover:text-[var(--fg-1)]',
    danger:  'bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600/20',
  }[variant]
  return (
    <button
      className={`${base} ${sz} ${v} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
