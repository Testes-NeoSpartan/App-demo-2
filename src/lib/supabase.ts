import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables in Settings.');
}

// Basic URL validation
const isDashboardUrl = supabaseUrl?.includes('dashboard/project');
if (isDashboardUrl) {
  console.error('ERRO: Usaste o link do dashboard em vez do Project URL. Usa o link que termina em .supabase.co');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export const testSupabaseConnection = async () => {
  try {
    if (!supabaseUrl) return { success: false, message: 'Falta configurar o URL' };
    if (isDashboardUrl) return { success: false, message: 'Erro: Estás a usar o link do Dashboard. Usa o Project URL (.supabase.co)' };
    
    // Tentamos ler uma tabela qualquer (pode não existir)
    const { error } = await supabase.from('_healthcheck').select('*').limit(1);
    
    // Se o erro for "PGRST116" (tabela não encontrada) ou "PGRST103" (schema cache), 
    // significa que a ligação ao servidor funcionou, mas a base de dados está vazia!
    if (error) {
      if (error.code === 'PGRST116' || error.code === 'PGRST103' || error.message.includes('schema cache')) {
        return { success: true, message: 'Ligado! (Base de Dados Vazia)' };
      }
      return { success: false, message: `Erro: ${error.message}` };
    }
    
    return { success: true, message: 'Ligado com Sucesso!' };
  } catch (err) {
    return { success: false, message: 'Erro de Rede ou Configuração' };
  }
};
