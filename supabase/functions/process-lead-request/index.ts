// supabase/functions/process-lead-request/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend';

// ¡MUY IMPORTANTE!
// Para que esta función pueda enviar correos, necesitas una cuenta en Resend (ofrecen un plan gratuito).
// 1. Regístrate en https://resend.com
// 2. Crea una API Key.
// 3. Añade la API Key a los "secrets" de tu proyecto de Supabase con el siguiente comando:
//    supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
//    (Reemplaza re_xxxxxxxxxxxxxxxx con tu API key real)
// 4. Verifica tu dominio en Resend para poder enviar correos desde tu dirección.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const resend = new Resend(RESEND_API_KEY);

// Definimos una interfaz para la estructura de los datos del formulario
interface LeadData {
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  service_interest: string;
  estimated_monthly_consumption: number;
  has_battery?: boolean;
  notes?: string;
}

serve(async (req) => {
  // --- Manejo de CORS ---
  // Es necesario para permitir que tu aplicación web llame a esta función
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // --- Validación y obtención de datos ---
    const leadData: LeadData = await req.json();
    if (!leadData.email || !leadData.name || !leadData.phone) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios: nombre, email y teléfono.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // --- Creación del cliente de Supabase con rol de servicio ---
    // Usamos el Service Role Key para tener permisos elevados y saltarnos las políticas de RLS.
    // Esto asegura que la función siempre pueda insertar datos.
    // ¡IMPORTANTE! Asegúrate de que estas variables de entorno están configuradas en tu proyecto Supabase.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Inserción en la base de datos ---
    const { data: newLead, error: insertError } = await supabaseAdmin
      .from('leads')
      .insert({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        company_name: leadData.company_name,
        service_interest: leadData.service_interest,
        estimated_monthly_consumption: leadData.estimated_monthly_consumption,
        has_battery: leadData.has_battery,
        notes: leadData.notes,
        status: 'Nuevo', // Asignamos un estado inicial
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error al insertar en Supabase:', insertError);
      throw new Error(`Error en la base de datos: ${insertError.message}`);
    }

    // --- Envío del email de confirmación ---
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Equipo Conecta Rehabilita 360 <noreply@tu-dominio-verificado.com>', // ¡CAMBIA ESTO! Usa tu dominio verificado en Resend
      to: [leadData.email],
      subject: 'Hemos recibido tu solicitud de diagnóstico',
      html: `
        <h1>¡Hola ${leadData.name}!</h1>
        <p>Gracias por contactar con Conecta Rehabilita 360.</p>
        <p>Hemos recibido correctamente tu formulario y nuestro equipo ya está trabajando en él. En breve, recibirás un primer diagnóstico energético basado en la información que nos has proporcionado.</p>
        <p>Si tienes cualquier duda, puedes responder a este correo.</p>
        <p>Un saludo,</p>
        <p><strong>El equipo de Conecta Rehabilita 360</strong></p>
      `,
    });

    if (emailError) {
      // Si el email falla, lo registramos pero no detenemos el proceso.
      // El lead ya está en el sistema, que es lo más importante.
      console.error('Error al enviar el email con Resend:', emailError);
      // Podrías aquí actualizar el lead en la BBDD para marcar que el email falló.
    }

    // --- Respuesta de éxito ---
    return new Response(JSON.stringify({ success: true, lead: newLead, email: emailData }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });

  } catch (error) {
    // --- Respuesta de error general ---
    console.error('Error en la función:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    });
  }
});
