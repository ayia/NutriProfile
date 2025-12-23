import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import type { RegisterData } from '@/types'

interface RegisterFormData extends RegisterData {
  confirmPassword: string
}

// Calculer la force du mot de passe
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Faible', color: 'bg-red-500' }
  if (score <= 2) return { score, label: 'Moyen', color: 'bg-orange-500' }
  if (score <= 3) return { score, label: 'Bon', color: 'bg-yellow-500' }
  if (score <= 4) return { score, label: 'Fort', color: 'bg-green-500' }
  return { score, label: 'Excellent', color: 'bg-emerald-500' }
}

export function RegisterPage() {
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
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

  const onSubmit = (data: RegisterData) => {
    registerUser(data)
  }

  const passwordRequirements = [
    { test: password.length >= 8, label: 'Au moins 8 caractères' },
    { test: /[A-Z]/.test(password), label: 'Une majuscule' },
    { test: /[a-z]/.test(password), label: 'Une minuscule' },
    { test: /\d/.test(password), label: 'Un chiffre' },
  ]

  return (
    <div className="max-w-md mx-auto">
      <div className="card-elevated p-8">
        {/* En-tête amélioré */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 gradient-vitality rounded-full flex items-center justify-center mx-auto mb-4 shadow-elevated">
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="heading-2">Créer un compte</h1>
          <p className="body-md mt-1">
            Rejoignez NutriProfile gratuitement
          </p>
        </div>

        {registerError && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-600 rounded-xl text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>Une erreur est survenue. Veuillez réessayer.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom */}
          <div className="relative">
            <Input
              id="name"
              type="text"
              label="Nom"
              placeholder="Votre nom"
              error={errors.name?.message}
              {...register('name', {
                required: 'Nom requis',
                minLength: {
                  value: 2,
                  message: 'Minimum 2 caractères',
                },
              })}
            />
            {touchedFields.name && !errors.name && (
              <span className="absolute right-3 top-9 text-success-500">✓</span>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="vous@exemple.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email invalide',
                },
              })}
            />
            {touchedFields.email && !errors.email && (
              <span className="absolute right-3 top-9 text-success-500">✓</span>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Mot de passe requis',
                  minLength: {
                    value: 8,
                    message: 'Minimum 8 caractères',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Indicateur de force */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                    {passwordStrength.label}
                  </span>
                </div>

                {/* Checklist des exigences */}
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-1 text-xs ${
                        req.test ? 'text-success-600' : 'text-neutral-400'
                      }`}
                    >
                      <span>{req.test ? '✓' : '○'}</span>
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
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirmation requise',
                validate: (value) =>
                  value === watch('password') || 'Les mots de passe ne correspondent pas',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
            {touchedFields.confirmPassword && !errors.confirmPassword && watch('confirmPassword') && (
              <span className="absolute right-10 top-9 text-success-500">✓</span>
            )}
          </div>

          {/* Conditions */}
          <div className="text-xs text-neutral-500">
            En créant un compte, vous acceptez nos{' '}
            <a href="#" className="text-primary-600 hover:underline">
              Conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="#" className="text-primary-600 hover:underline">
              Politique de confidentialité
            </a>
            .
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isRegistering}
            disabled={!isValid}
          >
            Créer mon compte
          </Button>
        </form>

        {/* Séparateur */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-neutral-500">ou</span>
          </div>
        </div>

        {/* Boutons sociaux (placeholder) */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
            disabled
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span className="text-neutral-500">Bientôt disponible</span>
          </button>
        </div>

        <p className="mt-6 text-center body-md">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
