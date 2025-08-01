
export type Language = 'fr' | 'en';

export interface TranslationData {
  // Navigation
  nav: {
    home: string;
    products: string;
    movements: string;
    sales: string;
    profile: string;
    dashboard: string;
    inventory: string;
    suppliers: string;
    customers: string;
    categories: string;
    settings: string;
  };
  
  // Authentication
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    shopName: string;
    forgotPassword: string;
    signInWithGoogle: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    createAccount: string;
  };
  
  // Homepage
  homepage: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
      joinFirstThousand: string;
    };
    features: {
      title: string;
      inventory: {
        title: string;
        description: string;
      };
      sales: {
        title: string;
        description: string;
      };
      analytics: {
        title: string;
        description: string;
      };
      multilingual: {
        title: string;
        description: string;
      };
    };
    pricing: {
      title: string;
      free: {
        title: string;
        price: string;
        features: string[];
      };
      pro: {
        title: string;
        price: string;
        features: string[];
      };
      enterprise: {
        title: string;
        price: string;
        features: string[];
      };
    };
    testimonials: {
      title: string;
      items: Array<{
        name: string;
        role: string;
        content: string;
      }>;
    };
    faq: {
      title: string;
      items: Array<{
        question: string;
        answer: string;
      }>;
    };
  };
  
  // Dashboard
  dashboard: {
    title: string;
    stats: {
      totalSales: string;
      todaySales: string;
      revenue: string;
      averageBasket: string;
      netProfit: string;
    };
    newSale: string;
    alerts: {
      lowStock: string;
      outOfStock: string;
      expiredProducts: string;
    };
    topProducts: string;
    topCustomers: string;
    topCategories: string;
    seeAll: string;
  };
  
  // Products
  products: {
    title: string;
    addProduct: string;
    name: string;
    description: string;
    barcode: string;
    buyPrice: string;
    sellPrice: string;
    initialStock: string;
    alertThreshold: string;
    category: string;
    expiryDate: string;
    image: string;
    searchProducts: string;
    filterByCategory: string;
    stockStatus: string;
    inStock: string;
    lowStock: string;
    outOfStock: string;
  };
  
  // Sales
  sales: {
    title: string;
    newSale: string;
    customer: string;
    addCustomer: string;
    searchCustomer: string;
    products: string;
    quantity: string;
    price: string;
    total: string;
    discount: string;
    tax: string;
    grandTotal: string;
    paymentMethod: string;
    cash: string;
    mobile: string;
    createSale: string;
    receipt: string;
  };
  
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    loading: string;
    noData: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    success: string;
    error: string;
    welcome: string;
    logout: string;
    settings: string;
  };
}

