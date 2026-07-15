// Development mock for RevenueCat / react-native-purchases.
// This module intentionally avoids importing native modules so the Expo
// managed workflow can run during development. Replace with the real
// implementation when building production binaries.

export const ENTITLEMENT_PRO = 'pro';

export const initializeRevenueCat = async () => {
  if (__DEV__) {
    console.warn('initializeRevenueCat: running in DEV mode; RevenueCat is mocked.');
  }
  return;
};

export const getOfferings = async (publicApiKey = null) => {
  if (__DEV__) {
    console.warn(`initializeRevenueCat: RevenueCat public API key supplied: ${Boolean(publicApiKey)}`);
    return null;
  }
  return null;
};

export const purchasePackage = async () => {
  if (__DEV__) return { success: false, isActive: false, cancelled: true };
  return { success: false, isActive: false, cancelled: true };
};

export const restorePurchases = async () => {
  if (__DEV__) return { success: false, isActive: false };
  return { success: false, isActive: false };
};

export const checkSubscriptionStatus = async () => {
  if (__DEV__) return false;
  return false;
};
