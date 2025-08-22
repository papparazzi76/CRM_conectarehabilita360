import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  BarChart3, 
  Users, 
  Settings, 
  Wallet,
  Shield,
  GitBranch,
  Building
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.profile?.role === 'ADMIN';

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard', roles: ['ADMIN', 'EMPRESA'] },
    { to: '/leads', icon: FileText, label: 'Leads', roles: ['ADMIN', 'EMPRESA'] },
    { to: '/pipeline', icon: GitBranch, label: 'Pipeline', roles: ['EMPRESA'] },
    { to: '/wallet', icon: Wallet, label: 'Créditos', roles: ['EMPRESA'] },
    { to: '/admin/users', icon: Users, label: 'Usuarios', roles: ['ADMIN'] },
    { to: '/admin/leads', icon: FileText, label: 'Gestión Leads', roles: ['ADMIN'] },
    { to: '/admin/pricing', icon: BarChart3, label: 'Precios', roles: ['ADMIN'] },
    { to: '/admin/audit', icon: Shield, label: 'Auditoría', roles: ['ADMIN'] },
    { to: '/settings', icon: Settings, label: 'Configuración', roles: ['ADMIN', 'EMPRESA'] },
  ];

  const filteredItems = navItems.filter(item => 
    item.roles.includes(user?.profile?.role || 'EMPRESA')
  );

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg">CRM Construcción</div>
            <div className="text-xs text-gray-400">
              {isAdmin ? 'Administrador' : 'Empresa'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          Sesión iniciada como:
        </div>
        <div className="font-medium text-white truncate">
          {user?.profile?.company_name || user?.email}
        </div>
      </div>
    </aside>
  );
}