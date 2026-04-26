const BOT_TOKEN = '8791426645:AAHXp-CRIlsDAeXHtmvDi0J26vy3qUcQNoI'

const TELEGRAM_RECIPIENTS = [
  '8642890342',
  '6468967382'
]

async function sendToOne(
  chatId: string,
  message: string
): Promise<void> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      }
    )
    const result = await response.json()
    if (!result.ok) {
      console.warn(`Telegram erreur pour ${chatId}:`, result)
    } else {
      console.log(`Telegram envoyé à ${chatId} ✓`)
    }
  } catch (error) {
    console.error(`Erreur Telegram ${chatId}:`, error)
  }
}

export async function sendTelegramNotification(
  message: string
): Promise<void> {
  // Envoyer aux 2 comptes en parallèle
  await Promise.all(
    TELEGRAM_RECIPIENTS.map(chatId => 
      sendToOne(chatId, message)
    )
  )
}

export function formatOrderMessage(
  order: any,
  items: any[]
): string {
  const itemsList = items.map(item =>
    `  • ${item.name} x${item.quantity} — ${Math.round(Number(item.unit_price) * Number(item.quantity))} MAD`
  ).join('\n')

  const modeEmoji = {
    'livraison': '🛵',
    'sur_place': '🪑',
    'click_collect': '🥡'
  }[order.mode] || '🚗'

  const paymentEmoji = order.payment_method === 'carte' ? '💳' : '💵'

  return `
🍁 <b>NOUVELLE COMMANDE</b>
<b>L'Érable Rouge — Agadir</b>
━━━━━━━━━━━━━━━━━━━

👤 <b>Client :</b> ${order.first_name || 'Client'}
📞 <b>Téléphone :</b> ${order.phone || 'Non renseigné'}
${modeEmoji} <b>Mode :</b> ${order.mode || 'livraison'}
📍 <b>Adresse :</b> ${order.delivery_address || 'Sur place'}
${paymentEmoji} <b>Paiement :</b> ${order.payment_method === 'carte' ? 'Carte bancaire' : 'Espèces'}

🍽️ <b>Articles :</b>
${itemsList}

━━━━━━━━━━━━━━━━━━━
💰 <b>TOTAL : ${Math.round(order.total_price)} MAD</b>
⏰ ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}
  `.trim()
}

export function formatStatusMessage(
  orderId: string,
  newStatus: string,
  clientName: string
): string {
  const statusEmoji: Record<string, string> = {
    'en_preparation': '🔵 EN PRÉPARATION',
    'en_route': '🛵 EN ROUTE',
    'livre': '✅ LIVRÉ',
    'annule': '❌ ANNULÉ'
  }

  return `
🍁 <b>L'Érable Rouge</b>

📦 Commande <b>#${orderId.slice(-4).toUpperCase()}</b>
👤 Client : ${clientName}
🔄 Nouveau statut : <b>${statusEmoji[newStatus] || newStatus}</b>
⏰ ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}
  `.trim()
}
