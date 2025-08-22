/**
 * Utilidades para crear usuarios y datos de prueba
 */

import { supabase } from './supabase';
import { AuthService } from './auth';

export async function createDemoUsers() {
  try {
    console.log('Creando usuarios de demostración...');

    // Usuario admin
    const adminData = await AuthService.signUp(
      'admin@demo.com', 
      '123456',
      {
        company_name: 'Administración CRM',
        nif_cif: 'A12345678',
        phone: '+34900000000'
      }
    );

    if (adminData.user) {
      // Actualizar rol a ADMIN
      await supabase
        .from('users')
        .update({ role: 'ADMIN' })
        .eq('auth_user_id', adminData.user.id);
    }

    // Empresas de prueba
    const empresas = [
      {
        email: 'empresa1@demo.com',
        company_name: 'Construcciones García SL',
        nif_cif: 'B87654321',
        phone: '+34600111111'
      },
      {
        email: 'empresa2@demo.com',
        company_name: 'Reformas Martín SA',
        nif_cif: 'A11223344',
        phone: '+34600222222'
      },
      {
        email: 'empresa3@demo.com',
        company_name: 'EcoConstruct Solutions',
        nif_cif: 'B99887766',
        phone: '+34600333333'
      }
    ];

    for (const empresa of empresas) {
      const userData = await AuthService.signUp(
        empresa.email,
        '123456',
        {
          company_name: empresa.company_name,
          nif_cif: empresa.nif_cif,
          phone: empresa.phone
        }
      );

      if (userData.user) {
        // Añadir créditos iniciales para pruebas
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', userData.user.id)
          .single();

        if (profile) {
          // Crear recarga de créditos inicial
          await supabase.rpc('process_credit_recharge', {
            p_user_id: profile.id,
            p_amount: 50,
            p_description: 'Créditos iniciales de demostración'
          });
        }
      }
    }

    console.log('Usuarios de demostración creados exitosamente');
    return true;

  } catch (error) {
    console.error('Error creando usuarios de demostración:', error);
    return false;
  }
}

// Función para recargar créditos (para ser usada por el admin)
export async function rechargeCredits(userId: string, amount: number, description: string = 'Recarga manual') {
  try {
    const { error } = await supabase.rpc('process_credit_recharge', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error recargando créditos:', error);
    return false;
  }
}

// Función para obtener estadísticas globales (admin)
export async function getGlobalStats() {
  try {
    const [usersRes, leadsRes, walletsRes, transactionsRes] = await Promise.all([
      supabase.from('users').select('id, role, status', { count: 'exact' }),
      supabase.from('leads').select('id, publication_status', { count: 'exact' }),
      supabase.from('credit_wallets').select('balance'),
      supabase.from('credit_transactions')
        .select('amount, type')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const totalUsers = usersRes.count || 0;
    const activeUsers = usersRes.data?.filter(u => u.status === 'ACTIVE').length || 0;
    const totalLeads = leadsRes.count || 0;
    const availableLeads = leadsRes.data?.filter(l => l.publication_status === 'DISPONIBLE').length || 0;
    
    const totalBalance = walletsRes.data?.reduce((sum, w) => sum + w.balance, 0) || 0;
    
    const monthlyRecharges = transactionsRes.data
      ?.filter(t => t.type === 'RECARGA')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const monthlyConsumption = Math.abs(transactionsRes.data
      ?.filter(t => t.type === 'CONSUMO')
      .reduce((sum, t) => sum + t.amount, 0) || 0);

    return {
      totalUsers,
      activeUsers,
      totalLeads,
      availableLeads,
      totalBalance,
      monthlyRecharges,
      monthlyConsumption,
      revenue: monthlyRecharges * 5 // Asumiendo 5€ por crédito
    };

  } catch (error) {
    console.error('Error obteniendo estadísticas globales:', error);
    return null;
  }
}