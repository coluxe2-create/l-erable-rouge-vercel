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

-- Autoriser la création de commandes par tout le monde (clients)
DROP POLICY IF EXISTS "Allow public to create orders" ON public.orders;
CREATE POLICY "Allow public to create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to create order_items" ON public.order_items;
CREATE POLICY "Allow public to create order_items"
ON public.order_items FOR INSERT
WITH CHECK (true);

-- Permettre aux clients de voir leurs propres commandes (si authentifiés) ou via ID
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (true);

-- Politiques pour la table livraisons
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public to create deliveries" ON public.deliveries;
CREATE POLICY "Allow public to create deliveries"
ON public.deliveries FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view deliveries" ON public.deliveries;
CREATE POLICY "Public can view deliveries"
ON public.deliveries FOR SELECT
USING (true);
