import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const CONSENT_KEY = 'ai_data_consent_accepted';

export function useAIConsent() {
  const [hasConsented, setHasConsented] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(CONSENT_KEY);
      setHasConsented(stored === 'true');
      setLoading(false);
    })();
  }, []);

  const requestConsent = () => {
    if (hasConsented) return true;
    setShowModal(true);
    return false;
  };

  const accept = async () => {
    await AsyncStorage.setItem(CONSENT_KEY, 'true');
    setHasConsented(true);
    setShowModal(false);
  };

  const decline = () => {
    setShowModal(false);
  };

  return { hasConsented, showModal, requestConsent, accept, decline, loading };
}

export default function AIConsentModal({ visible, onAccept, onDecline }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDecline}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark" size={32} color="#4A90E2" />
          </View>
          <Text style={styles.title}>AI Data Disclosure</Text>
          <Text style={styles.body}>
            AI Invoice Generator uses OpenAI, a third-party AI service, to generate your invoices, quotes, and chat responses.
          </Text>
          <Text style={styles.sectionTitle}>What data is sent:</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>- Invoice descriptions and prompts you enter</Text>
            <Text style={styles.listItem}>- Client names and billing details</Text>
            <Text style={styles.listItem}>- Tax region (country and province)</Text>
            <Text style={styles.listItem}>- Chat messages and conversation history</Text>
          </View>
          <Text style={styles.sectionTitle}>Who receives it:</Text>
          <Text style={styles.body}>OpenAI processes this data to generate your content. Data is transmitted securely via HTTPS. See our Privacy Policy for full details.</Text>
          <Text style={styles.body}>
            By tapping Allow, you consent to sharing this data with OpenAI for AI content generation. You can revoke this consent anytime in your device settings.
          </Text>
          <TouchableOpacity style={styles.privacyLink} onPress={() => Linking.openURL('https://base44.app/api/apps/6a336a00b083ccbe02ccfade/files/mp/public/6a336a00b083ccbe02ccfade/573f055f8_privacy_policy_invoice_generator.html')}>
            <Text style={styles.privacyLinkText}>Read full Privacy Policy</Text>
          </TouchableOpacity>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
              <Text style={styles.declineText}>Dont Allow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
              <Text style={styles.acceptText}>Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 380 },
  iconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#EBF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16, alignSelf: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1C1C1E', marginBottom: 6, marginTop: 4 },
  list: { marginBottom: 12, paddingLeft: 4 },
  listItem: { fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 2 },
  privacyLink: { marginBottom: 16, marginTop: 4 },
  privacyLinkText: { fontSize: 13, color: '#4A90E2', fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 12 },
  declineBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA', alignItems: 'center' },
  declineText: { fontSize: 15, fontWeight: '600', color: '#8E8E93' },
  acceptBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#4A90E2', alignItems: 'center' },
  acceptText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
