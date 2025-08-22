const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ProcessLeadRequestPayload {
  user_id: string;
  lead_id: string;
  competition_level: number;
  is_exclusive: boolean;
  credit_cost: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { user_id, lead_id, competition_level, is_exclusive, credit_cost }: ProcessLeadRequestPayload = await req.json();

    // Esta función se ejecutaría como un RPC en PostgreSQL
    // Por ahora, retornamos éxito simulado
    const response = {
      success: true,
      message: "Lead request processed successfully",
      transaction_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );

  } catch (error) {
    console.error('Error processing lead request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});