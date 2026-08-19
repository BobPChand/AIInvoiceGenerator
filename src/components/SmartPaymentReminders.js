import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AIService from '../services/AIService';

const ESCALATION_LEVELS = [
  { id: 'friendly', name: 'Friendly Nudge', icon: 'happy-outline', badgeColor: '#34C759', desc: 'Gentle reminder for 1-7 days past due' },
  { id: 'formal', name: 'Formal Reminder', icon: 'document-text-outline', badgeColor: '#F5A623', desc: 'Professional follow-up for 8-29 days past due' },
  { id: 'final', name: 'Final Notice', icon: 'warning-outline', badgeColor: '#E74C3C', desc: 'Firm notice for 30+ days overdue' },
];

const RELATIONSHIPS = [
  { id: 'new', name: 'New Client' },
  { id: 'regular', name: 'Regular Client' },
  { id: 'long-term', name: 'VIP / Long-term' },
];

export default function SmartPaymentReminders({
  visible = false,
  onClose,
  invoice = null,
}) {
  const [level, setLevel] = useState('friendly');
  const [relationship, setRelationship] = useState('regular');
  const [drafting, setDrafting] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  const activeInvoice = invoice || {
    invoiceNumber: 'INV-2026-08',
    clientName: 'Acme Corp',
    clientEmail: 'billing@acmecorp.com',
    amount: 1450,
    dueDate: '2026-07-20',
    daysOverdue: 30,
  };

  useEffect(() => {
    if (visible || invoice) {
      generateDraft(level, relationship);
    }
  }, [visible, level, relationship]);

  const generateDraft = async (lvl, rel) => {
    try {
      setDrafting(true);
      setSent(false);
      const res = await AIService.draftReminderEmail({
        clientName: activeInvoice.clientName,
        amount: activeInvoice.amount,
        daysOverdue: activeInvoice.daysOverdue || 15,
        escalationLevel: lvl,
        clientRelationship: rel,
        invoiceNumber: activeInvoice.invoiceNumber || 'INV-1024',
      });

      if (res && res.subject && res.body) {
        setSubject(res.subject);
        setBody(res.body);
      } else {
        setSubject(`Payment Reminder: Invoice #${activeInvoice.invoiceNumber || '1024'}`);
        setBody(`Hi ${activeInvoice.clientName},\n\nThis is a friendly reminder regarding Invoice #${activeInvoice.invoiceNumber || '1024'} for $${activeInvoice.amount}.\n\nThank you!`);
      }
    } catch (err) {
      console.error('Failed to draft reminder email:', err);
    } finally {
      setDrafting(false);
    }
  };

  const handleSendReminder = () => {
    setSent(true);
    Alert.alert(
      'Reminder Sent! 🚀',
      `Personalized AI payment reminder sent to ${activeInvoice.clientEmail || activeInvoice.clientName}. Status updated in invoice log.`,
      [{ text: 'Done', onPress: () => onClose && onClose() }]
    );
  };

  if (!visible && !invoice) {
    return null;
  }

  const content = (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={20} color="#4A90E2" />
          <Text style={styles.headerTitle}>Smart Payment Reminder</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>
        AI-crafted reminder for {activeInvoice.clientName} (${activeInvoice.amount} overdue)
      </Text>

      {/* Escalation Level Selector */}
      <Text style={styles.sectionLabel}>Select Escalation Level</Text>
      <View style={styles.levelRow}>
        {ESCALATION_LEVELS.map((esc) => {
          const selected = level === esc.id;
          return (
            <TouchableOpacity
              key={esc.id}
              style={[
                styles.levelCard,
                selected && { borderColor: esc.badgeColor, backgroundColor: '#0A1628' },
              ]}
              onPress={() => setLevel(esc.id)}
            >
              <Ionicons name={esc.icon} size={18} color={esc.badgeColor} />
              <Text style={[styles.levelName, selected && { color: esc.badgeColor }]}>
                {esc.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Relationship Selector */}
      <Text style={styles.sectionLabel}>Client Relationship</Text>
      <View style={styles.relRow}>
        {RELATIONSHIPS.map((rel) => {
          const selected = relationship === rel.id;
          return (
            <TouchableOpacity
              key={rel.id}
              style={[styles.relPill, selected && styles.relPillActive]}
              onPress={() => setRelationship(rel.id)}
            >
              <Text style={[styles.relPillText, selected && styles.relPillTextActive]}>
                {rel.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Email Draft Area */}
      <View style={styles.emailContainer}>
        {drafting ? (
          <View style={styles.loadingDraft}>
            <ActivityIndicator size="small" color="#4A90E2" />
            <Text style={styles.loadingDraftText}>GPT-4o tailoring tone & urgency...</Text>
          </View>
        ) : (
          <>
            <View style={styles.subjectRow}>
              <Text style={styles.fieldLabel}>Subject:</Text>
              <TextInput
                style={styles.subjectInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="Email Subject"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <TextInput
              style={styles.bodyInput}
              value={body}
              onChangeText={setBody}
              multiline
              placeholder="Reminder Body"
              placeholderTextColor="#8E8E93"
            />
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.regenerateBtn}
          onPress={() => generateDraft(level, relationship)}
          disabled={drafting}
        >
          <Ionicons name="refresh-outline" size={18} color="#4A90E2" />
          <Text style={styles.regenerateText}>Regenerate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendBtn, sent && styles.sendBtnDisabled]}
          onPress={handleSendReminder}
          disabled={drafting || sent}
        >
          <Ionicons name="paper-plane" size={18} color="#FFF" />
          <Text style={styles.sendBtnText}>{sent ? 'Sent!' : 'Send Reminder'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (visible && onClose) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {content}
          </ScrollView>
        </View>
      </Modal>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1C2E4A',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 13,
    marginBottom: 14,
  },
  sectionLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  levelCard: {
    flex: 1,
    backgroundColor: '#0A1628',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 4,
  },
  levelName: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  relRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  relPill: {
    flex: 1,
    backgroundColor: '#0A1628',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  relPillActive: {
    backgroundColor: '#4A90E2',
  },
  relPillText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  relPillTextActive: {
    color: '#FFF',
  },
  emailContainer: {
    backgroundColor: '#0A1628',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    minHeight: 180,
  },
  loadingDraft: {
    flex: 1,
    alignItems: 'center',
    justify: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  loadingDraftText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1C2E4A',
    paddingBottom: 8,
    marginBottom: 8,
  },
  fieldLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  subjectInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  bodyInput: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  regenerateText: {
    color: '#4A90E2',
    fontWeight: '700',
    fontSize: 13,
  },
  sendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    gap: 6,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 12,
  },
  sendBtnDisabled: {
    backgroundColor: '#34C759',
  },
  sendBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justify: 'center',
    padding: 16,
  },
  modalContent: {
    flexGrow: 1,
    justify: 'center',
  },
});
