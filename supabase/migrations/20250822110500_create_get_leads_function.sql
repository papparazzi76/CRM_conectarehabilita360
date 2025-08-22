-- Función optimizada para obtener leads disponibles con su conteo de solicitudes
CREATE OR REPLACE FUNCTION get_available_leads(
    p_province_id INTEGER DEFAULT NULL,
    p_work_type_id INTEGER DEFAULT NULL,
    p_is_urgent BOOLEAN DEFAULT NULL,
    p_min_value NUMERIC DEFAULT NULL,
    p_max_value NUMERIC DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    province_id INTEGER,
    municipality_id INTEGER,
    work_type_id INTEGER,
    ce_letter_current VARCHAR(1),
    ce_letter_target VARCHAR(1),
    estimated_budget DECIMAL(12,2),
    desired_timeline TEXT,
    is_urgent BOOLEAN,
    project_value NUMERIC(12,2),
    publication_status VARCHAR(20),
    max_shared_companies INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    province_name TEXT,
    municipality_name TEXT,
    work_type_name TEXT,
    shares_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.province_id,
        l.municipality_id,
        l.work_type_id,
        l.ce_letter_current,
        l.ce_letter_target,
        l.estimated_budget,
        l.desired_timeline,
        l.is_urgent,
        l.project_value,
        l.publication_status,
        l.max_shared_companies,
        l.created_at,
        l.updated_at,
        p.name AS province_name,
        m.name AS municipality_name,
        wt.name AS work_type_name,
        (SELECT COUNT(*) FROM public.lead_shares ls WHERE ls.lead_id = l.id) AS shares_count
    FROM
        public.leads l
        LEFT JOIN public.provinces p ON l.province_id = p.id
        LEFT JOIN public.municipalities m ON l.municipality_id = m.id
        LEFT JOIN public.work_types wt ON l.work_type_id = wt.id
    WHERE
        l.publication_status = 'DISPONIBLE'
        AND (p_province_id IS NULL OR l.province_id = p_province_id)
        AND (p_work_type_id IS NULL OR l.work_type_id = p_work_type_id)
        AND (p_is_urgent IS NULL OR l.is_urgent = p_is_urgent)
        AND (p_min_value IS NULL OR l.project_value >= p_min_value)
        AND (p_max_value IS NULL OR l.project_value <= p_max_value)
    ORDER BY
        l.created_at DESC;
END;
$$;

-- Otorgar permisos para que los usuarios autenticados puedan llamar a esta función
GRANT EXECUTE ON FUNCTION get_available_leads(INTEGER, INTEGER, BOOLEAN, NUMERIC, NUMERIC) TO authenticated;
