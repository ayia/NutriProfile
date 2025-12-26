import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

export function HomePage() {
  const { t } = useTranslation('home')

  const features = [
    {
      icon: '📸',
      title: t('features.visionScan.title'),
      description: t('features.visionScan.description'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '🎯',
      title: t('features.personalizedProfile.title'),
      description: t('features.personalizedProfile.description'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: '🤖',
      title: t('features.aiCoach.title'),
      description: t('features.aiCoach.description'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: '📊',
      title: t('features.smartTracking.title'),
      description: t('features.smartTracking.description'),
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: '🍳',
      title: t('features.personalizedRecipes.title'),
      description: t('features.personalizedRecipes.description'),
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: '🏆',
      title: t('features.gamification.title'),
      description: t('features.gamification.description'),
      color: 'from-indigo-500 to-violet-500',
    },
  ]

  const testimonials = [
    {
      name: t('testimonials.marie.name'),
      role: t('testimonials.marie.role'),
      avatar: '👩',
      text: t('testimonials.marie.text'),
      rating: 5,
    },
    {
      name: t('testimonials.thomas.name'),
      role: t('testimonials.thomas.role'),
      avatar: '👨',
      text: t('testimonials.thomas.text'),
      rating: 5,
    },
    {
      name: t('testimonials.sophie.name'),
      role: t('testimonials.sophie.role'),
      avatar: '👩‍🦰',
      text: t('testimonials.sophie.text'),
      rating: 5,
    },
  ]

  const stats = [
    { value: '50K+', label: t('stats.activeUsers') },
    { value: '2M+', label: t('stats.mealsAnalyzed') },
    { value: '98%', label: t('stats.aiAccuracy') },
    { value: '4.9', label: t('stats.averageRating') },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24">
        {/* Fond décoratif */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-200/40 to-green-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium mb-6">
              <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
              {t('hero.badge')}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('hero.title')}
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <span>🚀</span>
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <span>👋</span>
                  {t('hero.ctaSecondary')}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Étape 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 text-center">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  1
                </div>
                <div className="text-6xl mb-4">📸</div>
                <h3 className="font-semibold text-lg mb-2">{t('howItWorks.step1.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('howItWorks.step1.description')}
                </p>
              </div>
            </div>

            {/* Étape 2 */}
            <div className="relative md:mt-8">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  2
                </div>
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="font-semibold text-lg mb-2">{t('howItWorks.step2.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('howItWorks.step2.description')}
                </p>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  3
                </div>
                <div className="text-6xl mb-4">📊</div>
                <h3 className="font-semibold text-lg mb-2">{t('howItWorks.step3.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('howItWorks.step3.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Preview d'écran */}
          <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 md:p-8 shadow-2xl">
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-b">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="ml-4 text-sm text-gray-500">{t('preview.title')}</span>
              </div>
              <div className="p-6 grid md:grid-cols-2 gap-6">
                {/* Image simulée */}
                <div className="bg-gray-200 rounded-xl aspect-video flex items-center justify-center">
                  <span className="text-6xl">🍝</span>
                </div>
                {/* Résultats simulés */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <span className="font-medium">{t('preview.detected')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">520</div>
                      <div className="text-xs text-orange-700">{t('preview.calories')}</div>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">28g</div>
                      <div className="text-xs text-blue-700">{t('preview.protein')}</div>
                    </div>
                    <div className="bg-yellow-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-600">65g</div>
                      <div className="text-xs text-yellow-700">{t('preview.carbs')}</div>
                    </div>
                    <div className="bg-pink-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-pink-600">18g</div>
                      <div className="text-xs text-pink-700">{t('preview.fat')}</div>
                    </div>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3 flex items-center gap-2">
                    <span className="text-xl">💚</span>
                    <span className="text-sm text-green-800">{t('preview.feedback')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-primary-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <Link to="/register">
            <Button size="lg" className="!bg-white !text-primary-600 hover:!bg-gray-100 gap-2 shadow-xl">
              <span>🚀</span>
              {t('cta.button')}
            </Button>
          </Link>
          <p className="text-primary-200 text-sm mt-4">
            {t('cta.note')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🥗</span>
                <span className="text-xl font-bold text-white">NutriProfile</span>
              </div>
              <p className="text-gray-400 text-sm">
                {t('footer.tagline')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">{t('footer.features')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.pricing')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.faq')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">{t('footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.terms')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.cookies')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t('footer.contact')}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">{t('footer.support')}</a></li>
                <li><a href="#" className="hover:text-white">contact@nutriprofile.app</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            {t('footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  )
}
