// src/components/Pipeline/CommercialPipeline.tsx

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

// Definimos una interfaz para la estructura de los datos del formulario
interface FormData {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  service_interest: string;
  estimated_monthly_consumption: number;
  has_battery: boolean;
  notes: string;
}

const CommercialPipeline: React.FC = () => {
  // Estado para manejar los datos del formulario
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    service_interest: 'autoconsumo',
    estimated_monthly_consumption: 1500,
    has_battery: false,
    notes: '',
  });

  // Estados para gestionar el envío y la respuesta
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manejador para actualizar el estado cuando cambian los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Si es un checkbox, manejamos el valor 'checked'
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Manejador para el envío del formulario
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reiniciamos los estados y activamos el de carga
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Invocamos la Edge Function de Supabase con los datos del formulario
      const { data, error: invokeError } = await supabase.functions.invoke('process-lead-request', {
        body: formData,
      });

      // Si la función devuelve un error, lo capturamos
      if (invokeError) {
        throw new Error(`Error al invocar la función: ${invokeError.message}`);
      }
      
      // La función puede devolver un error en su lógica interna (ej: validación)
      if (data.error) {
        throw new Error(data.error);
      }

      // Si todo va bien, mostramos un mensaje de éxito y reseteamos el formulario
      setSuccess('¡Formulario enviado con éxito! Hemos enviado un email de confirmación a tu correo.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        service_interest: 'autoconsumo',
        estimated_monthly_consumption: 1500,
        has_battery: false,
        notes: '',
      });

    } catch (err: any) {
      // Si ocurre cualquier error, lo mostramos al usuario
      console.error("Error en el envío del formulario:", err);
      setError(err.message || 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.');
    } finally {
      // Desactivamos el estado de carga, haya ido bien o mal
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Añadir Nuevo Lead</h2>
      
      {/* Contenedor para los mensajes de éxito y error */}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      <form onSubmit={handleLeadSubmit} className="space-y-4">
        {/* Campo Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Campo Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        {/* Campo Teléfono */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* ... (aquí irían el resto de tus campos del formulario, que he omitido por brevedad pero que funcionarían igual) ... */}

        {/* Botón de envío */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enviando...' : 'Enviar Formulario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommercialPipeline;
