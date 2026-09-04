import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://superagent-02ccfade.base44.app/functions';

export const STORAGE_KEYS = {
  IS_SUBSCRIBED: 'invoiceai_subscribed',
  AI_CONSENT: 'invoiceai_ai_consent',
  SAVED_CONTENT: 'invoiceai_saved_videos',
  USER_EMAIL: 'user_email',
};

export async function getAvatarUsage() {
  try {
    const email = (await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL)) || 'guest';
    const response = await fetch(`${API_BASE}/checkAvatarUsage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'check',
        user_email: email,
        app_name: 'InvoiceAI',
      }),
    });
    const data = await response.json();
    return {
      videosThisMonth: data.videos_this_month || 0,
      subscriptionLimit: data.subscription_limit || 10,
      subscriptionRemaining: data.subscription_remaining || 0,
      freeMonthlyLimit: data.free_monthly_limit || 10,
      freeRemaining: data.free_remaining || 0,
      purchasedRemaining: data.purchased_remaining || 0,
      totalRemaining: data.total_remaining !== undefined ? data.total_remaining : 10,
      canGenerate: data.can_generate !== undefined ? data.can_generate : true,
    };
  } catch (e) {
    console.warn('Error checking avatar usage:', e);
    return {
      videosThisMonth: 0,
      subscriptionLimit: 10,
      subscriptionRemaining: 10,
      freeMonthlyLimit: 10,
      freeRemaining: 10,
      purchasedRemaining: 0,
      totalRemaining: 10,
      canGenerate: true,
    };
  }
}

export async function incrementAvatarUsage() {
  try {
    const email = (await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL)) || 'guest';
    const response = await fetch(`${API_BASE}/checkAvatarUsage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'increment',
        user_email: email,
        app_name: 'InvoiceAI',
      }),
    });
    const data = await response.json();
    return {
      success: data.success || false,
      subscriptionRemaining: data.subscription_remaining || 0,
      purchasedRemaining: data.purchased_remaining || 0,
      totalRemaining: data.total_remaining || 0,
      canGenerate: data.can_generate || false,
    };
  } catch (e) {
    console.warn('Error incrementing avatar usage:', e);
    return { success: false, totalRemaining: 0, canGenerate: false };
  }
}

export async function addAvatarCredits(creditsToAdd) {
  try {
    const email = (await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL)) || 'guest';
    const response = await fetch(`${API_BASE}/checkAvatarUsage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_credits',
        user_email: email,
        app_name: 'InvoiceAI',
        credits_to_add: creditsToAdd,
      }),
    });
    const data = await response.json();
    return data.success || false;
  } catch (e) {
    console.warn('Error adding avatar credits:', e);
    return false;
  }
}

export async function createAvatarVideo(script, voice_id, presenter_id) {
  const email = (await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL)) || 'guest';
  const response = await fetch(`${API_BASE}/createAvatarVideo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      script,
      voice_id: voice_id || '330290724a1b470fb63153f34d4c0183',
      presenter_id: presenter_id || 'Adriana_BizTalk_Front_public',
      presenter_name: 'Alice',
      user_email: email,
    }),
  });
  return response.json();
}

export async function getAvatarVideoStatus(video_id) {
  const response = await fetch(`${API_BASE}/getAvatarVideoStatus?video_id=${video_id}`);
  return response.json();
}
