import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { generateInvoice } from '../services/InvoiceService';
import AIConsentModal, { useAIConsent } from '../components/AIConsentModal';
import SmartPaymentReminders from '../components/SmartPaymentReminders';
import ClientPortalShare from '../components/ClientPortalShare';
import MileageTracker from '../components/MileageTracker';

const COUNTRIES = [
  { label: 'Canada', value: 'CA' },
  { label: 'United States', value: 'US' },
  { label: 'Other', value: 'OTHER' },
];

const PROVINCES = ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NB', 'NS', 'NL', 'PE', 'NT', 'NU', 'YT'];

export default function InvoiceScreen() {
  const [prompt, setPrompt] = useState('Invoice Mike for 5 hours of web design at $150/hr with a 10% discount.');
  const [country, setCountry] = useState('CA');
  const [province, setProvince] = useState('ON');
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const consent = useAIConsent();
  const [pendingGenerate, setPendingGenerate] = useState(false);

  // Modal control states
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'mileage'

  const canGenerate = useMemo(() => prompt.trim().length > 0, [prompt]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      Alert.alert('Missing details', 'Please describe the invoice you want to create.');
      return;
    }
    if (!consent.hasConsented) {
      setPendingGenerate(true);
      consent.requestConsent();
      return;
    }
    doGenerate();
  };

  const doGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateInvoice({ prompt, country, province });
      // Add status overdue flag if mock/generated for testing reminder
      setInvoice({
        ...result,
        status: result.status || 'overdue',
        daysOverdue: 18,
      });
    } catch (error) {
      Alert.alert('Generation failed', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onConsentAccept = async () => {
    consent.accept();
    if (pendingGenerate) {
      setPendingGenerate(false);
      doGenerate();
    }
  };

  const onConsentDecline = () => {
    consent.decline();
    setPendingGenerate(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Screen Nav Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'generator' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('generator')}
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color={activeTab === 'generator' ? '#FFF' : '#8E8E93'}
            />
            <Text style={[styles.topTabText, activeTab === 'generator' && styles.topTabTextActive]}>
              AI Generator
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'mileage' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('mileage')}
          >
            <Ionicons
              name="car-outline"
              size={18}
              color={activeTab === 'mileage' ? '#FFF' : '#8E8E93'}
            />
            <Text style={[styles.topTabText, activeTab === 'mileage' && styles.topTabTextActive]}>
              Mileage Tracker
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'generator' ? (
          <>
            <View style={styles.heroCard}>
              <Ionicons name="document-text" size={28} color="#4A90E2" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.heroTitle}>AI Invoice Generator</Text>
                <Text style={styles.heroSubtitle}>
                  Describe the work and generate a polished invoice in seconds.
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>What should be invoiced?</Text>
              <TextInput
                style={styles.input}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                placeholder="Example: Invoice Bright Studio for 3 hours of consulting at $120/hr"
              />

              <Text style={styles.label}>Country</Text>
              <View style={styles.pillRow}>
                {COUNTRIES.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.pill, country === item.value && styles.pillActive]}
                    onPress={() => setCountry(item.value)}
                  >
                    <Text style={[styles.pillText, country === item.value && styles.pillTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {country === 'CA' && (
                <>
                  <Text style={styles.label}>Province</Text>
                  <View style={styles.pillRow}>
                    {PROVINCES.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[styles.pill, province === item && styles.pillActive]}
                        onPress={() => setProvince(item)}
                      >
                        <Text style={[styles.pillText, province === item && styles.pillTextActive]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.generateButton, !canGenerate && styles.generateButtonDisabled]}
                onPress={handleGenerate}
                disabled={loading || !canGenerate}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.generateText}>Generate Invoice</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Generated Invoice Preview Card */}
            {invoice && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>
                    {invoice.invoice_type === 'quote' ? 'Quote' : 'Invoice'} Preview
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Draft (Overdue)</Text>
                  </View>
                </View>

                {/* Quick Action Toolbar on Invoice */}
                <View style={styles.invoiceActionsRow}>
                  <TouchableOpacity
                    style={styles.actionToolBtn}
                    onPress={() => setShowShareModal(true)}
                  >
                    <Ionicons name="share-social" size={16} color="#FFF" />
                    <Text style={styles.actionToolText}>Client Portal & Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionToolBtn, { backgroundColor: '#F5A623' }]}
                    onPress={() => setShowReminderModal(true)}
                  >
                    <Ionicons name="notifications" size={16} color="#FFF" />
                    <Text style={styles.actionToolText}>Smart AI Reminder</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.resultName}>{invoice.client_name || 'Mike - Web Design'}</Text>
                <Text style={styles.resultMeta}>{invoice.client_email || 'mike@clientstudio.com'}</Text>
                <Text style={styles.resultMeta}>Issue date: {invoice.issue_date || 'Aug 01, 2026'}</Text>
                <Text style={styles.resultMeta}>Due date: {invoice.due_date || 'Aug 15, 2026'}</Text>

                {invoice.line_items?.map((item, index) => (
                  <View key={`${item.description}-${index}`} style={styles.itemRow}>
                    <Text style={styles.itemText}>{item.description}</Text>
                    <Text style={styles.itemText}>
                      {invoice.currency || 'USD'} {Number(item.total || 0).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View style={styles.totalBox}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>
                      {invoice.currency || 'USD'} {Number(invoice.subtotal || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{invoice.tax_name || 'Tax'}</Text>
                    <Text style={styles.totalValue}>
                      {invoice.currency || 'USD'} {Number(invoice.tax_total || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValueBold}>
                      {invoice.currency || 'USD'} {Number(invoice.total || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>

                {invoice.notes ? <Text style={styles.notes}>{invoice.notes}</Text> : null}
              </View>
            )}

            {/* In-Line Share & Reminder Tool Demonstration Cards */}
            <ClientPortalShare invoice={invoice} />
            <SmartPaymentReminders invoice={invoice} />
          </>
        ) : (
          /* Mileage Tracker Tab Section */
          <MileageTracker />
        )}
      </ScrollView>

      {/* Modals */}
      <ClientPortalShare
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        invoice={invoice}
      />

      <SmartPaymentReminders
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        invoice={invoice}
      />

      <AIConsentModal
        visible={consent.showModal}
        onAccept={onConsentAccept}
        onDecline={onConsentDecline}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  content: { padding: 20, paddingBottom: 40 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1C2E4A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  topTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  topTabBtnActive: {
    backgroundColor: '#4A90E2',
  },
  topTabText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 13,
  },
  topTabTextActive: {
    color: '#FFF',
  },
  heroCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C2E4A', borderRadius: 18, padding: 16, marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  heroSubtitle: { color: '#8E8E93', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16 },
  label: { color: '#1C1C1E', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#F2F4F8', borderRadius: 12, padding: 12, minHeight: 90, textAlignVertical: 'top', marginBottom: 12 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F2F4F8' },
  pillActive: { backgroundColor: '#4A90E2' },
  pillText: { color: '#1C1C1E', fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  generateButton: { backgroundColor: '#4A90E2', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  generateButtonDisabled: { opacity: 0.6 },
  generateText: { color: '#fff', fontWeight: '700' },
  resultCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  statusBadge: { backgroundColor: '#FFEBEB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { color: '#E74C3C', fontSize: 12, fontWeight: '700' },
  invoiceActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  actionToolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  actionToolText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  resultName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  resultMeta: { color: '#8E8E93', fontSize: 13, marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F2F4F8', marginTop: 10 },
  itemText: { color: '#1C1C1E', fontSize: 14, flex: 1 },
  totalBox: { marginTop: 12, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalLabel: { color: '#8E8E93', fontSize: 13 },
  totalValue: { color: '#1C1C1E', fontSize: 13, fontWeight: '600' },
  totalValueBold: { color: '#1C1C1E', fontSize: 15, fontWeight: '700' },
  notes: { color: '#8E8E93', fontSize: 13, marginTop: 10 },
});
