import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = { primary: '#1E6FD9', bg: '#F2F4F8', card: '#fff', text: '#1C1C1E', sub: '#8E8E93' };

export default function SettingsScreen() {
  const [dailyBriefing, setDailyBriefing] = useState(false);
  const [taskReminders, setTaskReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
        { icon: 'sunrise', color: '#F5A623', label: 'Daily Morning Briefing', toggle: true, state: dailyBriefing, set: setDailyBriefing },
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
  profileHeader: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1E6FD9', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#1C1C1E' },
  profileSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F4F8' },
  iconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { flex: 1, fontSize: 15, color: '#1C1C1E' },
  rowValue: { fontSize: 14, color: '#8E8E93' },
});
