import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = { primary: '#1E6FD9', bg: '#F2F4F8', card: '#fff', text: '#1C1C1E', sub: '#8E8E93' };

const metrics = [
  { label: 'Tasks Completed', value: '24', change: '+12%', up: true, icon: 'checkmark-done-circle', color: '#34C759' },
  { label: 'AI Conversations', value: '37', change: '+28%', up: true, icon: 'chatbubble-ellipses', color: '#1E6FD9' },
  { label: 'Avg Response Time', value: '1.2s', change: '-0.3s', up: true, icon: 'flash', color: '#F5A623' },
  { label: 'Productivity Score', value: '87%', change: '+5%', up: true, icon: 'trending-up', color: '#AF52DE' },
];

const tips = [
  { icon: '🎯', tip: 'Focus on your top 3 priorities each morning for maximum impact.' },
  { icon: '🤖', tip: 'Use AI Chat to draft emails, proposals, and reports in seconds.' },
  { icon: '📊', tip: 'Review your weekly insights every Friday to plan the next week.' },
  { icon: '🔔', tip: 'Enable morning briefings to start each day with a clear focus.' },
];

export default function InsightsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Business Insights</Text>
        <Text style={styles.sub}>Last 30 days</Text>

        <View style={styles.grid}>
          {metrics.map((m, i) => (
            <View key={i} style={styles.card}>
              <Ionicons name={m.icon} size={26} color={m.color} />
              <Text style={styles.value}>{m.value}</Text>
              <Text style={styles.label}>{m.label}</Text>
              <View style={[styles.badge, { backgroundColor: m.up ? '#E8F8EE' : '#FEE8E8' }]}>
                <Text style={[styles.change, { color: m.up ? '#34C759' : '#FF3B30' }]}>{m.change}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>AI Tips for You</Text>
        {tips.map((t, i) => (
          <View key={i} style={styles.tipCard}>
            <Text style={styles.tipEmoji}>{t.icon}</Text>
            <Text style={styles.tipText}>{t.tip}</Text>
          </View>
        ))}

        {/* Weekly bar chart (visual only) */}
        <Text style={styles.sectionTitle}>Weekly Activity</Text>
        <View style={styles.chart}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const heights = [60, 80, 45, 90, 70, 30, 20];
            return (
              <View key={i} style={styles.barCol}>
                <View style={[styles.bar, { height: heights[i], backgroundColor: i === 3 ? COLORS.primary : '#C7D8F0' }]} />
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E' },
  sub: { fontSize: 13, color: '#8E8E93', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  value: { fontSize: 26, fontWeight: 'bold', color: '#1C1C1E', marginTop: 8 },
  label: { fontSize: 11, color: '#8E8E93', marginTop: 2, textAlign: 'center' },
  badge: { marginTop: 6, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  change: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E', marginBottom: 12 },
  tipCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, alignItems: 'flex-start', gap: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  tipEmoji: { fontSize: 22 },
  tipText: { flex: 1, fontSize: 14, color: '#3A3A3C', lineHeight: 20 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: '#fff', borderRadius: 16, padding: 16, height: 130, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 18, borderRadius: 6, marginBottom: 6 },
  dayLabel: { fontSize: 10, color: '#8E8E93' },
});
