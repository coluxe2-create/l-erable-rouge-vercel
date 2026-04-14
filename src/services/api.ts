import { supabase } from '../lib/supabase';
import { Category, MenuItem, Order, Reservation, Delivery, Slide } from '../types';

export const api = {
  auth: {
    login: async (credentials: any) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;
      return { token: data.session?.access_token, user: data.user };
    },
    register: async (userData: any) => {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
          }
        }
      });
      if (error) throw error;
      return data;
    },
  },
  menu: {
    getAll: async (): Promise<MenuItem[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('is_available', true)
        .order('name');
      if (error) throw error;
      return (data || []).map((item: any) => ({
        ...item,
        category_name: item.categories?.name
      }));
    },
    getCategories: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data || [];
    },
    create: async (formData: FormData) => {
      // Note: Supabase doesn't use FormData directly for inserts.
      // This is a simplified version. In a real app, you'd handle file upload to Storage first.
      const item = Object.fromEntries(formData.entries());
      const { data, error } = await supabase.from('products').insert([item]).select();
      if (error) throw error;
      return data[0];
    },
    update: async (id: string, formData: FormData) => {
      const item = Object.fromEntries(formData.entries());
      const { data, error } = await supabase.from('products').update(item).eq('id', id).select();
      if (error) throw error;
      return data[0];
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  },
  orders: {
    getAll: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    getMyOrders: async (): Promise<Order[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (orderData: any) => {
      const { data, error } = await supabase.from('orders').insert([orderData]).select();
      if (error) throw error;
      return data[0];
    },
    updateStatus: async (id: string, status: string) => {
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select();
      if (error) throw error;
      return data[0];
    },
  },
  reservations: {
    getAll: async (): Promise<Reservation[]> => {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, user_id, reservation_date, reservation_time, number_of_guests, status, special_requests, first_name, phone, created_at')
        .order('reservation_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    getMyReservations: async (): Promise<Reservation[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('reservations')
        .select('id, user_id, reservation_date, reservation_time, number_of_guests, status, special_requests, first_name, phone, created_at')
        .eq('user_id', user.id)
        .order('reservation_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (resData: any) => {
      const { data, error } = await supabase.from('reservations').insert([resData]).select('id');
      if (error) throw error;
      return data[0];
    },
    updateStatus: async (id: string, status: string) => {
      const { data, error } = await supabase.from('reservations').update({ status }).eq('id', id).select('id');
      if (error) throw error;
      return data[0];
    },
  },
  deliveries: {
    getAll: async (): Promise<Delivery[]> => {
      const { data, error } = await supabase.from('deliveries').select('*');
      if (error) throw error;
      return data || [];
    },
    updateStatus: async (id: string, updateData: any) => {
      const { data, error } = await supabase.from('deliveries').update(updateData).eq('id', id).select();
      if (error) throw error;
      return data[0];
    },
  },
  slides: {
    getAll: async (): Promise<Slide[]> => {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data || [];
    },
    create: async (formData: FormData) => {
      const item = Object.fromEntries(formData.entries());
      const { data, error } = await supabase.from('slides').insert([item]).select();
      if (error) throw error;
      return data[0];
    },
    update: async (id: number, formData: FormData) => {
      const item = Object.fromEntries(formData.entries());
      const { data, error } = await supabase.from('slides').update(item).eq('id', id).select();
      if (error) throw error;
      return data[0];
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('slides').delete().eq('id', id);
      if (error) throw error;
      return true;
    },
    reorder: async (slides: { id: number, order_index: number }[]) => {
      // Bulk update is tricky in client-side Supabase without a RPC.
      // We'll do it sequentially for now or assume an RPC exists.
      for (const s of slides) {
        await supabase.from('slides').update({ order_index: s.order_index }).eq('id', s.id);
      }
      return true;
    },
  },
};
