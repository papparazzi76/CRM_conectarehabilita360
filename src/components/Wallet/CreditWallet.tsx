import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import fileDownload from 'js-file-download';

interface CreditTransaction {
  id: string;
  type: 'RECARGA' | 'CONSUMO' | 'AJUSTE';
  amount: number;
  balance_after: number;
  metadata: any;
  created_at: string;
  lead_id?: string;
}

interface WalletSummary {
  balance: number;
  totalRecharges: number;
  totalConsumed: number;
  totalAdjustments: number;
  transactionCount: number;
}

const transactionTypeConfig = {
  RECARGA: {
    label: 'Recarga',
    icon: Plus,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  CONSUMO: {
    label: 'Consumo',
    icon: Minus,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  AJUSTE: {
    label: 'Ajuste',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
};

export function CreditWallet() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<WalletSummary>({
    balance: 0,
    totalRecharges: 0,
    totalConsumed: 0,
    totalAdjustments: 0,
    transactionCount: 0,
  });
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    if (user?.profile) {
      loadWalletData();
    }
  }, [user, period, typeFilter]);

  const loadWalletData = async () => {
    if (!user?.profile) return;

    setLoading(true);
    try {
      // Cargar balance actual
      const { data: walletData } = await supabase
        .from('credit_wallets')
        .select('balance')
        .eq('user_id', user.profile.id)
        .single();

      const balance = walletData?.balance || 0;

      // Cargar transacciones del periodo
      const startDate = subDays(new Date(), period);
      let query = supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.profile.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (typeFilter !== 'ALL') {
        query = query.eq('type', typeFilter);
      }

      const { data: transactionsData, error } = await query;
      
      if (error) throw error;

      setTransactions(transactionsData || []);

      // Calcular resumen
      const totalRecharges = transactionsData
        ?.filter(t => t.type === 'RECARGA')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      const totalConsumed = Math.abs(transactionsData
        ?.filter(t => t.type === 'CONSUMO')
        .reduce((sum, t) => sum + t.amount, 0) || 0);

      const totalAdjustments = transactionsData
        ?.filter(t => t.type === 'AJUSTE')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      setSummary({
        balance,
        totalRecharges,
        totalConsumed,
        totalAdjustments,
        transactionCount: transactionsData?.length || 0,
      });

    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast.error('Error cargando datos del wallet');
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = () => {
    const csvHeaders = ['Fecha', 'Tipo', 'Cantidad', 'Saldo Posterior', 'Descripción'];
    
    const csvData = transactions.map(t => [
      format(new Date(t.created_at), 'dd/MM/yyyy HH:mm', { locale: es }),
      transactionTypeConfig[t.type].label,
      t.amount,
      t.balance_after,
      t.metadata?.description || (t.lead_id ? `Lead ${t.lead_id.slice(0, 8)}...` : ''),
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    fileDownload(blob, `movimientos-creditos-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast.success('Archivo CSV descargado');
  };

  const creditValue = 5; // 5€ por crédito

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mi Wallet de Créditos</h2>
          <p className="text-gray-600">Gestiona tu saldo y movimientos de créditos</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
            <option value={365}>Último año</option>
          </select>

          <button
            onClick={exportTransactions}
            disabled={transactions.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Actual</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{summary.balance}</p>
              <p className="text-sm text-gray-500">{(summary.balance * creditValue).toLocaleString('es-ES')} €</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recargas</p>
              <p className="text-2xl font-bold text-green-600 mt-1">+{summary.totalRecharges}</p>
              <p className="text-sm text-gray-500">+{(summary.totalRecharges * creditValue).toLocaleString('es-ES')} €</p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consumidos</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{summary.totalConsumed}</p>
              <p className="text-sm text-gray-500">{(summary.totalConsumed * creditValue).toLocaleString('es-ES')} €</p>
            </div>
            <div className="bg-red-500 p-3 rounded-xl">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transacciones</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{summary.transactionCount}</p>
              <p className="text-sm text-gray-500">En {period} días</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                typeFilter === 'ALL' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            {Object.entries(transactionTypeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-1 ${
                  typeFilter === type 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <config.icon className="w-4 h-4" />
                <span>{config.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Movimientos</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {transactions.length > 0 ? (
            transactions.map((transaction) => {
              const TypeIcon = transactionTypeConfig[transaction.type].icon;
              const isPositive = transaction.amount > 0;
              
              return (
                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${transactionTypeConfig[transaction.type].bgColor}`}>
                        <TypeIcon className={`w-5 h-5 ${transactionTypeConfig[transaction.type].color}`} />
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900">
                          {transactionTypeConfig[transaction.type].label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                        {transaction.metadata?.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {transaction.metadata.description}
                          </div>
                        )}
                        {transaction.lead_id && (
                          <div className="text-xs text-blue-600 mt-1">
                            Lead: {transaction.lead_id.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? '+' : ''}{transaction.amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        Saldo: {transaction.balance_after}
                      </div>
                      <div className="text-xs text-gray-400">
                        {(Math.abs(transaction.amount) * creditValue).toLocaleString('es-ES')} €
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay transacciones
              </h3>
              <p className="text-gray-500">
                {typeFilter === 'ALL' 
                  ? `No se encontraron transacciones en los últimos ${period} días`
                  : `No hay transacciones del tipo ${transactionTypeConfig[typeFilter as keyof typeof transactionTypeConfig]?.label} en este periodo`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Necesitas más créditos?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">100 créditos</div>
            <div className="text-gray-600">250 €</div>
            <div className="text-sm text-gray-500 mt-1">2,50 € por crédito</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">250 créditos</div>
            <div className="text-gray-600">600 €</div>
            <div className="text-sm text-gray-500 mt-1">2,40 € por crédito</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">500 créditos</div>
            <div className="text-gray-600">1.125 €</div>
            <div className="text-sm text-gray-500 mt-1">2,25 € por crédito</div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Contacta con nuestro equipo comercial para realizar una recarga de créditos.
        </p>
      </div>
    </div>
  );
}