export const translations: Record<Language, TranslationData> = {
  fr: {
    nav: {
      home: 'Accueil',
      products: 'Produits',
      movements: 'Mouvements',
      sales: 'Ventes',
      profile: 'Profil',
      dashboard: 'Tableau de bord',
      inventory: 'Inventaire',
      suppliers: 'Fournisseurs',
      customers: 'Clients',
      categories: 'Catégories',
      settings: 'Paramètres',
    },
    auth: {
      login: 'Connexion',
      register: 'Inscription',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Téléphone',
      shopName: 'Nom de la boutique',
      forgotPassword: 'Mot de passe oublié ?',
      signInWithGoogle: 'Continuer avec Google',
      dontHaveAccount: "Vous n'avez pas de compte ?",
      alreadyHaveAccount: 'Vous avez déjà un compte ?',
      createAccount: 'Créer un compte',
    },
    homepage: {
      hero: {
        title: 'Gérez votre stock comme un pro avec Miabé Stock',
        subtitle: 'La solution complète de gestion de stock pour commerçants et PME. Simple, puissante et accessible partout.',
        cta: 'Commencer gratuitement',
        joinFirstThousand: 'Rejoignez les 1000 premiers commerçants',
      },
      features: {
        title: 'Pourquoi choisir Miabé Stock ?',
        inventory: {
          title: 'Gestion intelligente du stock',
          description: 'Suivez vos produits en temps réel avec des alertes automatiques.',
        },
        sales: {
          title: 'Ventes simplifiées',
          description: 'Créez des factures professionnelles en quelques clics.',
        },
        analytics: {
          title: 'Analyses avancées',
          description: 'Tableaux de bord et rapports pour optimiser votre business.',
        },
        multilingual: {
          title: 'Multilingue',
          description: 'Interface disponible en français et anglais.',
        },
      },
      pricing: {
        title: 'Tarification transparente',
        free: {
          title: 'Gratuit',
          price: '0 FCFA/mois',
          features: ['100 produits', '50 ventes/mois', 'Support email'],
        },
        pro: {
          title: 'Pro',
          price: '15,000 FCFA/mois',
          features: ['Produits illimités', 'Ventes illimitées', 'Support prioritaire', 'Analyses avancées'],
        },
        enterprise: {
          title: 'Enterprise',
          price: 'Sur mesure',
          features: ['Tout de Pro', 'Multi-boutiques', 'API', 'Support dédié'],
        },
      },
      testimonials: {
        title: 'Ce que disent nos clients',
        items: [
          {
            name: 'Marie Kouakou',
            role: 'Propriétaire boutique',
            content: 'Miabé Stock a révolutionné ma gestion de stock. Simple et efficace !',
          },
          {
            name: 'Jean Koffi',
            role: 'Gérant superette',
            content: 'Les alertes automatiques m\'évitent les ruptures de stock.',
          },
        ],
      },
      faq: {
        title: 'Questions fréquentes',
        items: [
          {
            question: 'Comment commencer ?',
            answer: 'Inscrivez-vous gratuitement et commencez à ajouter vos produits immédiatement.',
          },
          {
            question: 'Puis-je utiliser Miabé Stock sur mobile ?',
            answer: 'Oui, notre interface est optimisée pour mobile et peut être installée comme une app.',
          },
        ],
      },
    },
    dashboard: {
      title: 'Tableau de bord',
      stats: {
        totalSales: 'Ventes totales',
        todaySales: 'Ventes du jour',
        revenue: 'Chiffre d\'affaires',
        averageBasket: 'Panier moyen',
        netProfit: 'Bénéfice net',
      },
      newSale: 'Nouvelle vente',
      alerts: {
        lowStock: 'Stock faible',
        outOfStock: 'Rupture de stock',
        expiredProducts: 'Produits expirés',
      },
      topProducts: 'Top produits',
      topCustomers: 'Meilleurs clients',
      topCategories: 'Top catégories',
      seeAll: 'Voir tout',
    },
    products: {
      title: 'Produits',
      addProduct: 'Ajouter un produit',
      name: 'Nom',
      description: 'Description',
      barcode: 'Code-barres',
      buyPrice: 'Prix d\'achat',
      sellPrice: 'Prix de vente',
      initialStock: 'Stock initial',
      alertThreshold: 'Seuil d\'alerte',
      category: 'Catégorie',
      expiryDate: 'Date de péremption',
      image: 'Image',
      searchProducts: 'Rechercher des produits',
      filterByCategory: 'Filtrer par catégorie',
      stockStatus: 'État du stock',
      inStock: 'En stock',
      lowStock: 'Stock faible',
      outOfStock: 'Rupture',
    },
    sales: {
      title: 'Ventes',
      newSale: 'Nouvelle vente',
      customer: 'Client',
      addCustomer: 'Ajouter un client',
      searchCustomer: 'Rechercher un client',
      products: 'Produits',
      quantity: 'Quantité',
      price: 'Prix',
      total: 'Total',
      discount: 'Remise',
      tax: 'TVA',
      grandTotal: 'Total général',
      paymentMethod: 'Mode de paiement',
      cash: 'Espèces',
      mobile: 'Mobile Money',
      createSale: 'Créer la vente',
      receipt: 'Reçu',
    },
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      search: 'Rechercher',
      filter: 'Filtrer',
      export: 'Exporter',
      import: 'Importer',
      loading: 'Chargement...',
      noData: 'Aucune donnée',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      success: 'Succès',
      error: 'Erreur',
      welcome: 'Bienvenue',
      logout: 'Déconnexion',
      settings: 'Paramètres',
    },
  },
  en: {
    nav: {
      home: 'Home',
      products: 'Products',
      movements: 'Movements',
      sales: 'Sales',
      profile: 'Profile',
      dashboard: 'Dashboard',
      inventory: 'Inventory',
      suppliers: 'Suppliers',
      customers: 'Customers',
      categories: 'Categories',
      settings: 'Settings',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone',
      shopName: 'Shop Name',
      forgotPassword: 'Forgot Password?',
      signInWithGoogle: 'Continue with Google',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      createAccount: 'Create Account',
    },
    homepage: {
      hero: {
        title: 'Manage your inventory like a pro with Miabé Stock',
        subtitle: 'The complete inventory management solution for retailers and SMEs. Simple, powerful, and accessible everywhere.',
        cta: 'Start for Free',
        joinFirstThousand: 'Join the first 1000 merchants',
      },
      features: {
        title: 'Why choose Miabé Stock?',
        inventory: {
          title: 'Smart inventory management',
          description: 'Track your products in real-time with automatic alerts.',
        },
        sales: {
          title: 'Simplified sales',
          description: 'Create professional invoices with just a few clicks.',
        },
        analytics: {
          title: 'Advanced analytics',
          description: 'Dashboards and reports to optimize your business.',
        },
        multilingual: {
          title: 'Multilingual',
          description: 'Interface available in French and English.',
        },
      },
      pricing: {
        title: 'Transparent Pricing',
        free: {
          title: 'Free',
          price: '$0/month',
          features: ['100 products', '50 sales/month', 'Email support'],
        },
        pro: {
          title: 'Pro',
          price: '$25/month',
          features: ['Unlimited products', 'Unlimited sales', 'Priority support', 'Advanced analytics'],
        },
        enterprise: {
          title: 'Enterprise',
          price: 'Custom',
          features: ['Everything in Pro', 'Multi-stores', 'API', 'Dedicated support'],
        },
      },
      testimonials: {
        title: 'What our customers say',
        items: [
          {
            name: 'Marie Kouakou',
            role: 'Shop Owner',
            content: 'Miabé Stock revolutionized my inventory management. Simple and effective!',
          },
          {
            name: 'Jean Koffi',
            role: 'Store Manager',
            content: 'Automatic alerts help me avoid stockouts.',
          },
        ],
      },
      faq: {
        title: 'Frequently Asked Questions',
        items: [
          {
            question: 'How do I get started?',
            answer: 'Sign up for free and start adding your products immediately.',
          },
          {
            question: 'Can I use Miabé Stock on mobile?',
            answer: 'Yes, our interface is mobile-optimized and can be installed as an app.',
          },
        ],
      },
    },
    dashboard: {
      title: 'Dashboard',
      stats: {
        totalSales: 'Total Sales',
        todaySales: 'Today\'s Sales',
        revenue: 'Revenue',
        averageBasket: 'Average Basket',
        netProfit: 'Net Profit',
      },
      newSale: 'New Sale',
      alerts: {
        lowStock: 'Low Stock',
        outOfStock: 'Out of Stock',
        expiredProducts: 'Expired Products',
      },
      topProducts: 'Top Products',
      topCustomers: 'Top Customers',
      topCategories: 'Top Categories',
      seeAll: 'See All',
    },
    products: {
      title: 'Products',
      addProduct: 'Add Product',
      name: 'Name',
      description: 'Description',
      barcode: 'Barcode',
      buyPrice: 'Buy Price',
      sellPrice: 'Sell Price',
      initialStock: 'Initial Stock',
      alertThreshold: 'Alert Threshold',
      category: 'Category',
      expiryDate: 'Expiry Date',
      image: 'Image',
      searchProducts: 'Search products',
      filterByCategory: 'Filter by category',
      stockStatus: 'Stock Status',
      inStock: 'In Stock',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock',
    },
    sales: {
      title: 'Sales',
      newSale: 'New Sale',
      customer: 'Customer',
      addCustomer: 'Add Customer',
      searchCustomer: 'Search Customer',
      products: 'Products',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total',
      discount: 'Discount',
      tax: 'Tax',
      grandTotal: 'Grand Total',
      paymentMethod: 'Payment Method',
      cash: 'Cash',
      mobile: 'Mobile Money',
      createSale: 'Create Sale',
      receipt: 'Receipt',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      loading: 'Loading...',
      noData: 'No data',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      success: 'Success',
      error: 'Error',
      welcome: 'Welcome',
      logout: 'Logout',
      settings: 'Settings',
    },
  },
};

export const useTranslation = (language: Language = 'fr') => {
  const t = translations[language];
  
  return {
    t,
    language,
  };
};
