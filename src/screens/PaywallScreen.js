import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getOfferings,
  purchasePackage,
  purchaseProductDirect,
  getProductsDirect,
  restorePurchases,
} from '../services/RevenueCatService';

const FEATURES = [
  { icon: 'document-text', text: 'Unlimited AI Invoices & Quotes' },
  { icon: 'calculator', text: 'Auto GST/HST/PST/QST by Province' },
  { icon: 'document-attach', text: 'Professional PDF Export' },
  { icon: 'people', text: 'Client Contact Management' },
  { icon: 'time', text: 'Payment Status Tracking' },
  { icon: 'shield-checkmark', text: 'Bank-level Data Encryption' },
];

export default function PaywallScreen({ navigation }) {
  const [packages, setPackages] = useState([]);
  const [directProducts, setDirectProducts] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setLoading(true);
    try {
      const current = await getOfferings();
      if (current && current.availablePackages && current.availablePackages.length > 0) {
        setPackages(current.availablePackages);
        const monthly = current.availablePackages.find(
          p => p.identifier === '$rc_monthly' || p.identifier === 'monthly'
        ) || current.availablePackages[0];
        setSelectedPkg(monthly);
      } else {
        // Fallback: fetch products directly from StoreKit
        const products = await getProductsDirect();
        if (products.length > 0) {
          setDirectProducts(products);
          const monthly = products.find(p => p.identifier.includes('monthly')) || products[0];
          setSelectedProduct(monthly);
        } else {
          Alert.alert('Error', 'Could not load subscription options. Please check your connection.');
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Could not load subscription options. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPkg && !selectedProduct) return;
    setPurchasing(true);
    try {
      let result;
      if (selectedPkg) {
        result = await purchasePackage(selectedPkg);
      } else {
        result = await purchaseProductDirect(selectedProduct);
      }
      if (result.success && result.isActive) {
        Alert.alert('Welcome to Pro!', 'Your subscription is now active. Enjoy all features!',
          [{ text: 'Get Started', onPress: () => navigation.replace('Home') }]);
      }
    } catch (e) {
      Alert.alert('Purchase Failed', e.message || 'Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await restorePurchases();
      if (result.isActive) {
        Alert.alert('Purchase Restored', 'Your Pro access has been restored.',
          [{ text: 'Continue', onPress: () => navigation.replace('Home') }]);
      } else {
        Alert.alert('Nothing to Restore', 'We could not find an active purchase for this Apple ID.');
      }
    } catch (e) {
      Alert.alert('Restore Failed', e.message || 'Could not restore purchases.');
    } finally {
      setRestoring(false);
    }
  };

  const formatPrice = (item) => {
    if (item?.product?.priceString) return item.product.priceString;
    if (item?.priceString) return item.priceString;
    return '';
  };

  const getIdentifier = (item) => {
    return item?.identifier || item?.identifier || '';
  };

  const getPackageType = (item) => {
    if (!item) return 'monthly';
    const id = (getIdentifier(item) || '').toLowerCase();
    if (id.includes('annual') || id.includes('yearly') || item.packageType === 'ANNUAL') return 'yearly';
    return 'monthly';
  };

  const isItemSelected = (item) => {
    if (selectedPkg) return selectedPkg?.identifier === item?.identifier;
    return selectedProduct?.identifier === item?.identifier;
  };

  const handleSelect = (item) => {
    if (packages.length > 0) {
      setSelectedPkg(item);
      setSelectedProduct(null);
    } else {
      setSelectedProduct(item);
      setSelectedPkg(null);
    }
  };

  const getSelectedItem = () => selectedPkg || selectedProduct;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E6FD9" />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allItems = packages.length > 0 ? packages : directProducts;
  const sortOrder = { monthly: 0, yearly: 1, lifetime: 2 };
  const sortedItems = [...allItems].sort((a, b) => {
    return (sortOrder[getPackageType(a)] ?? 3) - (sortOrder[getPackageType(b)] ?? 3);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Ionicons name="sparkles" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>AI Invoice Generator</Text>
          <Text style={styles.subtitle}>Pro</Text>
          <Text style={styles.trial}>Start your 7-day FREE trial</Text>
        </View>

        <View style={styles.featuresCard}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={18} color="#1E6FD9" />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
              <Ionicons name="checkmark-circle" size={18} color="#34C759" />
            </View>
          ))}
        </View>

        <View style={styles.plansColumn}>
          {sortedItems.map((item) => {
            const type = getPackageType(item);
            const selected = isItemSelected(item);
            return (
              <TouchableOpacity
                key={getIdentifier(item)}
                style={[styles.planCard, selected && styles.planCardSelected]}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.planLeft}>
                  <Text style={[styles.planLabel, selected && styles.planLabelSelected]}>
                    {type === 'yearly' ? 'Yearly' : 'Monthly'}
                  </Text>
                  {type === 'yearly' && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>Save 33%</Text>
                    </View>
                  )}
                </View>
                <View style={styles.planRight}>
                  <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
                    {formatPrice(item)}
                  </Text>
                  <Text style={[styles.planPeriod, selected && styles.planPeriodSelected]}>
                    {type === 'yearly' ? '/year' : '/month'}
                  </Text>
                </View>
                {selected && (
                  <Ionicons name="checkmark-circle" size={20} color="#1E6FD9" style={styles.planCheck} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handlePurchase}
          disabled={purchasing || !getSelectedItem()}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.ctaText}>Start Free Trial</Text>
              <Text style={styles.ctaSub}>
                {getPackageType(getSelectedItem()) === 'yearly'
                  ? `Then ${formatPrice(getSelectedItem())}/year \u00B7 Cancel anytime`
                  : `Then ${formatPrice(getSelectedItem())}/month \u00B7 Cancel anytime`}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={restoring}>
          {restoring
            ? <ActivityIndicator size="small" color="#8E8E93" />
            : <Text style={styles.restoreText}>Restore Purchases</Text>}
        </TouchableOpacity>

        <Text style={styles.footer}>
          Payment will be charged to your Apple ID account. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. Manage subscriptions in App Store settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: '#8E8E93', fontSize: 15 },
  scroll: { padding: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  iconBadge: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#1E6FD9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  subtitle: { fontSize: 18, fontWeight: '700', color: '#1E6FD9' },
  trial: { marginTop: 8, fontSize: 15, color: '#34C759', fontWeight: '600' },
  featuresCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  featureIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EBF2FF', justifyContent: 'center', alignItems: 'center' },
  featureText: { flex: 1, fontSize: 15, color: '#1C1C1E' },
  plansColumn: { gap: 10, marginBottom: 20 },
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  planCardSelected: { borderColor: '#1E6FD9', backgroundColor: '#EBF2FF' },
  planLeft: { flex: 1 },
  planLabel: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  planLabelSelected: { color: '#1E6FD9' },
  planBadge: { backgroundColor: '#1E6FD9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6 },
  planBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  planRight: { alignItems: 'flex-end' },
  planPrice: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  planPriceSelected: { color: '#1E6FD9' },
  planPeriod: { fontSize: 12, color: '#8E8E93' },
  planPeriodSelected: { color: '#1E6FD9' },
  planCheck: { marginLeft: 8 },
  ctaButton: { backgroundColor: '#1E6FD9', borderRadius: 16, padding: 18, alignItems: 'center' },
  ctaText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  ctaSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  restoreButton: { alignItems: 'center', marginTop: 16 },
  restoreText: { fontSize: 14, color: '#1E6FD9', fontWeight: '600' },
  footer: { fontSize: 11, color: '#C7C7CC', textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
