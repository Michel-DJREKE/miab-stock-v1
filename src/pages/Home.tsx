
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Shield,
  CheckCircle,
  Star,
  ArrowRight,
  Smartphone,
  Cloud,
  Zap
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Package,
      title: "Gestion d'inventaire intelligente",
      description: "Suivez vos stocks en temps réel avec des alertes automatiques pour éviter les ruptures"
    },
    {
      icon: BarChart3,
      title: "Analyses détaillées",
      description: "Visualisez vos performances avec des rapports complets et des insights métier"
    },
    {
      icon: Users,
      title: "Gestion clients complète",
      description: "Centralisez les informations de vos clients et fidélisez votre clientèle"
    },
    {
      icon: ShoppingCart,
      title: "Ventes simplifiées",
      description: "Processus de vente rapide et intuitif avec support multi-paiements"
    },
    {
      icon: TrendingUp,
      title: "Croissance optimisée",
      description: "Prenez des décisions éclairées grâce aux données et analytics avancés"
    },
    {
      icon: Shield,
      title: "Sécurisé et fiable",
      description: "Vos données sont protégées, sauvegardées et accessibles 24h/24"
    }
  ];

  const benefits = [
    "Interface intuitive et moderne",
    "Synchronisation multi-appareils",
    "Rapports automatisés",
    "Support technique inclus",
    "Mises à jour gratuites",
    "Sauvegarde automatique"
  ];

  const testimonials = [
    {
      name: "Fatou Diallo",
      business: "Boutique Mode Dakar",
      content: "Miabé Stock a révolutionné ma gestion. Je n'ai plus de problèmes de stock et mes ventes ont augmenté de 30%.",
      rating: 5
    },
    {
      name: "Moussa Traoré",
      business: "Pharmacie Centrale",
      content: "L'interface est très simple. Mes employés ont appris à l'utiliser en quelques minutes seulement.",
      rating: 5
    },
    {
      name: "Aminata Sy",
      business: "Épicerie du Quartier",
      content: "Les alertes de stock faible m'ont fait économiser beaucoup d'argent en évitant les ruptures.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-2xl font-bold">Miabé Stock</span>
                <div className="text-xs text-muted-foreground">Gestion d'inventaire intelligente</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline">Se connecter</Button>
              </Link>
              <Link to="/auth">
                <Button>Essai gratuit</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Gérez votre stock comme un pro
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Miabé Stock vous offre une solution complète et intuitive pour gérer votre inventaire, 
            suivre vos ventes et analyser vos performances. Spécialement conçu pour les entreprises africaines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-3">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-3">
              Voir la démo
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Essai gratuit 14 jours
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Sans engagement
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Support technique inclus
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des fonctionnalités puissantes et simples à utiliser pour faire grandir votre business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Pourquoi choisir Miabé Stock ?</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Nous comprenons les défis uniques des entreprises africaines et avons conçu 
                une solution qui s'adapte à votre contexte et vos besoins spécifiques.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-2xl p-8">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div className="font-semibold">Mobile</div>
                  <div className="text-sm text-muted-foreground">Optimisé</div>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Cloud className="w-6 h-6 text-primary" />
                  </div>
                  <div className="font-semibold">Cloud</div>
                  <div className="text-sm text-muted-foreground">Sécurisé</div>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="font-semibold">Rapide</div>
                  <div className="text-sm text-muted-foreground">Performant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Ce que disent nos clients</h2>
            <p className="text-xl text-muted-foreground">
              Des milliers d'entrepreneurs nous font confiance
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-primary to-blue-600 border-0 text-primary-foreground">
            <CardContent className="text-center p-12">
              <h2 className="text-3xl font-bold mb-4">Prêt à transformer votre business ?</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Rejoignez des milliers d'entrepreneurs qui utilisent Miabé Stock pour optimiser 
                leur gestion d'inventaire et booster leurs ventes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-3">
                    Créer mon compte gratuitement
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Contacter un expert
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Miabé Stock</span>
              </div>
              <p className="text-muted-foreground">
                La solution de gestion d'inventaire pensée pour l'Afrique.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-foreground">Tarifs</a></li>
                <li><a href="#" className="hover:text-foreground">Démo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Formation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">À propos</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Carrières</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 mt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Miabé Stock. Tous droits réservés. Fait par le Groupe 6 d'exposer.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
