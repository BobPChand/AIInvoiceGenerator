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
  restorePurchases,
} from '../services/RevenueCatService';

const REVENUECAT_IOS_KEY = 'appl_xxx...';

const FEATURES = [
  { icon: 'document-text', text: 'Unlimited AI Invoices & Quotes' },
  { icon: 'calculator', text: 'Auto GST/HST/PST/QST by Province' },
  { icon: 'document-attach', text: 'Professional PDF Export' },
  { icon: 'people', text: 'Client Contact Management' },
  { icon: 'time', text: 'Payment Status Tracking' },
  { icon: 'shield-checkmark', text: 'Bank-level Data Encryption' },
];

export default function PaywallScreen({ navigation }) {
  const [offering, setOffering] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setLoading(true);
    try {
      const current = await getOfferings(REVENUECAT_IOS_KEY);
      if (current) {
        setOffering(current);
        // Default: select monthly
        const monthly = current.availablePackages.find(
          p => p.identifier === '$rc_monthly' || p.identifier === 'monthly'
        ) || current.availablePackages[0];
        setSelectedPkg(monthly);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not load subscription options. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    setPurchasing(true);
    try {
      const result = await purchasePackage(selectedPkg);
      if (result.success && result.isActive) {
        const isLifetime = selectedPkg.packageType === 'LIFETIME' ||
          selectedPkg.identifier === 'lifetime';
        Alert.alert(
          isLifetime ? 'Welcome — Forever!' : 'Welcome to Pro!',
          isLifetime
            ? 'You now have lifetime access. Thank you!'
            : 'Your subscription is now active. Enjoy all features!',
          [{ text: 'Get Started', onPress: () => navigation.replace('Home') }]
        );
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
        Alert.alert(
          'Purchase Restored',
          'Your Pro access has been restored.',
          [{ text: 'Continue', onPress: () => navigation.replace('Home') }]
        );
      } else {
        Alert.alert('Nothing to Restore', 'We could not find an active purchase for this Apple ID.');
      }
    } catch (e) {
      Alert.alert('Restore Failed', e.message || 'Could not restore purchases.');
    } finally {
      setRestoring(false);
    }
  };

  const formatPrice = (pkg) => pkg?.product?.priceString || '';

  const isSelected = (pkg) => selectedPkg?.identifier === pkg?.identifier;

  const getPackageType = (pkg) => {
    if (!pkg) return null;
    const id = (pkg.identifier || '').toLowerCase();
    if (id.includes('lifetime') || pkg.packageType === 'LIFETIME') return 'lifetime';
    if (id.includes('annual') || pkg.packageType === 'ANNUAL') return 'yearly';
    return 'monthly';
  };

  const getCTASubtext = () => {
    if (!selectedPkg) return '';
    const type = getPackageType(selectedPkg);
    if (type === 'lifetime') return 'One-time purchase. Never pay again.';
    if (type === 'yearly') return `Then ${formatPrice(selectedPkg)}/year · Cancel anytime`;
    return `Then ${formatPrice(selectedPkg)}/month · Cancel anytime`;
  };

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

  const packages = offering?.availablePackages || [];

  // Sort: monthly → yearly → lifetime
  const sortOrder = { monthly: 0, yearly: 1, lifetime: 2 };
  const sortedPackages = [...packages].sort((a, b) => {
    return (sortOrder[getPackageType(a)] ?? 3) - (sortOrder[getPackageType(b)] ?? 3);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Ionicons name="sparkles" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>AI Invoice Generator</Text>
          <Text style={styles.subtitle}>Pro</Text>
          <Text style={styles.trial}>Start your 7-day FREE trial</Text>
        </View>

        {/* Features */}
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

        {/* Plan Selector */}
        <View style={styles.plansColumn}>
          {sortedPackages.map((pkg) => {
            const type = getPackageType(pkg);
            const selected = isSelected(pkg);
            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.planCard, selected && styles.planCardSelected]}
                onPress={() => setSelectedPkg(pkg)}
              >
                <View style={styles.planLeft}>
                  <Text style={[styles.planLabel, selected && styles.planLabelSelected]}>
                    {type === 'lifetime' ? 'Lifetime' : type === 'yearly' ? 'Yearly' : 'Monthly'}
                  </Text>
                  {type === 'yearly' && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>Save 33%</Text>
                    </View>
                  )}
                  {type === 'lifetime' && (
                    <View style={[styles.planBadge, { backgroundColor: '#FF9500' }]}>
                      <Text style={styles.planBadgeText}>Best Value</Text>
                    </View>
                  )}
                </View>
                <View style={styles.planRight}>
                  <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
                    {formatPrice(pkg)}
                  </Text>
                  <Text style={[styles.planPeriod, selected && styles.planPeriodSelected]}>
                    {type === 'lifetime' ? 'one-time' : type === 'yearly' ? '/year' : '/month'}
                  </Text>
                </View>
                {selected && (
                  <Ionicons name="checkmark-circle" size={20} color="#1E6FD9" style={styles.planCheck} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handlePurchase}
          disabled={purchasing || !selectedPkg}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.ctaText}>
                {getPackageType(selectedPkg) === 'lifetime' ? 'Get Lifetime Access' : 'Start Free Trial'}
              </Text>
              <Text style={styles.ctaSub}>{getCTASubtext()}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={restoring}>
          {restoring
            ? <ActivityIndicator size="small" color="#8E8E93" />
            : <Text style={styles.restoreText}>Restore Purchases</Text>}
        </TouchableOpacity>

        {/* Footer */}
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
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  planCardSelected: { borderColor: '#1E6FD9', backgroundColor: '#EBF2FF' },
  planLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  planRight: { alignItems: 'flex-end', marginRight: 8 },
  planCheck: { marginLeft: 4 },
  planBadge: { backgroundColor: '#34C759', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  planBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  planLabel: { fontSize: 15, color: '#1C1C1E', fontWeight: '600' },
  planLabelSelected: { color: '#1E6FD9' },
  planPrice: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  planPriceSelected: { color: '#1E6FD9' },
  planPeriod: { fontSize: 11, color: '#8E8E93' },
  planPeriodSelected: { color: '#1E6FD9' },
  ctaButton: { backgroundColor: '#1E6FD9', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 12, shadowColor: '#1E6FD9', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  ctaSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  restoreButton: { alignItems: 'center', paddingVertical: 12, marginBottom: 8 },
  restoreText: { color: '#8E8E93', fontSize: 14, textDecorationLine: 'underline' },
  footer: { textAlign: 'center', fontSize: 11, color: '#8E8E93', lineHeight: 16, marginTop: 8 },
});
