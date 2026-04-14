import { Request, Response } from 'express';
import pool from '../db.ts';

export const getDeliveries = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT d.*, o.total_price, u.first_name, u.last_name, u.phone 
      FROM deliveries d 
      JOIN orders o ON d.order_id = o.id 
      JOIN users u ON o.user_id = u.id 
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des livraisons.' });
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { delivery_status, delivery_person_name, estimated_delivery_time, actual_delivery_time } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update delivery status
    const result = await client.query(
      `UPDATE deliveries 
       SET delivery_status = $1, delivery_person_name = $2, estimated_delivery_time = $3, actual_delivery_time = $4 
       WHERE id = $5 RETURNING *`,
      [delivery_status, delivery_person_name, estimated_delivery_time, actual_delivery_time, id]
    );
    const delivery = result.rows[0];

    if (!delivery) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Livraison non trouvée.' });
    }

    // 2. If delivery is "livré", update order status
    if (delivery_status === 'livré') {
      // Update order status
      await client.query(
        "UPDATE orders SET status = 'livre' WHERE id = $1",
        [delivery.order_id]
      );
    }

    await client.query('COMMIT');
    res.json(delivery);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating delivery status:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la livraison.' });
  } finally {
    client.release();
  }
};
