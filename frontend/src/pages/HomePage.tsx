import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

const features = [
  {
    icon: '📸',
    title: 'Scan Vision IA',
    description: 'Photographiez votre repas et obtenez instantanément les valeurs nutritionnelles grâce à notre IA',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🎯',
    title: 'Profil Personnalisé',
    description: 'Un plan nutritionnel adapté à vos objectifs : perte de poids, prise de muscle ou maintien',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: '🤖',
    title: 'Coach IA Multi-Agents',
    description: 'Des recommandations validées par plusieurs modèles IA pour une précision maximale',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: '📊',
    title: 'Suivi Intelligent',
    description: 'Visualisez vos progrès avec des graphiques détaillés et des rapports hebdomadaires',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: '🍳',
    title: 'Recettes Personnalisées',
    description: 'Des recettes générées par IA selon vos goûts, restrictions et objectifs',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: '🏆',
    title: 'Gamification',
    description: 'Gagnez des points XP, débloquez des badges et maintenez votre streak quotidien',
    color: 'from-indigo-500 to-violet-500',
  },
]

const testimonials = [
  {
    name: 'Marie L.',
    role: 'A perdu 8kg en 3 mois',
    avatar: '👩',
    text: "L'analyse photo est incroyablement précise ! Je n'ai plus besoin de peser mes aliments.",
    rating: 5,
  },
  {
    name: 'Thomas R.',
    role: 'Sportif amateur',
    avatar: '👨',
    text: 'Les recommandations protéiques sont parfaitement adaptées à mes entraînements.',
    rating: 5,
  },
  {
    name: 'Sophie M.',
    role: 'Végétarienne',
    avatar: '👩‍🦰',
    text: 'Enfin une app qui comprend mon régime alimentaire et me propose des alternatives !',
    rating: 5,
  },
]

const stats = [
  { value: '50K+', label: 'Utilisateurs actifs' },
  { value: '2M+', label: 'Repas analysés' },
  { value: '98%', label: 'Précision IA' },
  { value: '4.9', label: 'Note moyenne' },
]

export function HomePage() {
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
              Nouveau : Analyse santé personnalisée !
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Votre nutrition,
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
                propulsée par l'IA
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Photographiez vos repas, obtenez des analyses instantanées et des recommandations personnalisées.
              Atteignez vos objectifs santé avec NutriProfile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <span>🚀</span>
                  Commencer gratuitement
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <span>👋</span>
                  J'ai déjà un compte
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
              Comment ça fonctionne ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              En 3 étapes simples, transformez votre alimentation
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
                <h3 className="font-semibold text-lg mb-2">Photographiez</h3>
                <p className="text-gray-600 text-sm">
                  Prenez en photo votre assiette sous n'importe quel angle
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
                <h3 className="font-semibold text-lg mb-2">Analyse IA</h3>
                <p className="text-gray-600 text-sm">
                  Notre IA identifie les aliments et calcule les nutriments
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
                <h3 className="font-semibold text-lg mb-2">Résultats</h3>
                <p className="text-gray-600 text-sm">
                  Recevez un rapport santé détaillé avec des conseils personnalisés
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
                <span className="ml-4 text-sm text-gray-500">NutriProfile - Analyse Vision</span>
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
                    <span className="font-medium">Pâtes à la bolognaise détectées</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">520</div>
                      <div className="text-xs text-orange-700">Calories</div>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">28g</div>
                      <div className="text-xs text-blue-700">Protéines</div>
                    </div>
                    <div className="bg-yellow-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-600">65g</div>
                      <div className="text-xs text-yellow-700">Glucides</div>
                    </div>
                    <div className="bg-pink-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-pink-600">18g</div>
                      <div className="text-xs text-pink-700">Lipides</div>
                    </div>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3 flex items-center gap-2">
                    <span className="text-xl">💚</span>
                    <span className="text-sm text-green-800">Bon équilibre protéines/glucides !</span>
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
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des fonctionnalités puissantes pour atteindre vos objectifs
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
              Ils ont transformé leur alimentation
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez les témoignages de notre communauté
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
            Prêt à transformer votre alimentation ?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui ont déjà atteint leurs objectifs avec NutriProfile
          </p>
          <Link to="/register">
            <Button size="lg" className="!bg-white !text-primary-600 hover:!bg-gray-100 gap-2 shadow-xl">
              <span>🚀</span>
              Commencer maintenant - C'est gratuit !
            </Button>
          </Link>
          <p className="text-primary-200 text-sm mt-4">
            Aucune carte bancaire requise
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
                Votre compagnon nutrition intelligent propulsé par l'IA
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white">Tarifs</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white">CGU</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">contact@nutriprofile.app</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2024 NutriProfile. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
