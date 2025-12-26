import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ForgotPasswordForm {
  email: string
}

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ForgotPasswordForm>()
  const email = watch('email')

  const onSubmit = async (_data: ForgotPasswordForm) => {
    void _data
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
            {t('forgotPassword.successTitle')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('forgotPassword.successMessage')} <strong>{email}</strong>,
            {' '}{t('forgotPassword.successMessage2')}
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              {t('forgotPassword.checkSpam')}
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                {t('forgotPassword.backToLogin')}
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
            {t('forgotPassword.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('forgotPassword.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label={t('forgotPassword.email')}
            placeholder={t('forgotPassword.emailPlaceholder')}
            error={errors.email?.message}
            {...register('email', {
              required: t('forgotPassword.emailRequired'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('forgotPassword.emailInvalid'),
              },
            })}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t('forgotPassword.submit')}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            {t('forgotPassword.rememberPassword')}{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">
              {t('forgotPassword.signIn')}
            </Link>
          </p>
        </div>

        {/* Conseils de sécurité */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            {t('forgotPassword.securityTips')}
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              {t('forgotPassword.tip1')}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              {t('forgotPassword.tip2')}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              {t('forgotPassword.tip3')}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
