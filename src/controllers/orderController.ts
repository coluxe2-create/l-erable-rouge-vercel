import { Request, Response } from 'express';
import pool from '../db.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { sendTelegramMessage } from '../services/telegramService.ts';

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { items, mode, delivery_address, first_name, phone, payment_method } = req.body;
  const user_id = req.user?.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create Order
    console.log(`[DEBUG] Creating order. user_id: ${user_id}, first_name: ${first_name}`);
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, mode, status, first_name, phone, payment_method) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [user_id, mode, 'en_attente', first_name, phone, payment_method || 'cash']
    );
    const orderId = orderResult.rows[0].id;

    let totalAmount = 0;
    let itemsDetails = '';

    // 2. Create Order Items
    for (const item of items) {
      const { product_id, quantity } = item;
      const menuResult = await client.query('SELECT name, price FROM products WHERE id = $1', [product_id]);
      const { name, price: unitPrice } = menuResult.rows[0];
      const subtotal = unitPrice * quantity;
      totalAmount += subtotal;

      itemsDetails += `- ${name} x${quantity} (${subtotal} DH)\n`;

      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [orderId, product_id, quantity, unitPrice]
      );
    }

    // 3. Update Order Total
    const finalTotal = totalAmount;

    await client.query(
      'UPDATE orders SET total_price = $1 WHERE id = $2',
      [finalTotal, orderId]
    );

    // 4. Create Delivery if needed
    if (mode === 'livraison' && delivery_address) {
      await client.query(
        'INSERT INTO deliveries (order_id, delivery_address) VALUES ($1, $2)',
        [orderId, delivery_address]
      );
    }

    await client.query('COMMIT');

    // 5. Send Telegram Notification
    const telegramMessage = `
<b>🔔 Nouvelle Commande !</b>
<b>ID:</b> #${orderId}
<b>Client:</b> ${first_name || 'Anonyme'}
<b>Téléphone:</b> ${phone || 'Non renseigné'}
<b>Type:</b> ${mode === 'livraison' ? '🚚 Livraison' : '🥡 À emporter'}
${mode === 'livraison' ? `<b>Adresse:</b> ${delivery_address}\n` : ''}
<b>Articles:</b>
${itemsDetails}
<b>Total:</b> ${finalTotal} DH
    `;
    
    sendTelegramMessage(telegramMessage);

    res.status(201).json({ id: orderId, total_price: totalAmount });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
  } finally {
    client.release();
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  const user_id = req.user?.id;
  const role = req.user?.role;

  console.log(`[DEBUG] getOrders - user_id: ${user_id}, role: ${role}`);

  try {
    let query = `
      SELECT 
        o.*,
        u.first_name, u.last_name, u.email, u.phone,
        d.delivery_address, d.delivery_status,
        (
          SELECT json_agg(json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'name', mi.name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal
          ))
          FROM order_items oi
          JOIN products mi ON oi.product_id = mi.id
          WHERE oi.order_id = o.id
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN deliveries d ON o.id = d.order_id
    `;
    let params = [];

    if (role !== 'admin') {
      if (!user_id) {
        console.error('[ERROR] getOrders - No user_id found in request');
        return res.status(401).json({ error: 'Utilisateur non identifié.' });
      }
      query += ' WHERE o.user_id = $1::uuid';
      params.push(user_id);
    }

    query += ' ORDER BY o.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('[ERROR] getOrders - Database error:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des commandes.',
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update Order Status
    const result = await client.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    const order = result.rows[0];

    if (!order) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    // 2. If status is "en_route", handle delivery
    if (status === 'en_route' && order.mode === 'livraison') {
      // Ensure delivery entry exists and update its status
      const deliveryCheck = await client.query('SELECT id FROM deliveries WHERE order_id = $1', [id]);
      
      if (deliveryCheck.rows.length > 0) {
        await client.query(
          'UPDATE deliveries SET delivery_status = $1 WHERE order_id = $2',
          ['en cours', id]
        );
      } else {
        // This shouldn't happen if createOrder worked correctly, but let's be safe
        // If it doesn't exist, we might not have the address here.
        // Let's try to find if we can get an address from anywhere else or just log it.
        console.warn(`[WARN] Delivery entry missing for order ${id} during "en_route" update`);
      }
    }
    
    // 3. If status is "livre", update delivery status too
    if (status === 'livre' && order.mode === 'livraison') {
      await client.query(
        'UPDATE deliveries SET delivery_status = $1, actual_delivery_time = CURRENT_TIMESTAMP WHERE order_id = $2',
        ['livré', id]
      );
    }

    await client.query('COMMIT');
    res.json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut.' });
  } finally {
    client.release();
  }
};
