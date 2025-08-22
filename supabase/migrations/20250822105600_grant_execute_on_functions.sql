-- Grant execute permissions on RPC functions to authenticated users

GRANT EXECUTE ON FUNCTION get_user_dashboard_stats(p_user_id UUID, p_start_date TIMESTAMPTZ, p_end_date TIMESTAMPTZ) 
TO authenticated;

GRANT EXECUTE ON FUNCTION get_roi_chart_data(p_user_id UUID, p_days INTEGER) 
TO authenticated;

GRANT EXECUTE ON FUNCTION process_credit_recharge(p_user_id UUID, p_amount INTEGER, p_description TEXT) 
TO authenticated;

GRANT EXECUTE ON FUNCTION process_lead_request(p_user_id UUID, p_lead_id UUID, p_competition_level INTEGER, p_is_exclusive BOOLEAN, p_credit_cost INTEGER) 
TO authenticated;

GRANT EXECUTE ON FUNCTION get_global_system_stats() 
TO authenticated;
