import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Calendar,
  DollarSign,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface LeadShare {
  id: string;
  lead_id: string;
  commercial_status: 'SOLICITADO' | 'CONTACTADO' | 'PRESUPUESTADO' | 'CONTRATADO' | 'PERDIDO';
  loss_reason?: string;
  budget_amount?: number;
  contract_date?: string;
  created_at: string;
  updated_at: string;
  leads: {
    id: string;
    project_value: number;
    provinces?: { name: string };
    municipalities?: { name: string };
    work_types?: { name: string };
    is_urgent: boolean;
  };
}

interface EditingShare {
  id: string;
  commercial_status: string;
  budget_amount: string;
  contract_date: string;
  loss_reason: string;
}

const statusConfig = {
  SOLICITADO: { 
    label: 'Solicitado', 
    icon: FileText, 
    color: 'bg-blue-100 text-blue-800',
    description: 'Lead recién adquirido'
  },
  CONTACTADO: { 
    label: 'Contactado', 
    icon: Phone, 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Cliente contactado exitosamente'
  },
  PRESUPUESTADO: { 
    label: 'Presupuestado', 
    icon: FileText, 
    color: 'bg-purple-100 text-purple-800',
    description: 'Presupuesto enviado'
  },
  CONTRATADO: { 
    label: 'Contratado', 
    icon: CheckCircle, 
    color: 'bg-green-100 text-green-800',
    description: 'Obra contratada'
  },
  PERDIDO: { 
    label: 'Perdido', 
    icon: XCircle, 
    color: 'bg-red-100 text-red-800',
    description: 'Oportunidad perdida'
  },
};

const lossReasons = [
  'Precio no competitivo',
  'Cliente decidió no hacer la obra',
  'Eligió a otra empresa',
  'Requisitos técnicos no cumplidos',
  'Plazo de ejecución inadecuado',
  'Falta de referencias',
  'Problemas de comunicación',
  'Otro motivo',
];

export function CommercialPipeline() {
  const { user } = useAuth();
  const [leadShares, setLeadShares] = useState<LeadShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingShare, setEditingShare] = useState<EditingShare | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadLeadShares();
  }, []);

  const loadLeadShares = async () => {
    if (!user?.profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_shares')
        .select(`
          *,
          leads (
            id,
            project_value,
            is_urgent,
            provinces (name),
            municipalities (name),
            work_types (name)
          )
        `)
        .eq('user_id', user.profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeadShares(data || []);
    } catch (error) {
      console.error('Error loading lead shares:', error);
      toast.error('Error cargando el pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (shareId: string, newStatus: string, updates: Partial<EditingShare>) => {
    try {
      const updateData: any = {
        commercial_status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (updates.budget_amount && !isNaN(parseFloat(updates.budget_amount))) {
        updateData.budget_amount = parseFloat(updates.budget_amount);
      }

      if (updates.contract_date) {
        updateData.contract_date = updates.contract_date;
      }

      if (newStatus === 'PERDIDO' && updates.loss_reason) {
        updateData.loss_reason = updates.loss_reason;
      }

      const { error } = await supabase
        .from('lead_shares')
        .update(updateData)
        .eq('id', shareId);

      if (error) throw error;

      toast.success('Estado actualizado correctamente');
      setEditingShare(null);
      await loadLeadShares();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error actualizando el estado');
    }
  };

  const startEditing = (share: LeadShare) => {
    setEditingShare({
      id: share.id,
      commercial_status: share.commercial_status,
      budget_amount: share.budget_amount?.toString() || '',
      contract_date: share.contract_date || '',
      loss_reason: share.loss_reason || '',
    });
  };

  const saveChanges = () => {
    if (!editingShare) return;
    handleStatusUpdate(editingShare.id, editingShare.commercial_status, editingShare);
  };

  const cancelEditing = () => {
    setEditingShare(null);
  };

  const filteredShares = leadShares.filter(share => {
    if (filter === 'ALL') return true;
    return share.commercial_status === filter;
  });

  const statusCounts = leadShares.reduce((acc, share) => {
    acc[share.commercial_status] = (acc[share.commercial_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pipeline Comercial</h2>
        <p className="text-gray-600">Gestiona el estado de tus leads y oportunidades</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-6 py-3 text-sm font-medium border-r border-gray-200 ${
              filter === 'ALL' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Todos ({leadShares.length})
          </button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 text-sm font-medium border-r border-gray-200 flex items-center space-x-2 ${
                filter === status ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <config.icon className="w-4 h-4" />
              <span>{config.label} ({statusCounts[status] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lead Shares List */}
      <div className="space-y-4">
        {filteredShares.map((share) => {
          const StatusIcon = statusConfig[share.commercial_status].icon;
          const isEditing = editingShare?.id === share.id;
          
          return (
            <div
              key={share.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Lead Info */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {share.leads.municipalities?.name}, {share.leads.provinces?.name}
                      </span>
                      {share.leads.is_urgent && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                          Urgente
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {share.leads.work_types?.name}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {share.leads.project_value.toLocaleString('es-ES')} €
                    </div>
                  </div>

                  {/* Status and Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado comercial
                      </label>
                      {isEditing ? (
                        <select
                          value={editingShare.commercial_status}
                          onChange={(e) => setEditingShare({
                            ...editingShare,
                            commercial_status: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Object.entries(statusConfig).map(([status, config]) => (
                            <option key={status} value={status}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          statusConfig[share.commercial_status].color
                        }`}>
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {statusConfig[share.commercial_status].label}
                        </div>
                      )}
                    </div>

                    {/* Budget Amount */}
                    {(share.commercial_status === 'PRESUPUESTADO' || share.commercial_status === 'CONTRATADO' || isEditing) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Importe presupuestado (€)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editingShare.budget_amount}
                            onChange={(e) => setEditingShare({
                              ...editingShare,
                              budget_amount: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Importe en euros"
                          />
                        ) : share.budget_amount ? (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{share.budget_amount.toLocaleString('es-ES')} €</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No especificado</span>
                        )}
                      </div>
                    )}

                    {/* Contract Date */}
                    {share.commercial_status === 'CONTRATADO' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de contrato
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editingShare.contract_date}
                            onChange={(e) => setEditingShare({
                              ...editingShare,
                              contract_date: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : share.contract_date ? (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{format(new Date(share.contract_date), 'dd/MM/yyyy', { locale: es })}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No especificada</span>
                        )}
                      </div>
                    )}

                    {/* Loss Reason */}
                    {share.commercial_status === 'PERDIDO' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Motivo de pérdida
                        </label>
                        {isEditing ? (
                          <select
                            value={editingShare.loss_reason}
                            onChange={(e) => setEditingShare({
                              ...editingShare,
                              loss_reason: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Seleccionar motivo</option>
                            {lossReasons.map(reason => (
                              <option key={reason} value={reason}>{reason}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-600">{share.loss_reason || 'No especificado'}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="mt-4 text-xs text-gray-500">
                    Creado: {format(new Date(share.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    {share.updated_at !== share.created_at && (
                      <span className="ml-4">
                        Actualizado: {format(new Date(share.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4 flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveChanges}
                        className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar</span>
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(share)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredShares.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'ALL' ? 'No hay leads en tu pipeline' : `No hay leads en estado ${statusConfig[filter as keyof typeof statusConfig]?.label}`}
            </h3>
            <p className="text-gray-500">
              {filter === 'ALL' 
                ? 'Solicita algunos leads del tablón para comenzar tu pipeline comercial'
                : 'Cambia el filtro para ver leads en otros estados'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}