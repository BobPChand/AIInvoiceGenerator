import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SiriShortcutsHelper from '../components/SiriShortcutsHelper';

const COLORS = { primary: '#1E6FD9', bg: '#0A1628', card: '#1C2E4A', text: '#FFFFFF', sub: '#8E8E93' };

export default function SettingsScreen({ navigation }) {
  const [dailyBriefing, setDailyBriefing] = useState(false);
  const [taskReminders, setTaskReminders] = useState(true);

  const openSettings = () => Linking.openSettings();

  const sections = [
    {
      title: 'Profile',
      items: [
        { icon: 'person-circle', color: '#1E6FD9', label: 'Name', value: 'Bob Chand' },
        { icon: 'globe', color: '#34C759', label: 'Website', value: 'AIInvoiceGenerator' },
      ]
    },
    {
      title: 'Notifications',
      items: [
        { icon: 'sunny', color: '#F5A623', label: 'Daily Morning Briefing', toggle: true, state: dailyBriefing, set: setDailyBriefing },
        { icon: 'alarm', color: '#FF3B30', label: 'Task Reminders', toggle: true, state: taskReminders, set: setTaskReminders },
        { icon: 'settings', color: '#8E8E93', label: 'Notification Settings', action: openSettings },
      ]
    },
    {
      title: 'AI Configuration',
      items: [
        { icon: 'hardware-chip', color: '#AF52DE', label: 'AI Model', value: 'GPT-4o' },
        { icon: 'server', color: '#1E6FD9', label: 'Backend', value: 'Base44 Cloud' },
        { icon: 'shield-checkmark', color: '#34C759', label: 'Data Privacy', value: 'Encrypted' },
      ]
    },
    {
      title: 'About',
      items: [
        { icon: 'information-circle', color: '#1E6FD9', label: 'Version', value: '1.0.0' },
        { icon: 'star', color: '#F5A623', label: 'Rate the App', action: () => Alert.alert('Thank you!', 'Rating coming soon on the App Store.') },
        { icon: 'mail', color: '#34C759', label: 'Contact Support', action: () => Linking.openURL('mailto:support@contentaipro.ai') },
        { icon: 'shield-checkmark', color: '#1E6FD9', label: 'Privacy Policy', action: () => Linking.openURL('https://base44.app/api/apps/6a336a00b083ccbe02ccfade/files/mp/public/6a336a00b083ccbe02ccfade/c1756a0b6_privacy_policy_invoice_generator.html') },
        { icon: 'document-text', color: '#1E6FD9', label: 'Terms of Use', action: () => Linking.openURL('https://base44.app/api/apps/6a336a00b083ccbe02ccfade/files/mp/public/6a336a00b083ccbe02ccfade/051bbf985_eula_invoice_ai.html') },
      ]
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Avatar */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>BC</Text>
          </View>
          <Text style={styles.profileName}>Bob Chand</Text>
          <Text style={styles.profileSub}>AI Invoice Generator</Text>
        </View>

        {/* Siri Voice Shortcuts Component */}
        <SiriShortcutsHelper navigation={navigation} />

        {sections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[styles.row, ii < section.items.length - 1 && styles.rowBorder]}
                  onPress={item.action}
                  disabled={!item.action && !item.toggle}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  {item.toggle ? (
                    <Switch value={item.state} onValueChange={item.set} trackColor={{ true: COLORS.primary }} />
                  ) : (
                    <Text style={styles.rowValue}>{item.value || (item.action ? '›' : '')}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1E6FD9', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  profileSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#1C2E4A', borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#0A1628' },
  iconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { flex: 1, fontSize: 15, color: '#FFF' },
  rowValue: { fontSize: 14, color: '#8E8E93' },
});
