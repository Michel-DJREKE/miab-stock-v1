
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';

// Pages
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Sales from '@/pages/Sales';
import Inventory from '@/pages/Inventory';
import Restocking from '@/pages/Restocking';
import Analytics from '@/pages/Analytics';
import Customers from '@/pages/Customers';
import Suppliers from '@/pages/Suppliers';
import Categories from '@/pages/Categories';
import UserManagement from '@/pages/UserManagement';
import Settings from '@/pages/Settings';
import Alerts from '@/pages/Alerts';
import History from '@/pages/History';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/products" element={
                  <ProtectedRoute>
                    <Layout><Products /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/sales" element={
                  <ProtectedRoute>
                    <Layout><Sales /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inventory" element={
                  <ProtectedRoute>
                    <Layout><Inventory /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/restocking" element={
                  <ProtectedRoute>
                    <Layout><Restocking /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Layout><Analytics /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/customers" element={
                  <ProtectedRoute>
                    <Layout><Customers /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/suppliers" element={
                  <ProtectedRoute>
                    <Layout><Suppliers /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/categories" element={
                  <ProtectedRoute>
                    <Layout><Categories /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/users" element={
                  <ProtectedRoute>
                    <Layout><UserManagement /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout><Settings /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/alerts" element={
                  <ProtectedRoute>
                    <Layout><Alerts /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/history" element={
                  <ProtectedRoute>
                    <Layout><History /></Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
