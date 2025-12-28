import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function useToast() {
  const { t } = useTranslation('common')

  const success = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    })
  }

  const error = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    })
  }

  const info = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    })
  }

  const warning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4500,
    })
  }

  const loading = (message: string) => {
    return toast.loading(message)
  }

  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId)
  }

  const promise = <T,>(
    promiseFn: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promiseFn, messages)
  }

  // Pre-built common toasts with translations
  const savedSuccess = () => success(t('toast.saved'))
  const saveError = () => error(t('toast.saveError'))
  const loginSuccess = () => success(t('toast.loginSuccess'))
  const logoutSuccess = () => success(t('toast.logoutSuccess'))
  const registerSuccess = () => success(t('toast.registerSuccess'))
  const profileUpdated = () => success(t('toast.profileUpdated'))
  const settingsSaved = () => success(t('toast.settingsSaved'))
  const networkError = () => error(t('toast.networkError'))

  return {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
    promise,
    // Pre-built toasts
    savedSuccess,
    saveError,
    loginSuccess,
    logoutSuccess,
    registerSuccess,
    profileUpdated,
    settingsSaved,
    networkError,
  }
}

// Direct export for use outside React components
export { toast }
