import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { LeadCard } from './LeadCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

// ... (la interfaz Lead y Filters se mantienen igual) ...
interface Lead {
  id: string;
  province_id: number | null;
  municipality_id: number | null;
  work_type_id: number | null;
  ce_letter_current: string | null;
  ce_letter_target: string | null;
  estimated_budget: number;
  desired_timeline: string | null;
  is_urgent: boolean;
  project_value: number;
  publication_status: string;
  max_shared_companies: number;
  created_at: string;
  provinces?: { name: string };
  municipalities?: { name: string };
  work_types?: { name: string };
  _shares_count?: number;
}

interface Filters {
  search: string;
  province: string;
  workType: string;
  urgentOnly: boolean;
  minValue: string;
  maxValue: string;
}

export function LeadBoard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    province: '',
    workType: '',
    urgentOnly: false,
    minValue: '',
    maxValue: '',
  });

  const [provinces, setProvinces] = useState<{id: number, name: string}[]>([]);
  const [workTypes, setWorkTypes] = useState<{id: number, name: string}[]>([]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        p_province_id: filters.province ? parseInt(filters.province, 10) : null,
        p_work_type_id: filters.workType ? parseInt(filters.workType, 10) : null,
        p_is_urgent: filters.urgentOnly ? true : null,
        p_min_value: filters.minValue ? parseFloat(filters.minValue) : null,
        p_max_value: filters.maxValue ? parseFloat(filters.maxValue) : null,
      };

      const { data, error } = await supabase.rpc('get_available_leads', params);

      if (error) throw error;

      const formattedLeads = data.map((lead: any) => ({
        ...lead,
        provinces: { name: lead.province_name },
        municipalities: { name: lead.municipality_name },
        work_types: { name: lead.work_type_name },
        _shares_count: lead.shares_count,
      }));

      const finalLeads = filters.search
        ? formattedLeads.filter((lead: Lead) =>
            lead.municipalities?.name?.toLowerCase().includes(filters.search.toLowerCase())
          )
        : formattedLeads;

      setLeads(finalLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Error al cargar los leads.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadInitialData = useCallback(async () => {
    try {
        const [provincesRes, workTypesRes, walletRes] = await Promise.all([
            supabase.from('provinces').select('id, name').order('name'),
            supabase.from('work_types').select('id, name').order('name'),
            user?.profile ? supabase.from('credit_wallets').select('balance').eq('user_id', user.profile.id).single() : null,
        ]);

        if (provincesRes.data) setProvinces(provincesRes.data);
        if (workTypesRes.data) setWorkTypes(workTypesRes.data);
        if (walletRes?.data) setUserBalance(walletRes.data.balance);

    } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Error cargando datos iniciales.');
    }
  }, [user]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleRequestLead = async (leadId: string, competitionLevel: number, isExclusive: boolean, cost: number) => {
    if (!user?.profile) return;

    if (userBalance < cost) {
        toast.error('Saldo insuficiente para solicitar este lead.');
        return;
    }

    try {
        const { data, error } = await supabase.rpc('process_lead_request', {
            p_user_id: user.profile.id,
            p_lead_id: leadId,
            p_competition_level: competitionLevel,
            p_is_exclusive: isExclusive,
            p_credit_cost: cost,
        });

        if (error) throw error;

        const result = data as unknown as { success: boolean, message: string }[];
        if (result && !result[0].success) {
            throw new Error(result[0].message);
        }

        toast.success('Lead solicitado correctamente');
        setUserBalance(prev => prev - cost);
        await loadLeads();

    } catch (error: any) {
        console.error('Error requesting lead:', error);
        toast.error(`Error al solicitar el lead: ${error.message}`);
    }
};

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ... (el resto del JSX del return se mantiene igual) ...
   return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Disponibles</h1>
          <p className="text-gray-600">Explora oportunidades comerciales</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-sm font-medium text-blue-700">
            Créditos disponibles: {userBalance}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por municipio..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provincia
            </label>
            <select
              value={filters.province}
              onChange={(e) => handleFilterChange('province', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {provinces.map(province => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de obra
            </label>
            <select
              value={filters.workType}
              onChange={(e) => handleFilterChange('workType', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {workTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor mínimo
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minValue}
              onChange={(e) => handleFilterChange('minValue', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor máximo
            </label>
            <input
              type="number"
              placeholder="∞"
              value={filters.maxValue}
              onChange={(e) => handleFilterChange('maxValue', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.urgentOnly}
              onChange={(e) => handleFilterChange('urgentOnly', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Solo urgentes</span>
          </label>

          <button
            onClick={loadLeads}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {leads.length > 0 ? (
          leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onRequestLead={handleRequestLead}
              userBalance={userBalance}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay leads disponibles
            </h3>
            <p className="text-gray-500">
              Prueba ajustando los filtros para ver más resultados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
