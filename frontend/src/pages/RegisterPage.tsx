import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import type { RegisterData } from '@/types'

interface RegisterFormData extends RegisterData {
  confirmPassword: string
}

export function RegisterPage() {
  const { register: registerUser, isRegistering, registerError } = useAuth()
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>()

  const onSubmit = (data: RegisterData) => {
    registerUser(data)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Inscription</h1>

        {registerError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            Une erreur est survenue. Veuillez réessayer.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Input
            id="confirmPassword"
            type="password"
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Confirmation requise',
              validate: (value) => value === watch('password') || 'Les mots de passe ne correspondent pas',
            })}
          />

          <Button type="submit" className="w-full" isLoading={isRegistering}>
            S'inscrire
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Déjà un compte?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
