import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign,
  BarChart,
  Calendar,
  Target,
  Clock,
  Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState(30);
  const { stats, chartData, loading } = useDashboard(period);

  // Datos para el gráfico de pie del pipeline
  const pipelineData = [
    { name: 'Solicitados', value: stats.leadsRequested, color: COLORS[0] },
    { name: 'Contactados', value: stats.leadsContacted, color: COLORS[1] },
    { name: 'Presupuestados', value: stats.leadsQuoted, color: COLORS[2] },
    { name: 'Contratados', value: stats.leadsWon, color: COLORS[3] },
  ].filter(item => item.value > 0);

  if (user?.profile?.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Créditos Disponibles',
      value: stats.creditBalance.toString(),
      icon: DollarSign,
      color: 'bg-blue-500',
      description: `${(stats.creditBalance * 5).toLocaleString('es-ES')} € en créditos`,
    },
    {
      title: 'Leads Solicitados',
      value: stats.leadsRequested.toString(),
      icon: FileText,
      color: 'bg-green-500',
      description: `${stats.creditsConsumed} créditos consumidos`,
    },
    {
      title: 'Tasa de Conversión',
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: Target,
      color: 'bg-purple-500',
      description: `${stats.leadsWon} de ${stats.leadsRequested} convertidos`,
    },
    {
      title: 'ROI',
      value: `${stats.roi.toFixed(1)}%`,
      icon: TrendingUp,
      color: stats.roi >= 0 ? 'bg-green-500' : 'bg-red-500',
      description: `${stats.totalRevenue.toLocaleString('es-ES')} € facturados`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenido, {user?.profile?.company_name || user?.email}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ROI vs CPL Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">ROI vs CPL Tendencia</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">ROI (%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-600">CPL (créditos)</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="roi" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="ROI (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="cpl" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                  name="CPL (créditos)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución del Pipeline</h3>
          {pipelineData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No hay datos para mostrar</p>
                <p className="text-sm">Solicita algunos leads para ver tu pipeline</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Funnel */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Embudo de Conversión</h3>
          <div className="space-y-4">
            {[
              { label: 'Leads Solicitados', value: stats.leadsRequested, color: 'bg-blue-500', width: '100%' },
              { 
                label: 'Contactados', 
                value: stats.leadsContacted, 
                color: 'bg-yellow-500', 
                width: stats.leadsRequested > 0 ? `${(stats.leadsContacted / stats.leadsRequested) * 100}%` : '0%' 
              },
              { 
                label: 'Presupuestados', 
                value: stats.leadsQuoted, 
                color: 'bg-orange-500', 
                width: stats.leadsRequested > 0 ? `${(stats.leadsQuoted / stats.leadsRequested) * 100}%` : '0%' 
              },
              { 
                label: 'Contratados', 
                value: stats.leadsWon, 
                color: 'bg-green-500', 
                width: stats.leadsRequested > 0 ? `${(stats.leadsWon / stats.leadsRequested) * 100}%` : '0%' 
              },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`${item.color} h-3 rounded-full transition-all duration-500`} 
                    style={{ width: item.width }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumen Financiero</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Ingresos Totales</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {stats.totalRevenue.toLocaleString('es-ES')} €
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Coste en Créditos</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {(stats.creditsConsumed * 5).toLocaleString('es-ES')} €
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Ticket Medio</span>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {stats.avgTicket.toLocaleString('es-ES')} €
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <TrendingUp className={`w-5 h-5 mr-2 ${stats.roi >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm font-medium text-gray-600">ROI</span>
              </div>
              <span className={`text-lg font-bold ${stats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.roi.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Estadísticas Rápidas</h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.creditsConsumed}</div>
              <div className="text-sm text-blue-800">Créditos Consumidos</div>
              <div className="text-xs text-blue-600 mt-1">
                CPL: {stats.leadsRequested > 0 ? (stats.creditsConsumed / stats.leadsRequested).toFixed(1) : 0} créditos/lead
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-green-800">Tasa de Conversión</div>
              <div className="text-xs text-green-600 mt-1">
                {stats.leadsWon} contratados de {stats.leadsRequested} solicitados
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{period} días</div>
              <div className="text-sm text-purple-800">Periodo Analizado</div>
              <div className="text-xs text-purple-600 mt-1">
                {stats.leadsRequested} leads en total
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  // Para ser implementado en una siguiente iteración
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600">Vista general del sistema CRM</p>
      </div>

      <div className="bg-white rounded-xl p-8 text-center">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Panel de Administración</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          El panel de administración completo será implementado en la próxima fase del proyecto. 
          Incluirá gestión de usuarios, leads, precios y reportes avanzados.
        </p>
      </div>
    </div>
  );
}