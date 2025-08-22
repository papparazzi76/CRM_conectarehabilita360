import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginForm } from './components/Auth/LoginForm';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { LeadBoard } from './components/Leads/LeadBoard';
import { CommercialPipeline } from './components/Pipeline/CommercialPipeline';
import { CreditWallet } from './components/Wallet/CreditWallet';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/" /> : <LoginForm />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/leads" element={
        <ProtectedRoute>
          <MainLayout>
            <LeadBoard />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/pipeline" element={
        <ProtectedRoute>
          <MainLayout>
            <CommercialPipeline />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/wallet" element={
        <ProtectedRoute>
          <MainLayout>
            <CreditWallet />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración</h2>
              <p className="text-gray-600">Panel de configuración - En desarrollo</p>
            </div>
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <MainLayout>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Panel de Administración</h2>
              <p className="text-gray-600">Funcionalidades administrativas - En desarrollo</p>
            </div>
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#059669',
                },
              },
              error: {
                style: {
                  background: '#DC2626',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;