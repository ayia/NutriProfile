import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import type { LoginCredentials } from '@/types'

export function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>()

  const onSubmit = (data: LoginCredentials) => {
    login(data)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>

        {loginError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            Email ou mot de passe incorrect
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Input
            id="password"
            type="password"
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

          <Button type="submit" className="w-full" isLoading={isLoggingIn}>
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Pas encore de compte?{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
