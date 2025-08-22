import React, { useState } from 'react';
import { 
  MapPin, 
  Building, 
  Euro, 
  Clock, 
  AlertTriangle,
  Zap,
  Users
} from 'lucide-react';
import { calculateTotalCost, getCompetitionDescription } from '../../lib/credit-calculator';
import type { Database } from '../../lib/supabase';

type Lead = Database['public']['Tables']['leads']['Row'] & {
  provinces?: { name: string };
  municipalities?: { name: string };
  work_types?: { name: string };
  _shares_count?: number;
};

interface LeadCardProps {
  lead: Lead;
  onRequestLead?: (leadId: string, competitionLevel: number, isExclusive: boolean, cost: number) => void;
  userBalance?: number;
}

export function LeadCard({ lead, onRequestLead, userBalance = 0 }: LeadCardProps) {
  const [competitionLevel, setCompetitionLevel] = useState(4);
  const [isExclusive, setIsExclusive] = useState(false);

  const currentCost = calculateTotalCost(lead.project_value, competitionLevel, isExclusive);
  const canAfford = userBalance >= currentCost;
  const sharesCount = lead._shares_count || 0;

  const handleRequest = () => {
    if (onRequestLead && canAfford) {
      onRequestLead(lead.id, competitionLevel, isExclusive, currentCost);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">
            {lead.provinces?.name}, {lead.municipalities?.name}
          </span>
        </div>
        {lead.is_urgent && (
          <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            <span>Urgente</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">{lead.work_types?.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Euro className="w-4 h-4 text-gray-500" />
            <span className="text-lg font-semibold text-gray-900">
              {lead.project_value.toLocaleString('es-ES')} €
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{sharesCount} empresas</span>
          </div>
        </div>

        {lead.desired_timeline && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{lead.desired_timeline}</span>
          </div>
        )}

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">CE Actual:</span>
            <span className="font-medium bg-gray-100 px-2 py-1 rounded">
              {lead.ce_letter_current || 'N/A'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">CE Objetivo:</span>
            <span className="font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
              {lead.ce_letter_target || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Competition Level Selector */}
      <div className="space-y-3 mb-5 p-3 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700">
          Nivel de competencia
        </label>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name={`competition-${lead.id}`}
              checked={isExclusive}
              onChange={() => setIsExclusive(true)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">
              Exclusividad total (+10 créditos)
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name={`competition-${lead.id}`}
              checked={!isExclusive}
              onChange={() => setIsExclusive(false)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Compartido</span>
          </label>

          {!isExclusive && (
            <div className="ml-6 space-y-1">
              <select
                value={competitionLevel}
                onChange={(e) => setCompetitionLevel(Number(e.target.value))}
                className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={4}>Hasta 4 empresas más (+1 crédito)</option>
                <option value={3}>Hasta 3 empresas más (+2 créditos)</option>
                <option value={2}>Hasta 2 empresas más (+3 créditos)</option>
                <option value={1}>Con 1 empresa más (+4 créditos)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Cost and Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-lg font-bold text-gray-900">
            {currentCost} créditos
          </span>
          {!canAfford && (
            <span className="text-xs text-red-600 font-medium">
              (Saldo insuficiente)
            </span>
          )}
        </div>

        <button
          onClick={handleRequest}
          disabled={!canAfford}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            canAfford
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Solicitar Lead
        </button>
      </div>
    </div>
  );
}