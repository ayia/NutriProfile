import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'

export function HomePage() {
  const { t } = useTranslation('home')
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Scroll reveal animation
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.reveal').forEach((el) => {
      observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  const features = [
    {
      icon: '📸',
      title: t('features.visionScan.title'),
      description: t('features.visionScan.description'),
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
    },
    {
      icon: '🎯',
      title: t('features.personalizedProfile.title'),
      description: t('features.personalizedProfile.description'),
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
    },
    {
      icon: '🤖',
      title: t('features.aiCoach.title'),
      description: t('features.aiCoach.description'),
      color: 'from-primary-500 to-emerald-500',
      bgColor: 'from-primary-50 to-emerald-50',
    },
    {
      icon: '📊',
      title: t('features.smartTracking.title'),
      description: t('features.smartTracking.description'),
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-50 to-amber-50',
    },
    {
      icon: '🍳',
      title: t('features.personalizedRecipes.title'),
      description: t('features.personalizedRecipes.description'),
      color: 'from-red-500 to-rose-500',
      bgColor: 'from-red-50 to-rose-50',
    },
    {
      icon: '🏆',
      title: t('features.gamification.title'),
      description: t('features.gamification.description'),
      color: 'from-indigo-500 to-violet-500',
      bgColor: 'from-indigo-50 to-violet-50',
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
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-200/50 to-cyan-200/50 rounded-full blur-3xl blob animate-blob" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-full blur-3xl blob animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary-100/30 to-emerald-100/30 rounded-full blur-3xl blob animate-blob" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card text-primary-700 text-sm font-medium mb-8 animate-fade-in-down">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
              </span>
              {t('hero.badge')}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fade-in-up tracking-tight">
              {t('hero.title')}
              <br />
              <span className="text-gradient">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 btn-animated btn-glow text-lg px-8 py-4">
                  <span className="text-xl">🚀</span>
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 hover-lift text-lg px-8 py-4 bg-white/80 backdrop-blur-sm">
                  <span className="text-xl">👋</span>
                  {t('hero.ctaSecondary')}
                </Button>
              </Link>
            </div>

            {/* Stats with glassmorphism */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="glass-card p-6 text-center hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {t('howItWorks.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="reveal stagger-1">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 text-center border border-blue-100/50 hover-lift">
                  <div className="absolute -top-5 -left-5 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30">
                    1
                  </div>
                  <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">📸</div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">{t('howItWorks.step1.title')}</h3>
                  <p className="text-gray-600">
                    {t('howItWorks.step1.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="reveal stagger-2 md:mt-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 text-center border border-purple-100/50 hover-lift">
                  <div className="absolute -top-5 -left-5 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/30">
                    2
                  </div>
                  <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🤖</div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">{t('howItWorks.step2.title')}</h3>
                  <p className="text-gray-600">
                    {t('howItWorks.step2.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="reveal stagger-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-gradient-to-br from-primary-50 to-emerald-50 rounded-3xl p-8 text-center border border-primary-100/50 hover-lift">
                  <div className="absolute -top-5 -left-5 w-12 h-12 bg-gradient-to-br from-primary-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-primary-500/30">
                    3
                  </div>
                  <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">📊</div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">{t('howItWorks.step3.title')}</h3>
                  <p className="text-gray-600">
                    {t('howItWorks.step3.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* App Preview */}
          <div className="reveal mt-20">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-2 md:p-3 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden">
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 bg-red-400 rounded-full hover:bg-red-500 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full hover:bg-green-500 transition-colors cursor-pointer"></div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-500 border">
                        {t('preview.title')}
                      </div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                    {/* Food image */}
                    <div className="relative group/img">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-lg opacity-20" />
                      <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl aspect-video flex items-center justify-center border border-orange-100">
                        <span className="text-8xl transform group-hover/img:scale-110 transition-transform duration-500">🍝</span>
                      </div>
                    </div>
                    {/* Results */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
                        <span className="text-3xl">✅</span>
                        <span className="font-semibold text-primary-800">{t('preview.detected')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="glass-accent p-4 text-center hover-lift cursor-default">
                          <div className="text-3xl font-bold text-orange-600">520</div>
                          <div className="text-xs font-medium text-orange-700 mt-1">{t('preview.calories')}</div>
                        </div>
                        <div className="bg-blue-50/80 backdrop-blur border border-blue-100 rounded-2xl p-4 text-center hover-lift cursor-default">
                          <div className="text-3xl font-bold text-blue-600">28g</div>
                          <div className="text-xs font-medium text-blue-700 mt-1">{t('preview.protein')}</div>
                        </div>
                        <div className="bg-yellow-50/80 backdrop-blur border border-yellow-100 rounded-2xl p-4 text-center hover-lift cursor-default">
                          <div className="text-3xl font-bold text-yellow-600">65g</div>
                          <div className="text-xs font-medium text-yellow-700 mt-1">{t('preview.carbs')}</div>
                        </div>
                        <div className="bg-pink-50/80 backdrop-blur border border-pink-100 rounded-2xl p-4 text-center hover-lift cursor-default">
                          <div className="text-3xl font-bold text-pink-600">18g</div>
                          <div className="text-xs font-medium text-pink-700 mt-1">{t('preview.fat')}</div>
                        </div>
                      </div>
                      <div className="glass-primary p-4 flex items-center gap-3">
                        <span className="text-2xl">💚</span>
                        <span className="text-sm font-medium text-primary-800">{t('preview.feedback')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`reveal stagger-${(index % 6) + 1}`}
              >
                <div className="card-feature group h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-100/50 to-cyan-100/50 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className={`reveal stagger-${index + 1}`}
              >
                <div className="glass-card p-8 h-full hover-lift">
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.text}"</p>
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-3xl shadow-inner">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-primary-600 font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-animated" />
        <div className="absolute inset-0 bg-black/10" />

        {/* Floating shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 reveal">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {t('cta.title')}
          </h2>
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('cta.subtitle')}
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="!bg-white !text-primary-600 hover:!bg-gray-50 gap-2 shadow-2xl hover:shadow-white/20 text-lg px-10 py-5 hover-lift"
            >
              <span className="text-xl">🚀</span>
              {t('cta.button')}
            </Button>
          </Link>
          <p className="text-white/70 text-sm mt-6">
            {t('cta.note')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">🥗</span>
                <span className="text-2xl font-bold text-white">NutriProfile</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {t('footer.tagline')}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-5 text-lg">{t('footer.product')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/#features" className="hover:text-white transition-colors">{t('footer.features')}</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">{t('footer.pricing')}</Link></li>
                <li><Link to="/pricing#faq" className="hover:text-white transition-colors">{t('footer.faq')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-5 text-lg">{t('footer.legal')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link></li>
                <li><Link to="/privacy#cookies" className="hover:text-white transition-colors">{t('footer.cookies')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-5 text-lg">{t('footer.contact')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="mailto:support@nutriprofile.app" className="hover:text-white transition-colors">{t('footer.support')}</a></li>
                <li><a href="mailto:contact@nutriprofile.app" className="hover:text-white transition-colors">contact@nutriprofile.app</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            {t('footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  )
}
