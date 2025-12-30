import { useEffect, useState, useCallback } from 'react'
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTourStore } from '@/store/tourStore'

interface ProductTourProps {
  tourName: 'dashboard' | 'vision' | 'recipes' | 'tracking'
  steps: Step[]
  autoStart?: boolean
}

export function ProductTour({ tourName, steps, autoStart = true }: ProductTourProps) {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const location = useLocation()
  const { currentTour, setTourCompleted, startTour, endTour } = useTourStore()
  const hasSeenTour = useTourStore((state) => {
    const key = `hasSeen${tourName.charAt(0).toUpperCase() + tourName.slice(1)}Tour` as keyof typeof state
    return state[key] as boolean
  })

  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (autoStart && !hasSeenTour && currentTour === null) {
      // Delay tour start to allow page to render
      const timer = setTimeout(() => {
        startTour(tourName)
        setRun(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [autoStart, hasSeenTour, currentTour, tourName, startTour])

  useEffect(() => {
    if (currentTour === tourName) {
      setRun(true)
    } else {
      setRun(false)
    }
  }, [currentTour, tourName])

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, action, index, type } = data

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setTourCompleted(tourName)
        setRun(false)
        setStepIndex(0)
        return
      }

      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        const nextStep = steps[index + 1]

        // Check if we need to navigate to another page
        if (nextStep?.data?.path && location.pathname !== nextStep.data.path) {
          navigate(nextStep.data.path)
          // Wait for navigation to complete
          setTimeout(() => {
            setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1))
          }, 300)
        } else {
          setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1))
        }
      }

      if (action === ACTIONS.CLOSE) {
        endTour()
        setRun(false)
      }
    },
    [tourName, setTourCompleted, endTour, navigate, location.pathname, steps]
  )

  if (!run) return null

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      spotlightClicks
      callback={handleJoyrideCallback}
      locale={{
        back: t('actions.back'),
        close: t('actions.close'),
        last: t('tour.finish'),
        next: t('actions.next'),
        skip: t('tour.skip'),
      }}
      styles={{
        options: {
          primaryColor: '#059669',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '16px',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 600,
        },
        tooltipContent: {
          fontSize: '14px',
          lineHeight: 1.6,
        },
        buttonNext: {
          backgroundColor: '#059669',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 500,
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: '8px',
        },
        buttonSkip: {
          color: '#9ca3af',
          fontSize: '13px',
        },
        spotlight: {
          borderRadius: '12px',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
      floaterProps={{
        styles: {
          arrow: {
            length: 8,
            spread: 12,
          },
        },
      }}
    />
  )
}
