import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import type { LoginCredentials } from '@/types'

export function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, touchedFields, isValid } } = useForm<LoginCredentials>({
    mode: 'onChange'
  })

  const onSubmit = (data: LoginCredentials) => {
    login(data)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card-elevated p-8">
        {/* En-tête amélioré */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 gradient-vitality rounded-full flex items-center justify-center mx-auto mb-4 shadow-elevated">
            <span className="text-3xl">🥗</span>
          </div>
          <h1 className="heading-2">Bon retour !</h1>
          <p className="body-md mt-1">Connectez-vous pour continuer</p>
        </div>

        {loginError && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-600 rounded-xl text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>Email ou mot de passe incorrect</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="flex justify-end mt-1">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoggingIn}
            disabled={!isValid}
          >
            Se connecter
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

        {/* Boutons sociaux (placeholder pour future implémentation) */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
            disabled
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-neutral-500">Bientôt disponible</span>
          </button>
        </div>

        <p className="mt-6 text-center body-md">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  )
}
