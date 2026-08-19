import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ClientPortalShare({
  visible = false,
  onClose,
  invoice = null,
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('link'); // 'link' | 'qr' | 'tracking'

  const targetInvoice = invoice || {
    id: 'INV-2026-004',
    client_name: 'Acme Corp',
    total: 1450.0,
    currency: 'USD',
  };

  const portalUrl = `https://pay.invoiceai.app/v1/inv_${targetInvoice.id || '2026_004'}`;

  const handleCopyLink = () => {
    setCopied(true);
    Alert.alert('Link Copied!', 'Invoice link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `Hi ${targetInvoice.client_name || 'there'}, here is your invoice for $${targetInvoice.total?.toFixed(2) || '1,450.00'}. Pay via Apple Pay or Card: ${portalUrl}`,
        url: portalUrl,
        title: `Invoice #${targetInvoice.id || 'INV-2026-004'}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Tracking timeline
  const trackingEvents = [
    { id: '1', title: 'Invoice Sent', time: 'Aug 18, 09:30 AM', icon: 'paper-plane', done: true, color: '#4A90E2' },
    { id: '2', title: 'Link Opened by Client', time: 'Aug 18, 11:15 AM', icon: 'eye', done: true, color: '#F5A623' },
    { id: '3', title: 'Invoice Viewed (3 mins)', time: 'Aug 18, 11:18 AM', icon: 'document-text', done: true, color: '#9B59B6' },
    { id: '4', title: 'Payment Processing (Apple Pay)', time: 'Pending', icon: 'card', done: false, color: '#8E8E93' },
  ];

  const content = (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="link" size={18} color="#FFF" />
          </View>
          <View>
            <Text style={styles.title}>Client Portal & Share</Text>
            <Text style={styles.subtitle}>Web invoice link + Apple Pay & Stripe checkout</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'link' && styles.tabBtnActive]}
          onPress={() => setActiveTab('link')}
        >
          <Ionicons name="share-social-outline" size={16} color={activeTab === 'link' ? '#FFF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'link' && styles.tabTextActive]}>Share Link</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'qr' && styles.tabBtnActive]}
          onPress={() => setActiveTab('qr')}
        >
          <Ionicons name="qr-code-outline" size={16} color={activeTab === 'qr' ? '#FFF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'qr' && styles.tabTextActive]}>QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tracking' && styles.tabBtnActive]}
          onPress={() => setActiveTab('tracking')}
        >
          <Ionicons name="analytics-outline" size={16} color={activeTab === 'tracking' ? '#FFF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'tracking' && styles.tabTextActive]}>Activity Log</Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Share Link */}
      {activeTab === 'link' && (
        <View style={styles.tabContent}>
          <Text style={styles.label}>Web Invoice Link</Text>
          <View style={styles.urlBox}>
            <Ionicons name="globe-outline" size={18} color="#4A90E2" />
            <Text style={styles.urlText} numberOfLines={1}>{portalUrl}</Text>
            <TouchableOpacity style={styles.copyBtnInline} onPress={handleCopyLink}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Supported Payment Gateways</Text>
          <View style={styles.gatewaysRow}>
            <View style={styles.gatewayBadge}>
              <Ionicons name="logo-apple" size={16} color="#FFF" />
              <Text style={styles.gatewayText}>Apple Pay</Text>
            </View>
            <View style={styles.gatewayBadge}>
              <Ionicons name="card" size={16} color="#6772E5" />
              <Text style={styles.gatewayText}>Stripe Credit</Text>
            </View>
            <View style={styles.gatewayBadge}>
              <Ionicons name="business" size={16} color="#34C759" />
              <Text style={styles.gatewayText}>ACH Bank</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.shareMainBtn} onPress={handleNativeShare}>
              <Ionicons name="share-outline" size={18} color="#FFF" />
              <Text style={styles.shareMainText}>One-Tap Share Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tab 2: QR Code View */}
      {activeTab === 'qr' && (
        <View style={styles.qrContainer}>
          <Text style={styles.qrInstruction}>Scan with iPhone camera to view & pay invoice instantly</Text>
          <View style={styles.qrBox}>
            {/* Visual representation of QR code */}
            <View style={styles.qrMatrix}>
              <View style={[styles.qrCorner, { top: 12, left: 12 }]} />
              <View style={[styles.qrCorner, { top: 12, right: 12 }]} />
              <View style={[styles.qrCorner, { bottom: 12, left: 12 }]} />
              <Ionicons name="qr-code" size={110} color="#0A1628" />
            </View>
            <Text style={styles.qrInvoiceId}>Invoice #{targetInvoice.id || 'INV-2026-004'}</Text>
          </View>
        </View>
      )}

      {/* Tab 3: Tracking Log */}
      {activeTab === 'tracking' && (
        <View style={styles.tabContent}>
          <Text style={styles.label}>Live Engagement Tracking</Text>
          <View style={styles.timeline}>
            {trackingEvents.map((evt) => (
              <View key={evt.id} style={styles.timelineItem}>
                <View style={[styles.timelineIcon, { backgroundColor: evt.color }]}>
                  <Ionicons name={evt.icon} size={14} color="#FFF" />
                </View>
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineTitle}>{evt.title}</Text>
                  <Text style={styles.timelineTime}>{evt.time}</Text>
                </View>
                {evt.done && (
                  <View style={styles.seenBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  if (visible && onClose) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>{content}</ScrollView>
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
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justify: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 11,
  },
  closeBtn: {
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#0A1628',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
  },
  tabContent: {
    gap: 10,
  },
  label: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  urlText: {
    flex: 1,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  copyBtnInline: {
    backgroundColor: '#4A90E2',
    padding: 6,
    borderRadius: 6,
  },
  gatewaysRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gatewayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  gatewayText: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 6,
  },
  shareMainBtn: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  shareMainText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  qrInstruction: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  qrBox: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  qrMatrix: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justify: 'center',
    position: 'relative',
  },
  qrCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: '#0A1628',
  },
  qrInvoiceId: {
    color: '#0A1628',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 8,
  },
  timeline: {
    backgroundColor: '#0A1628',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justify: 'center',
  },
  timelineBody: {
    flex: 1,
  },
  timelineTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  timelineTime: {
    color: '#8E8E93',
    fontSize: 11,
  },
  seenBadge: {
    padding: 4,
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
