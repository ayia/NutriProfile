import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import type { RegisterData } from '@/types'

interface RegisterFormData extends RegisterData {
  confirmPassword: string
  acceptTerms: boolean
}

export function RegisterPage() {
  const { t } = useTranslation('auth')
  const { register: registerUser, isRegistering, registerError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
    watch,
  } = useForm<RegisterFormData>({
    mode: 'onChange',
  })

  const password = watch('password', '')

  // Calculer la force du mot de passe
  const passwordStrength = useMemo(() => {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 1) return { score, label: t('register.passwordStrength.weak'), color: 'from-error-500 to-rose-500', bg: 'bg-error-500' }
    if (score <= 2) return { score, label: t('register.passwordStrength.medium'), color: 'from-warning-500 to-amber-500', bg: 'bg-warning-500' }
    if (score <= 3) return { score, label: t('register.passwordStrength.good'), color: 'from-warning-400 to-yellow-400', bg: 'bg-yellow-500' }
    if (score <= 4) return { score, label: t('register.passwordStrength.strong'), color: 'from-success-500 to-emerald-500', bg: 'bg-success-500' }
    return { score, label: t('register.passwordStrength.excellent'), color: 'from-primary-500 to-emerald-500', bg: 'bg-primary-500' }
  }, [password, t])

  const onSubmit = (data: RegisterData) => {
    registerUser(data)
  }

  const passwordRequirements = [
    { test: password.length >= 8, label: t('register.requirements.minLength') },
    { test: /[A-Z]/.test(password), label: t('register.requirements.uppercase') },
    { test: /[a-z]/.test(password), label: t('register.requirements.lowercase') },
    { test: /\d/.test(password), label: t('register.requirements.number') },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-secondary-50 relative overflow-hidden px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-secondary-100/50 to-cyan-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-100/50 to-emerald-100/50 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass-card p-8 shadow-xl">
          {/* En-tête amélioré */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-400 to-cyan-400 rounded-2xl blur-lg opacity-40" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-secondary-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                <span className="text-4xl">🎉</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-6 tracking-tight">{t('register.title')}</h1>
            <p className="text-gray-500 mt-2">{t('register.subtitle')}</p>
          </div>

          {registerError && (
            <div className="mb-6 p-4 bg-gradient-to-r from-error-50 to-rose-50 border border-error-200 text-error-600 rounded-2xl text-sm flex items-center gap-3 animate-fade-in">
              <div className="w-10 h-10 bg-error-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⚠️</span>
              </div>
              <span className="font-medium">{t('register.error')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nom */}
            <div className="relative">
              <Input
                id="name"
                type="text"
                label={t('register.name')}
                placeholder={t('register.namePlaceholder')}
                error={errors.name?.message}
                {...register('name', {
                  required: t('register.nameRequired'),
                  minLength: {
                    value: 2,
                    message: t('register.nameMinLength'),
                  },
                })}
              />
              {touchedFields.name && !errors.name && (
                <span className="absolute right-3 top-9 text-success-500 animate-scale-in">✓</span>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <Input
                id="email"
                type="email"
                label={t('register.email')}
                placeholder={t('register.emailPlaceholder')}
                error={errors.email?.message}
                {...register('email', {
                  required: t('register.emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('register.emailInvalid'),
                  },
                })}
              />
              {touchedFields.email && !errors.email && (
                <span className="absolute right-3 top-9 text-success-500 animate-scale-in">✓</span>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label={t('register.password')}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password', {
                    required: t('register.passwordRequired'),
                    minLength: {
                      value: 8,
                      message: t('register.passwordMinLength'),
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Indicateur de force */}
              {password && (
                <div className="mt-3 animate-fade-in">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${passwordStrength.color} transition-all duration-500 ease-out`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${passwordStrength.bg.replace('bg-', 'text-')}`}>
                      {passwordStrength.label}
                    </span>
                  </div>

                  {/* Checklist des exigences */}
                  <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-gray-50 rounded-xl">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.label}
                        className={`flex items-center gap-2 text-xs transition-colors ${
                          req.test ? 'text-success-600' : 'text-gray-400'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          req.test ? 'bg-success-100 text-success-600' : 'bg-gray-200'
                        }`}>
                          {req.test ? '✓' : '○'}
                        </span>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmer mot de passe */}
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label={t('register.confirmPassword')}
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: t('register.confirmPasswordRequired'),
                  validate: (value) =>
                    value === watch('password') || t('register.passwordMismatch'),
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
              {touchedFields.confirmPassword && !errors.confirmPassword && watch('confirmPassword') && (
                <span className="absolute right-10 top-9 text-success-500 animate-scale-in">✓</span>
              )}
            </div>

            {/* Conditions avec checkbox obligatoire */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    className="w-5 h-5 rounded border-2 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors cursor-pointer"
                    {...register('acceptTerms', {
                      required: t('register.termsRequired'),
                    })}
                  />
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {t('register.termsAccept')}{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700 hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                    {t('register.termsLink')}
                  </Link>{' '}
                  {t('register.and')}{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700 hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                    {t('register.privacyLink')}
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || isRegistering}
              className="w-full py-4 bg-gradient-to-r from-secondary-500 to-cyan-500 text-white rounded-2xl font-semibold shadow-lg shadow-secondary-500/30 hover:shadow-xl hover:shadow-secondary-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {isRegistering ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Création du compte...</span>
                </>
              ) : (
                t('register.submit')
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-gray-400 text-sm">{t('register.or')}</span>
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
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-500 font-medium">{t('register.googleComingSoon')}</span>
            </button>
          </div>

          <p className="mt-8 text-center text-gray-500">
            {t('register.hasAccount')}{' '}
            <Link to="/login" className="text-secondary-600 hover:text-secondary-700 font-semibold transition-colors">
              {t('register.signIn')}
            </Link>
          </p>
        </div>

        {/* Features hint */}
        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span>Suivi personnalisé</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🤖</span>
            <span>IA nutritionnelle</span>
          </div>
        </div>
      </div>
    </div>
  )
}
