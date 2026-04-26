// Bot 1 — Ancien bot → L'Erable Rouge (8642890342)
const BOT1_TOKEN = '8708382642:AAFTdjbsd7YZefCoLold56V2vUVoh_6F50A'
const CHAT1_ID = '8642890342'

// Bot 2 — Nouveau bot → Youness (6468967382)
const BOT2_TOKEN = '8791426645:AAHXp-CRIlsDAeXHtmvDi0J26vy3qUcQNoI'
const CHAT2_ID = '6468967382'

async function sendMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<void> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
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
      console.warn(`Erreur bot ${chatId}:`, result.description)
    } else {
      console.log(`✓ Envoyé à ${chatId}`)
    }
  } catch (error) {
    console.error(`Erreur ${chatId}:`, error)
  }
}

export async function sendTelegramNotification(
  message: string
): Promise<void> {
  await Promise.all([
    sendMessage(BOT1_TOKEN, CHAT1_ID, message),
    sendMessage(BOT2_TOKEN, CHAT2_ID, message),
  ])
}

export function formatOrderMessage(
  order: any,
  items: any[]
): string {
  const itemsList = items.map(item =>
    `• ${item.name} x${item.quantity} — ${Math.round(Number(item.unit_price) * Number(item.quantity))} MAD`
  ).join('\n')

  const modeLabel: Record<string, string> = {
    'livraison': '🛵 Livraison',
    'sur_place': '🪑 Sur place',
    'click_collect': '🥡 Click & Collect'
  }

  const paymentLabel = order.payment_method === 'carte'
    ? '💳 Carte bancaire'
    : '💵 Espèces'

  return `
🍁 <b>NOUVELLE COMMANDE — L'Érable Rouge</b>

👤 <b>Client :</b> ${order.first_name || 'Client'}
📞 <b>Téléphone :</b> ${order.phone || 'Non renseigné'}
🚗 <b>Mode :</b> ${modeLabel[order.mode] || order.mode}
📍 <b>Adresse :</b> ${order.delivery_address || 'Sur place'}
💳 <b>Paiement :</b> ${paymentLabel}

🍽️ <b>Articles commandés :</b>
${itemsList}

━━━━━━━━━━━━━━━
💰 <b>TOTAL : ${Math.round(order.total_price)} MAD</b>
⏰ ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}
  `.trim()
}

export function formatStatusMessage(
  orderId: string,
  newStatus: string,
  clientName: string
): string {
  const statusLabel: Record<string, string> = {
    'en_preparation': '🔵 EN PRÉPARATION',
    'en_route': '🛵 EN ROUTE',
    'livre': '✅ LIVRÉ',
    'annule': '❌ ANNULÉ'
  }

  return `
🍁 <b>L'Érable Rouge</b>

📦 Commande <b>#${orderId.slice(-4).toUpperCase()}</b>
👤 Client : ${clientName}
🔄 Statut : <b>${statusLabel[newStatus] || newStatus}</b>
⏰ ${new Date().toLocaleString('fr-FR', {
    timeZone: 'Africa/Casablanca'
  })}
  `.trim()
}
