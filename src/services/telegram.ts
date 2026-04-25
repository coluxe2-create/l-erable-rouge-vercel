const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '8642890342';

export async function sendTelegramNotification(
  message: string
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('ERREUR : VITE_TELEGRAM_BOT_TOKEN est manquant dans les variables d\'environnement.');
    return;
  }
  
  if (!TELEGRAM_CHAT_ID) {
    console.error('ERREUR : VITE_TELEGRAM_CHAT_ID est manquant dans les variables d\'environnement.');
    return;
  }
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur API Telegram:', errorData);
    } else {
      console.log('Notification Telegram envoyée avec succès');
    }
  } catch (error) {
    console.error('Erreur réseau Telegram:', error);
  }
}

export function formatOrderMessage(
  order: any,
  items: any[]
): string {
  const itemsList = items.map(item => 
    `  • ${item.name || 'Produit'} x${item.quantity} — ${Math.round(item.unit_price * item.quantity)} MAD`
  ).join('\n');

  return `
🍁 <b>NOUVELLE COMMANDE — L'Érable Rouge</b>

👤 <b>Client :</b> ${order.first_name || 'Client'}
📞 <b>Téléphone :</b> ${order.phone || 'Non renseigné'}
🚗 <b>Mode :</b> ${order.mode === 'livraison' ? '🛵 Livraison' : order.mode === 'sur place' ? '🪑 Sur place' : '🥡 Click & Collect'}
📍 <b>Adresse :</b> ${order.delivery_address || 'Sur place'}
💳 <b>Paiement :</b> ${order.payment_method === 'carte' ? '💳 Carte' : '💵 Espèces'}

🍽️ <b>Articles commandés :</b>
${itemsList}

💰 <b>TOTAL : ${Math.round(order.total_price)} MAD</b>

⏰ ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}
  `.trim();
}
