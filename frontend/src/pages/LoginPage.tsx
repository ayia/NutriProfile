import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { Salad, AlertTriangle, Check, Eye, EyeOff, Lock, Sparkles } from '@/lib/icons'
import type { LoginCredentials } from '@/types'

export function LoginPage() {
  const { t } = useTranslation('auth')
  const { login, isLoggingIn, loginError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, touchedFields, isValid } } = useForm<LoginCredentials>({
    mode: 'onChange'
  })

  const onSubmit = (data: LoginCredentials) => {
    login(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 relative overflow-hidden px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-100/50 to-emerald-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-secondary-100/50 to-cyan-100/50 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass-card p-8 shadow-xl">
          {/* En-tête amélioré */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-emerald-400 rounded-2xl blur-lg opacity-40" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                <Salad className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-6 tracking-tight">{t('login.title')}</h1>
            <p className="text-gray-500 mt-2">{t('login.subtitle')}</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-gradient-to-r from-error-50 to-rose-50 border border-error-200 text-error-600 rounded-2xl text-sm flex items-center gap-3 animate-fade-in">
              <div className="w-10 h-10 bg-error-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-error-600" />
              </div>
              <span className="font-medium">{t('login.error')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <Input
                id="email"
                type="email"
                label={t('login.email')}
                placeholder={t('login.emailPlaceholder')}
                error={errors.email?.message}
                {...register('email', {
                  required: t('login.emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('login.emailInvalid'),
                  },
                })}
              />
              {touchedFields.email && !errors.email && (
                <span className="absolute right-3 top-9 text-success-500 animate-scale-in"><Check className="w-4 h-4" /></span>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label={t('login.password')}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password', {
                    required: t('login.passwordRequired'),
                    minLength: {
                      value: 8,
                      message: t('login.passwordMinLength'),
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                {/* Remember Me checkbox */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    defaultChecked
                    {...register('rememberMe')}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 transition-colors cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    {t('login.rememberMe')}
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid || isLoggingIn}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-2xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('login.submitting')}</span>
                </>
              ) : (
                t('login.submit')
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-gray-400 text-sm">{t('login.or')}</span>
            </div>
          </div>

          {/* Boutons sociaux */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 glass-card hover:shadow-md hover:-translate-y-0.5 transition-all group"
              disabled
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-500 font-medium">{t('login.googleComingSoon')}</span>
            </button>
          </div>

          <p className="mt-8 text-center text-gray-500">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              {t('login.signUp')}
            </Link>
          </p>
        </div>

        {/* Features hint */}
        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>{t('login.secureLogin')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{t('login.freeForever')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
