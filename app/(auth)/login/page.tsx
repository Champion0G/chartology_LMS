'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, GraduationCap, ShieldCheck, ChevronRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Invalid credentials')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-accent-cyan-dim rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-accent-purple-dim rounded-full blur-[120px] animate-pulse-glow delay-500"></div>
      </div>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-bg-secondary rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 fade-up">
        {/* Left Column: Branding Section */}
        <section className="hidden lg:flex flex-col justify-between p-12 bg-white/[0.02] relative overflow-hidden border-right border-white/5">
          <div className="z-10">
            <div className="flex items-center gap-3 mb-12 animate-float">
              <div className="w-12 h-12 bg-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-accent-cyan/20">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
              </div>
              <span className="font-headline font-extrabold text-2xl tracking-tight text-white">Chartology LMS</span>
            </div>
            
            <h1 className="font-headline text-5xl font-bold leading-tight mb-6 text-white max-w-sm">
              Where knowledge finds its <span className="gradient-text">rhythm.</span>
            </h1>
            <p className="text-text-secondary text-lg max-w-sm leading-relaxed mb-8">
              A thoughtfully designed space for scholars and educators to engage with deep learning and mastery.
            </p>
          </div>

          <div className="relative mt-8 aspect-square z-10 max-w-xs mx-auto">
            <div className="absolute inset-0 bg-accent-purple/10 rounded-3xl backdrop-blur-sm -rotate-6 animate-pulse-glow"></div>
            <div className="absolute inset-0 bg-accent-cyan/5 rounded-3xl border border-white/10 rotate-3 backdrop-blur-md"></div>
            <div className="relative z-20 w-full h-full p-4 flex flex-col justify-center items-center gap-4">
               <div className="w-24 h-24 rounded-full bg-gradient p-1">
                  <div className="w-full h-full rounded-full bg-bg-secondary flex items-center justify-center">
                    <GraduationCap size={40} className="text-accent-cyan" />
                  </div>
               </div>
               <div className="text-center">
                  <div className="text-white font-bold text-xl">Institution Grade</div>
                  <div className="text-text-muted text-sm uppercase tracking-widest mt-1">Lumina Academy Certified</div>
               </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-accent-cyan-dim rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-accent-purple-dim rounded-full blur-3xl opacity-20"></div>
        </section>

        {/* Right Column: Form Section */}
        <section className="p-8 md:p-16 flex flex-col justify-center relative bg-bg-secondary">
          <div className="max-w-sm mx-auto w-full">
            {/* Mobile Branding */}
            <div className="lg:hidden flex items-center gap-2 mb-10">
              <div className="w-8 h-8 bg-gradient rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
              </div>
              <span className="font-headline font-bold text-xl text-white">Chartology</span>
            </div>

            <div className="mb-10">
              <h2 className="font-headline text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h2>
              <p className="text-text-secondary text-sm">Please enter your details to access your hub.</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button 
                onClick={() => setRole('STUDENT')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-300 ${
                  role === 'STUDENT' 
                  ? 'border-accent-cyan bg-accent-cyan/5 text-accent-cyan ring-4 ring-accent-cyan/10' 
                  : 'border-transparent bg-white/5 text-text-muted hover:bg-white/10'
                }`}
              >
                <GraduationCap size={18} />
                <span className="text-sm font-semibold">Student</span>
              </button>
              <button 
                onClick={() => setRole('TEACHER')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-300 ${
                  role === 'TEACHER' 
                  ? 'border-accent-cyan bg-accent-cyan/5 text-accent-cyan ring-4 ring-accent-cyan/10' 
                  : 'border-transparent bg-white/5 text-text-muted hover:bg-white/10'
                }`}
              >
                <ShieldCheck size={18} />
                <span className="text-sm font-semibold">Instructor</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-danger-dim border border-danger/20 rounded-xl text-danger text-sm animate-shake">
                  {error}
                </div>
              )}

              <div className="group relative">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 group-focus-within:text-accent-cyan transition-colors" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" size={18} />
                  <input 
                    className="w-full bg-transparent border-b border-white/10 rounded-none px-8 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-all" 
                    id="email" 
                    type="email" 
                    placeholder="name@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="group relative">
                <div className="flex justify-between mb-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest group-focus-within:text-accent-cyan transition-colors" htmlFor="password">Password</label>
                  <Link href="#" className="text-xs font-bold text-accent-cyan hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" size={18} />
                  <input 
                    className="w-full bg-transparent border-b border-white/10 rounded-none px-8 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-all" 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 group cursor-pointer">
                <div className="relative flex items-center">
                  <input className="peer appearance-none w-5 h-5 rounded border-2 border-white/10 bg-white/5 checked:bg-accent-cyan checked:border-accent-cyan transition-all cursor-pointer" id="remember" type="checkbox" />
                  <ChevronRight size={12} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <label className="text-sm text-text-secondary font-medium select-none cursor-pointer group-hover:text-white transition-colors" htmlFor="remember">Keep me logged in</label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-4 rounded-2xl shadow-xl shadow-accent-cyan/10 transition-all flex items-center justify-center gap-2 group overflow-hidden"
              >
                <span className="relative z-10">{loading ? 'Processing...' : 'Sign In'}</span>
                {!loading && <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </form>

            <div className="mt-10 flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/5"></div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Social Connect</span>
              <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 transition-all active:scale-95 group">
                <svg className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-xs font-semibold text-text-secondary">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 transition-all active:scale-95 group">
                <svg className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.152-1.11-1.459-1.11-1.459-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path>
                </svg>
                <span className="text-xs font-semibold text-text-secondary">GitHub</span>
              </button>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-text-secondary font-medium">
                New to the platform?{' '}
                <Link href="/signup" className="text-accent-cyan font-bold hover:underline">Create Account</Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .border-right { border-right: 1px solid rgba(255, 255, 255, 0.05); }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  )
}
