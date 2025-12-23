import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ForgotPasswordForm {
  email: string
}

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ForgotPasswordForm>()
  const email = watch('email')

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    // Simuler l'envoi (à remplacer par l'API réelle)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✉️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Email envoyé !
          </h1>
          <p className="text-gray-600 mb-6">
            Si un compte existe avec l'adresse <strong>{email}</strong>,
            vous recevrez un lien de réinitialisation dans quelques minutes.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Vérifiez également vos spams si vous ne voyez pas l'email.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        {/* En-tête */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-600 mt-2">
            Pas de panique ! Entrez votre email et nous vous enverrons un lien de réinitialisation.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Adresse email"
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

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Envoyer le lien de réinitialisation
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Conseils de sécurité */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Conseils de sécurité
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Utilisez un mot de passe unique pour NutriProfile
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Minimum 8 caractères avec majuscules et chiffres
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Ne partagez jamais vos identifiants
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
