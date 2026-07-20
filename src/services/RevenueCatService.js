import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

// RevenueCat Apple public key
const REVENUECAT_IOS_KEY = 'test_HgrFwjJlIfzSkEmVgtLZoyqXsMl';

export const ENTITLEMENT_PRO = 'pro';

let initialized = false;

export const initializeRevenueCat = async () => {
  if (initialized) return;
  try {
    await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({
      apiKey: REVENUECAT_IOS_KEY,
      appUserID: null,
    });
    initialized = true;
  } catch (e) {
    console.error('RevenueCat init error:', e);
  }
};

export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (e) {
    console.error('getOfferings error:', e);
    return null;
  }
};

export const purchasePackage = async (pkg) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isActive = customerInfo.entitlements.active[ENTITLEMENT_PRO] != null;
    return { success: true, isActive, cancelled: false, customerInfo };
  } catch (e) {
    if (e.userCancelled) {
      return { success: false, isActive: false, cancelled: true };
    }
    throw e;
  }
};

export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isActive = customerInfo.entitlements.active[ENTITLEMENT_PRO] != null;
    return { success: true, isActive, customerInfo };
  } catch (e) {
    console.error('restorePurchases error:', e);
    return { success: false, isActive: false };
  }
};

export const checkSubscriptionStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_PRO] != null;
  } catch (e) {
    console.error('checkSubscriptionStatus error:', e);
    return false;
  }
};
