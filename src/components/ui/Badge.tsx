import React from 'react'

interface Props {
  variant: 'gk' | 'key' | 'warning'
  size?: 'sm' | 'xs'
}

export function Badge({ variant, size = 'sm' }: Props) {
  const base = 'inline-flex items-center font-bold rounded-sm leading-none select-none'
  const sz = size === 'xs' ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'
  const colors = {
    gk:      'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    key:     'bg-lime-400/15 text-lime-400 border border-lime-400/25',
    warning: 'bg-red-500/15 text-red-400 border border-red-500/25',
  }
  return <span className={`${base} ${sz} ${colors[variant]}`}>{variant === 'gk' ? '🧤' : variant === 'key' ? '⭐' : '⚠️'}</span>
}
