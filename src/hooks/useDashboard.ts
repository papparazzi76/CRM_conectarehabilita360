import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { subDays, format } from 'date-fns';

export interface DashboardStats {
  creditBalance: number;
  creditsConsumed: number;
  leadsRequested: number;
  leadsContacted: number;
  leadsQuoted: number;
  leadsWon: number;
  totalRevenue: number;
  avgTicket: number;
  conversionRate: number;
  roi: number;
}

export interface ChartDataPoint {
  date: string;
  roi: number;
  cpl: number;
  leads: number;
  revenue: number;
}

export function useDashboard(period: number = 30) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    creditBalance: 0,
    creditsConsumed: 0,
    leadsRequested: 0,
    leadsContacted: 0,
    leadsQuoted: 0,
    leadsWon: 0,
    totalRevenue: 0,
    avgTicket: 0,
    conversionRate: 0,
    roi: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.profile) {
      loadDashboardData();
    }
  }, [user, period]);

  const loadDashboardData = async () => {
    if (!user?.profile) return;

    setLoading(true);
    try {
      const startDate = subDays(new Date(), period).toISOString();
      const endDate = new Date().toISOString();

      // Obtener estadísticas usando la función SQL
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_dashboard_stats', {
          p_user_id: user.profile.id,
          p_start_date: startDate,
          p_end_date: endDate,
        });

      if (statsError) throw statsError;

      if (statsData && statsData.length > 0) {
        const row = statsData[0];
        setStats({
          creditBalance: row.credit_balance || 0,
          creditsConsumed: row.credits_consumed || 0,
          leadsRequested: row.leads_requested || 0,
          leadsContacted: row.leads_contacted || 0,
          leadsQuoted: row.leads_quoted || 0,
          leadsWon: row.leads_won || 0,
          totalRevenue: parseFloat(row.total_revenue) || 0,
          avgTicket: parseFloat(row.avg_ticket) || 0,
          conversionRate: parseFloat(row.conversion_rate) || 0,
          roi: parseFloat(row.roi_percentage) || 0,
        });
      }

      // Obtener datos para el gráfico
      const { data: chartDataRaw, error: chartError } = await supabase
        .rpc('get_roi_chart_data', {
          p_user_id: user.profile.id,
          p_days: Math.min(period, 30), // Limitar a 30 días para el gráfico
        });

      if (chartError) throw chartError;

      if (chartDataRaw) {
        const formattedChartData = chartDataRaw.map((row: any) => ({
          date: format(new Date(row.date_point), 'dd/MM'),
          roi: parseFloat(row.roi_value) || 0,
          cpl: parseFloat(row.cpl_value) || 0,
          leads: row.leads_count || 0,
          revenue: parseFloat(row.revenue_amount) || 0,
        }));
        setChartData(formattedChartData);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    chartData,
    loading,
    refresh: loadDashboardData,
  };
}