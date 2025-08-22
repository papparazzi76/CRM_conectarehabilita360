/*
# Función para procesar recargas de créditos

Esta función permite a los administradores recargar créditos
a las empresas de forma controlada y con auditoría.
*/

CREATE OR REPLACE FUNCTION process_credit_recharge(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT 'Recarga de créditos'
)
RETURNS TABLE(success BOOLEAN, message TEXT, transaction_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
    RETURN QUERY SELECT false, 'Usuario no encontrado'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Verificar que el monto es positivo
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT false, 'El monto debe ser positivo'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Obtener balance actual
  SELECT balance INTO v_current_balance 
  FROM credit_wallets 
  WHERE user_id = p_user_id;

  -- Si no existe wallet, crearlo
  IF v_current_balance IS NULL THEN
    INSERT INTO credit_wallets (user_id, balance) 
    VALUES (p_user_id, 0);
    v_current_balance := 0;
  END IF;

  -- Generar ID de transacción
  v_transaction_id := gen_random_uuid();

  BEGIN
    -- Actualizar balance
    UPDATE credit_wallets 
    SET 
      balance = balance + p_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Crear transacción
    INSERT INTO credit_transactions (
      id, user_id, type, amount, balance_after, metadata
    ) VALUES (
      v_transaction_id,
      p_user_id,
      'RECARGA',
      p_amount,
      v_current_balance + p_amount,
      jsonb_build_object('description', p_description)
    );

    -- Log de auditoría
    INSERT INTO audit_log (
      actor_user_id, action, entity, entity_id, changes
    ) VALUES (
      auth.uid(), 
      'CREDIT_RECHARGED', 
      'credit_wallets', 
      p_user_id,
      jsonb_build_object(
        'amount', p_amount,
        'previous_balance', v_current_balance,
        'new_balance', v_current_balance + p_amount,
        'description', p_description
      )
    );

    RETURN QUERY SELECT true, 'Recarga procesada correctamente'::TEXT, v_transaction_id;

  EXCEPTION WHEN OTHERS THEN
    RAISE;
  END;
END;
$$;

-- Función para obtener estadísticas globales del sistema
CREATE OR REPLACE FUNCTION get_global_system_stats()
RETURNS TABLE(
  total_users INTEGER,
  active_users INTEGER,
  total_leads INTEGER,
  available_leads INTEGER,
  total_credits_in_circulation INTEGER,
  credits_consumed_last_30_days INTEGER,
  credits_recharged_last_30_days INTEGER,
  total_revenue_estimate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credit_price NUMERIC := 5.0;
  v_start_date TIMESTAMPTZ := NOW() - INTERVAL '30 days';
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'EMPRESA'),
    (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'EMPRESA' AND status = 'ACTIVE'),
    (SELECT COUNT(*)::INTEGER FROM leads),
    (SELECT COUNT(*)::INTEGER FROM leads WHERE publication_status = 'DISPONIBLE'),
    (SELECT COALESCE(SUM(balance), 0)::INTEGER FROM credit_wallets),
    (SELECT COALESCE(SUM(ABS(amount)), 0)::INTEGER 
     FROM credit_transactions 
     WHERE type = 'CONSUMO' AND created_at >= v_start_date),
    (SELECT COALESCE(SUM(amount), 0)::INTEGER 
     FROM credit_transactions 
     WHERE type = 'RECARGA' AND created_at >= v_start_date),
    (SELECT COALESCE(SUM(amount), 0) * v_credit_price
     FROM credit_transactions 
     WHERE type = 'RECARGA' AND created_at >= v_start_date);
END;
$$;

-- Políticas de seguridad para las nuevas funciones
GRANT EXECUTE ON FUNCTION process_credit_recharge TO authenticated;
GRANT EXECUTE ON FUNCTION get_global_system_stats TO authenticated;