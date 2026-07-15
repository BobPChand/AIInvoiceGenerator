const API_ENDPOINT = 'https://superagent-02ccfade.base44.app/functions/aiChat';

export async function sendMessage(message, history = []) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'API error');
    return data.reply;
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
}
