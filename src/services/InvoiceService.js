import Constants from 'expo-constants';

const DEFAULT_API_ENDPOINT = 'https://superagent-02ccfade.base44.app/functions/aiInvoice';
const API_ENDPOINT = Constants.expoConfig?.extra?.apiEndpoint || DEFAULT_API_ENDPOINT;

export async function generateInvoice({
  prompt,
  invoiceType = 'invoice',
  country = 'CA',
  province = 'ON',
}) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        invoice_type: invoiceType,
        country,
        province,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to generate invoice');
    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
}
