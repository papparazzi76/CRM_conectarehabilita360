import React from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">CRM Construcción</h1>
          {user?.profile && (
            <div className="text-sm text-gray-500">
              {user.profile.role === 'ADMIN' ? 'Administrador' : user.profile.company_name}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}