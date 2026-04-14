export async function sendTelegramMessage(message: string) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[Telegram] Service non configuré. Notification ignorée.');
    return;
  }

  // Check if fetch is available (Node 18+)
  if (typeof fetch === 'undefined') {
    console.warn('[Telegram] Fetch API not available. Skipping notification.');
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[ERROR] Failed to send Telegram message:', errorData);
    } else {
      console.log('[INFO] Telegram message sent successfully.');
    }
  } catch (error) {
    console.error('[ERROR] Error sending Telegram message:', error);
  }
};
