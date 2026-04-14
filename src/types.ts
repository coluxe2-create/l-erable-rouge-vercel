export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  first_name?: string;
  last_name?: string;
}

export interface Category {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  order_index: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  categories?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  livraison_frais: number;
  status: 'en_attente' | 'en_preparation' | 'en_route' | 'livre' | 'annule';
  mode: 'sur place' | 'à emporter' | 'livraison';
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  delivery_address?: string;
  delivery_status?: string;
  payment_method?: 'cash' | 'carte';
  items?: OrderItem[];
  special_notes?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Reservation {
  id: string;
  user_id: string;
  reservation_date: string;
  reservation_time: string;
  number_of_guests: number;
  status: 'en_attente' | 'confirmé' | 'rejeté' | 'annulé' | 'terminé';
  special_requests?: string;
  first_name?: string;
  phone?: string;
  created_at: string;
}

export interface Delivery {
  id: string;
  order_id: number;
  delivery_status: 'en attente' | 'en cours' | 'livré';
  delivery_address: string;
  delivery_person_name?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  total_price?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface Slide {
  id: number;
  photo_url: string;
  titre?: string;
  description?: string;
  order_index: number;
  actif: boolean;
  created_at: string;
}
