-- Schéma SQL pour l'application "L'Érable Rouge"
-- Compatible Neon PostgreSQL

-- Extensions (optionnel, mais utile pour les UUID si besoin)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table des utilisateurs (Clients + Admins)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ar VARCHAR(100),
    image_url TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des articles du menu (Produits)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'en_preparation', 'en_route', 'livre', 'annule')),
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    mode VARCHAR(20) DEFAULT 'sur place' CHECK (mode IN ('sur place', 'à emporter', 'livraison')),
    payment_method VARCHAR(50) DEFAULT 'especes',
    first_name VARCHAR(100),
    phone VARCHAR(20),
    special_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Détails des articles de la commande
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- 6. Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100),
    phone VARCHAR(20),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
    status VARCHAR(50) DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'confirmé', 'rejeté', 'annulé', 'terminé')),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table des livraisons
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    delivery_address TEXT NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'en attente' CHECK (delivery_status IN ('en attente', 'en cours', 'livré', 'échec')),
    delivery_person_name VARCHAR(100),
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Politiques de suppression pour l'admin
-- Note: Ces politiques supposent que RLS est activé. 
-- Si RLS n'est pas activé, elles n'auront aucun effet mais sont bonnes pour la documentation.
DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;
CREATE POLICY "Admin can delete orders" ON public.orders FOR DELETE USING (true);

DROP POLICY IF EXISTS "Admin can delete order_items" ON public.order_items;
CREATE POLICY "Admin can delete order_items" ON public.order_items FOR DELETE USING (true);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Table des slides (Carousel)
CREATE TABLE IF NOT EXISTS slides (
    id SERIAL PRIMARY KEY,
    photo_url TEXT NOT NULL,
    titre VARCHAR(255),
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données par défaut (si vide)
INSERT INTO categories (id, name, description, order_index)
SELECT 'plats-signature', 'Plats Signature', 'Nos meilleures créations culinaires.', 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Plats Signature');

INSERT INTO categories (id, name, description, order_index)
SELECT 'entrees-fraiches', 'Entrées Fraîches', 'Pour bien commencer votre repas.', 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Entrées Fraîches');

INSERT INTO categories (id, name, description, order_index)
SELECT 'desserts-gourmands', 'Desserts Gourmands', 'Une touche sucrée pour finir en beauté.', 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Desserts Gourmands');

INSERT INTO categories (id, name, description, order_index)
SELECT 'jus-cocktails', 'Jus & Cocktails', 'Rafraîchissements naturels.', 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Jus & Cocktails');

INSERT INTO slides (photo_url, titre, description, order_index, is_active)
SELECT 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000', 'L''Érable Rouge', 'Une expérience culinaire unique à Agadir.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM slides WHERE titre = 'L''Érable Rouge');

INSERT INTO slides (photo_url, titre, description, order_index, is_active)
SELECT 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&q=80&w=2000', 'Saveurs Authentiques', 'Des produits frais sélectionnés avec soin.', 2, true
WHERE NOT EXISTS (SELECT 1 FROM slides WHERE titre = 'Saveurs Authentiques');

-- 10. Insertion de plats par défaut (si vide)
INSERT INTO products (category_id, name, description, price, image_url, is_available)
SELECT (SELECT id FROM categories WHERE name = 'Plats Signature'), 'Tagine Royal de l''Atlas', 'Agneau de sept heures, pruneaux caramélisés et amandes grillées.', 180, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Tagine Royal de l''Atlas');

INSERT INTO products (category_id, name, description, price, image_url, is_available)
SELECT (SELECT id FROM categories WHERE name = 'Plats Signature'), 'Couscous Impérial', 'Semoule fine, sept légumes de saison et bouillon parfumé au safran.', 150, 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&q=80&w=800', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Couscous Impérial');

INSERT INTO products (category_id, name, description, price, image_url, is_available)
SELECT (SELECT id FROM categories WHERE name = 'Entrées Fraîches'), 'Salade Marocaine Fine', 'Tomates, concombres, oignons rouges et coriandre fraîche.', 45, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Salade Marocaine Fine');

INSERT INTO products (category_id, name, description, price, image_url, is_available)
SELECT (SELECT id FROM categories WHERE name = 'Desserts Gourmands'), 'Pastilla au Lait', 'Feuilletage croustillant, crème à la fleur d''oranger et amandes.', 65, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Pastilla au Lait');
