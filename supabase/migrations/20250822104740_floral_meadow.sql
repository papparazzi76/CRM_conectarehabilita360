/*
# Función para procesar solicitud de lead

Esta función maneja atomicamente:
1. Verificación de saldo suficiente
2. Descuento de créditos del wallet
3. Creación de transacción de créditos  
4. Creación de solicitud de lead
5. Creación de registro en lead_shares
6. Log de auditoría
*/

CREATE OR REPLACE FUNCTION process_lead_request(
  p_user_id UUID,
  p_lead_id UUID,
  p_competition_level INTEGER,
  p_is_exclusive BOOLEAN,
  p_credit_cost INTEGER
)
RETURNS TABLE(success BOOLEAN, message TEXT, transaction_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_transaction_id UUID;
  v_shares_count INTEGER;
  v_max_shared INTEGER;
BEGIN
  -- Verificar que el lead existe y está disponible
  IF NOT EXISTS (
    SELECT 1 FROM leads 
    WHERE id = p_lead_id AND publication_status = 'DISPONIBLE'
  ) THEN
    RETURN QUERY SELECT false, 'Lead no disponible'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Verificar que el usuario no ya solicitó este lead
  IF EXISTS (
    SELECT 1 FROM lead_requests 
    WHERE lead_id = p_lead_id AND user_id = p_user_id
  ) THEN
    RETURN QUERY SELECT false, 'Ya has solicitado este lead'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Obtener balance actual
  SELECT balance INTO v_current_balance 
  FROM credit_wallets 
  WHERE user_id = p_user_id;

  -- Verificar saldo suficiente
  IF v_current_balance < p_credit_cost THEN
    RETURN QUERY SELECT false, 'Saldo insuficiente'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Verificar límites de compartición si no es exclusivo
  SELECT COUNT(*) INTO v_shares_count 
  FROM lead_shares 
  WHERE lead_id = p_lead_id;

  SELECT max_shared_companies INTO v_max_shared 
  FROM leads 
  WHERE id = p_lead_id;

  IF p_is_exclusive THEN
    IF v_shares_count > 0 THEN
      RETURN QUERY SELECT false, 'Lead ya no disponible para exclusividad'::TEXT, NULL::UUID;
      RETURN;
    END IF;
  ELSE
    -- Verificar que no se supere el límite de empresas
    IF v_shares_count >= LEAST(p_competition_level + 1, v_max_shared + 1) THEN
      RETURN QUERY SELECT false, 'Límite de empresas alcanzado'::TEXT, NULL::UUID;
      RETURN;
    END IF;
  END IF;

  -- Generar ID de transacción
  v_transaction_id := gen_random_uuid();

  BEGIN
    -- Descontar créditos del wallet
    UPDATE credit_wallets 
    SET 
      balance = balance - p_credit_cost,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Crear transacción de créditos
    INSERT INTO credit_transactions (
      id, user_id, lead_id, type, amount, balance_after, metadata
    ) VALUES (
      v_transaction_id,
      p_user_id,
      p_lead_id,
      'CONSUMO',
      -p_credit_cost,
      v_current_balance - p_credit_cost,
      jsonb_build_object(
        'competition_level', p_competition_level,
        'is_exclusive', p_is_exclusive
      )
    );

    -- Crear solicitud de lead
    INSERT INTO lead_requests (
      lead_id, user_id, competition_level, is_exclusive, credit_cost, status
    ) VALUES (
      p_lead_id, p_user_id, p_competition_level, p_is_exclusive, p_credit_cost, 'SOLICITADO'
    );

    -- Crear entrada en lead_shares para seguimiento comercial
    INSERT INTO lead_shares (
      lead_id, user_id, commercial_status
    ) VALUES (
      p_lead_id, p_user_id, 'SOLICITADO'
    );

    -- Si es exclusivo, marcar lead como agotado
    IF p_is_exclusive THEN
      UPDATE leads 
      SET publication_status = 'AGOTADO'
      WHERE id = p_lead_id;
    END IF;

    -- Insertar log de auditoría
    INSERT INTO audit_log (
      actor_user_id, action, entity, entity_id, changes
    ) VALUES (
      p_user_id, 
      'LEAD_REQUESTED', 
      'lead_requests', 
      p_lead_id,
      jsonb_build_object(
        'credit_cost', p_credit_cost,
        'competition_level', p_competition_level,
        'is_exclusive', p_is_exclusive
      )
    );

    RETURN QUERY SELECT true, 'Lead solicitado correctamente'::TEXT, v_transaction_id;

  EXCEPTION WHEN OTHERS THEN
    -- En caso de error, hacer rollback automático
    RAISE;
  END;
END;
$$;