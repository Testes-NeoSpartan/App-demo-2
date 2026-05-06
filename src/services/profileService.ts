import { supabase } from '../lib/supabase';
import { User } from '../types';

export const profileService = {
  async updateProfile(user: User) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          avatar_url: user.avatarSeed,
          age: user.age,
          city: user.city,
          postpartum_week: user.postpartumWeek,
          password: user.password, // Ideally use Supabase Auth, but using table for simplicity as requested
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'email'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao guardar no Supabase:', error);
      return { success: false, error };
    }
  },

  async getProfile(email: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found is not an error for us
        throw error;
      }
      
      // Map database fields to User type
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        password: data.password,
        age: data.age,
        city: data.city,
        postpartumWeek: data.postpartum_week || 1,
        avatarSeed: data.avatar_url || 'Sophia'
      } as User;
    } catch (error) {
      console.error('Erro ao ler perfil do Supabase:', error);
      throw error;
    }
  }
};
