import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Bienvenue sur NutriProfile
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Votre application de nutrition personnalisée propulsée par l'intelligence artificielle.
        Obtenez des recommandations adaptées à vos besoins.
      </p>
      <div className="flex gap-4">
        <Link to="/register">
          <Button size="lg">Commencer gratuitement</Button>
        </Link>
        <Link to="/login">
          <Button variant="outline" size="lg">Se connecter</Button>
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="font-semibold text-lg mb-2">Profil Personnalisé</h3>
          <p className="text-gray-600">Analyse complète de vos besoins nutritionnels</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <div className="text-3xl mb-4">🤖</div>
          <h3 className="font-semibold text-lg mb-2">IA Multi-Agents</h3>
          <p className="text-gray-600">Recommandations validées par plusieurs modèles IA</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="font-semibold text-lg mb-2">Suivi Quotidien</h3>
          <p className="text-gray-600">Suivez vos progrès et ajustez vos objectifs</p>
        </div>
      </div>
    </div>
  )
}
