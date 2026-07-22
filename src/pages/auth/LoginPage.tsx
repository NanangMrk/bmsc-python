import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, AlertCircle, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'


export default function LoginPage() {
  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const success = await login(email, password)
    setLoading(false)
    if (success) {
      navigate('/dashboard')
    } else {
      setError('Login gagal. Periksa kembali Username/Email dan password Anda.')
    }
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password123')
    setError('')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <div className="w-full border-b border-border bg-background shrink-0 relative z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between w-full">
          <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">BMSC</span>
          </a>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <a href="/#fitur" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
              <a href="/#alur-kerja" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Alur Kerja</a>
              <a href="/#testimoni" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimoni</a>
            </nav>
            <button 
              id="landing-login-btn" 
              onClick={() => document.getElementById('email')?.focus()}
              className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
            >
              Masuk <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left panel — decorative */}
        <div className="hidden lg:flex flex-col w-1/2 bg-slate-900 relative overflow-hidden p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-2.5 mb-auto">
          <div className="h-9 w-9 rounded-lg bg-orange-500 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">BMSC</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Satu Platform untuk
            <br />
            <span className="text-orange-400">Semua Peran.</span>
          </h2>
          <ul className="space-y-4">
            {[
              { icon: '📊', text: 'Dashboard analytics real-time untuk admin' },
              { icon: '🎬', text: '6 fase project dari konsep hingga upload' },
              { icon: '💳', text: 'Kelola invoice & pembayaran transparan' },
              { icon: '💬', text: 'Chat real-time per project' },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-slate-300">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-slate-500 text-xs">
          © 2025 BMSC — Brand & Content Management System
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">BMSC</span>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-foreground mb-1.5">Selamat Datang</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Masuk ke akun BMSC Anda untuk melanjutkan.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">
                Username / Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan username atau email"
                required
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-orange-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memverifikasi...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  )
}
