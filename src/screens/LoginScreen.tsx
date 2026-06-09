import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { signIn } from '../lib/supabase'
import { useApp } from '../store/AppContext'

export function LoginScreen() {
  const { dispatch } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    const result = await signIn(email.trim(), password)
    setLoading(false)
    if (result.ok) {
      dispatch({ type: 'SET_LOGGED_IN', value: true, email: result.email })
    } else if (result.wrongCredentials) {
      setError('Email hoặc mật khẩu không đúng')
    } else {
      setError('Lỗi kết nối, thử lại nhé')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 gap-6">
      <div className="text-5xl">⚽</div>
      <div className="text-center">
        <div className="font-display text-2xl font-bold text-[var(--fg-1)]">Quản lý đội bóng</div>
        <div className="text-sm text-[var(--fg-3)] mt-1">Đăng nhập để tiếp tục</div>
      </div>
      <div className="w-full space-y-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Email"
          className="w-full h-12 px-4 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-default)] text-[var(--fg-1)] text-base placeholder:text-[var(--fg-3)] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Mật khẩu"
          className="w-full h-12 px-4 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-default)] text-[var(--fg-1)] text-base placeholder:text-[var(--fg-3)] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
        />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <Button variant="primary" size="lg" block onClick={handleLogin} disabled={loading || !email.trim() || !password.trim()}>
          {loading ? 'Đang kết nối…' : 'Đăng nhập'}
        </Button>
      </div>
    </div>
  )
}
