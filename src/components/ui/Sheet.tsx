import React, { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
  fullHeight?: boolean
}

export function Sheet({ open, onClose, children, title, className = '', fullHeight }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm overlay-enter"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className={`relative bg-[var(--bg-surface)] rounded-t-2xl shadow-lg sheet-enter ${fullHeight ? 'max-h-[95dvh]' : 'max-h-[90dvh]'} flex flex-col ${className}`}>
        {/* Handle */}
        <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--border-default)]" />
        </div>
        {title && (
          <div className="px-5 py-3 border-b border-[var(--border-subtle)] shrink-0">
            <h2 className="text-lg font-bold text-[var(--fg-1)]">{title}</h2>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}
