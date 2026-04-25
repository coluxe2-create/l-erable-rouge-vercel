-- Vérifier et corriger les policies RLS
-- Ce script doit être exécuté dans le SQL Editor de Supabase

-- Activer RLS sur les tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view active ads" ON public.advertisements;

-- Créer les nouvelles policies pour la lecture publique
CREATE POLICY "Public can view products" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Public can view categories" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Public can view active ads"
ON public.advertisements FOR SELECT 
USING (is_active = true);

-- Note: Pour les opérations d'écriture (INSERT, UPDATE, DELETE), 
-- elles sont généralement réservées aux administrateurs authentifiés.

-- Politiques de suppression pour l'admin
DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;
CREATE POLICY "Admin can delete orders"
ON public.orders FOR DELETE
USING (true);

DROP POLICY IF EXISTS "Admin can delete order_items" ON public.order_items;
CREATE POLICY "Admin can delete order_items"
ON public.order_items FOR DELETE
USING (true);

-- Politiques pour les commandes
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to create orders" ON public.orders;
CREATE POLICY "Allow public to create orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to create order_items" ON public.order_items;
CREATE POLICY "Allow public to create order_items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
CREATE POLICY "Public can view order items" ON public.order_items FOR SELECT USING (true);

-- Gérer la table livraisons (deliveries) avec détection automatique du type de clé
DO $$ 
DECLARE 
    id_type text;
BEGIN
    SELECT data_type INTO id_type 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'id';

    IF id_type IS NOT NULL THEN
        DROP TABLE IF EXISTS public.deliveries CASCADE;

        IF id_type = 'uuid' THEN
            CREATE TABLE public.deliveries (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
                delivery_address TEXT NOT NULL,
                delivery_status VARCHAR(50) DEFAULT 'en attente',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        ELSE
            CREATE TABLE public.deliveries (
                id SERIAL PRIMARY KEY,
                order_id BIGINT UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
                delivery_address TEXT NOT NULL,
                delivery_status VARCHAR(50) DEFAULT 'en attente',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        END IF;

        ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow public to create deliveries" ON public.deliveries FOR INSERT WITH CHECK (true);
        CREATE POLICY "Public can view deliveries" ON public.deliveries FOR SELECT USING (true);
    END IF;
END $$;
