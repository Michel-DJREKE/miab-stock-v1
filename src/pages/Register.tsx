
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Mail, Lock, User, Phone, Store, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Register = () => {
  const { language, login } = useApp();
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    shopName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user registration
      const newUser = {
        id: '1',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        shopName: formData.shopName,
      };

      login(newUser);
      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    toast.info('Inscription Google bientôt disponible');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex flex-1 miabe-gradient items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Store className="w-16 h-16 text-miabe-black-900" />
          </div>
          <h2 className="text-3xl font-bold text-miabe-black-900 mb-4">
            Rejoignez Miabé Stock
          </h2>
          <p className="text-lg text-miabe-black-700">
            Créez votre compte gratuitement et transformez la gestion de votre stock. 
            Démarrez en quelques minutes seulement.
          </p>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-miabe-black-900">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 miabe-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-miabe-black-900" />
            </div>
            <h1 className="text-2xl font-bold text-miabe-black-900 dark:text-white">
              Miabé Stock
            </h1>
          </div>

          <Card className="miabe-card border-0 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-miabe-black-900 dark:text-white">
                {t.auth.createAccount}
              </CardTitle>
              <p className="text-miabe-black-600 dark:text-miabe-black-300">
                Commencez votre aventure aujourd'hui
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-miabe-black-700 dark:text-miabe-black-200">
                      {t.auth.firstName}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-miabe-black-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Prénom"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="pl-10 miabe-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-miabe-black-700 dark:text-miabe-black-200">
                      {t.auth.lastName}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-miabe-black-400" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Nom"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="pl-10 miabe-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-miabe-black-700 dark:text-miabe-black-200">
                    {t.auth.email}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-miabe-black-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 miabe-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-miabe-black-700 dark:text-miabe-black-200">
                    {t.auth.phone} <span className="text-miabe-black-400">(optionnel)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-miabe-black-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+225 XX XX XX XX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 miabe-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopName" className="text-miabe-black-700 dark:text-miabe-black-200">
                    {t.auth.shopName}
                  </Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-3 w-5 h-5 text-miabe-black-400" />
                    <Input
                      id="shopName"
                      type="text"
                      placeholder="Nom de votre boutique"
                      value={formData.shopName}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      className="pl-10 miabe-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-miabe-black-700 dark:text-miabe-black-200">
                    {t.auth.password}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-miabe-black-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 miabe-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-miabe-black-400 hover:text-miabe-black-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-miabe-black-700 dark:text-miabe-black-200">
                    {t.auth.confirmPassword}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-miabe-black-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 miabe-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-miabe-black-400 hover:text-miabe-black-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full miabe-button-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Création...' : t.auth.createAccount}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-miabe-black-200 dark:border-miabe-black-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-miabe-black-900 text-miabe-black-500">
                    ou
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignup}
                variant="outline"
                className="w-full miabe-border"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t.auth.signInWithGoogle}
              </Button>

              <div className="text-center">
                <p className="text-sm text-miabe-black-600 dark:text-miabe-black-300">
                  {t.auth.alreadyHaveAccount}{' '}
                  <Link 
                    to="/login" 
                    className="text-miabe-yellow-600 hover:text-miabe-yellow-700 font-semibold"
                  >
                    {t.auth.login}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
