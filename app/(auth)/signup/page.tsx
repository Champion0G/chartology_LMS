'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, User, ChevronRight, Compass, Sparkles } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Signup failed')
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
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-accent-purple-dim rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-accent-cyan-dim rounded-full blur-[120px] animate-pulse-glow delay-700"></div>
      </div>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-bg-secondary rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 fade-up">
        {/* Left Column: Branding Section */}
        <section className="hidden lg:flex flex-col justify-between p-12 bg-white/[0.02] relative overflow-hidden border-right border-white/5">
          <div className="z-10">
            <div className="flex items-center gap-3 mb-12 animate-float">
               <div className="w-12 h-12 bg-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-accent-purple/20">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
              </div>
              <span className="font-headline font-extrabold text-2xl tracking-tight text-white">Chartology LMS</span>
            </div>
            
            <h1 className="font-headline text-5xl font-bold leading-tight mb-6 text-white max-w-sm">
              Start your journey to <span className="gradient-text">Mastery.</span>
            </h1>
            <p className="text-text-secondary text-lg max-w-sm leading-relaxed mb-8">
              Join a community of dedicated scholars. Access curated resources, track your growth, and unlock your true potential.
            </p>

             <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-accent-cyan-dim flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform">
                        <Compass size={20} />
                    </div>
                    <div>
                        <div className="text-white font-bold text-sm">Curated Path</div>
                        <div className="text-text-muted text-xs">Structured learning for maximum retention</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-accent-purple-dim flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <div className="text-white font-bold text-sm">Gamified Growth</div>
                        <div className="text-text-muted text-xs">Earn XP and level up as you learn</div>
                    </div>
                </div>
             </div>
          </div>

          <div className="mt-12 text-center z-10 px-6 py-4 rounded-2xl bg-accent-cyan-dim border border-accent-cyan/10">
             <p className="text-xs text-accent-cyan font-bold uppercase tracking-widest leading-relaxed">
                Note: Teacher accounts are provisioned by administrators. <br/>Apply for instructor status via the help center.
             </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-accent-purple-dim rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-accent-cyan-dim rounded-full blur-3xl opacity-20"></div>
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
              <h2 className="font-headline text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
              <p className="text-text-secondary text-sm">Join the platform as a student.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-danger-dim border border-danger/20 rounded-xl text-danger text-sm animate-shake">
                  {error}
                </div>
              )}

              <div className="group relative">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 group-focus-within:text-accent-cyan transition-colors" htmlFor="name">Full Name</label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" size={18} />
                  <input 
                    className="w-full bg-transparent border-b border-white/10 rounded-none px-8 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-all" 
                    id="name" 
                    type="text" 
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

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
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest group-focus-within:text-accent-cyan transition-colors" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" size={18} />
                  <input 
                    className="w-full bg-transparent border-b border-white/10 rounded-none px-8 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-all" 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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

              <div className="pt-2">
                 <p className="text-[11px] text-text-muted leading-relaxed">
                    By clicking "Create Account", you agree to our <Link href="#" className="underline hover:text-accent-cyan transition-colors">Terms of Service</Link> and <Link href="#" className="underline hover:text-accent-cyan transition-colors">Privacy Policy</Link>.
                 </p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-4 rounded-2xl shadow-xl shadow-accent-cyan/10 transition-all flex items-center justify-center gap-2 group overflow-hidden"
              >
                <span className="relative z-10">{loading ? 'Creating account...' : 'Create Account'}</span>
                {!loading && <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-sm text-text-secondary font-medium">
                Already have an account?{' '}
                <Link href="/login" className="text-accent-cyan font-bold hover:underline">Sign In</Link>
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
