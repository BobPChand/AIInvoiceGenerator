import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen({ navigation }) {
  const [greeting, setGreeting] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    setDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  const quickActions = [
    { icon: 'chatbubble-ellipses', label: 'Ask AI', color: '#4A90E2', screen: 'Chat' },
    { icon: 'document-text', label: 'Invoice', color: '#F5A623', screen: 'Invoice' },
    { icon: 'checkmark-circle', label: 'Tasks', color: '#7ED321', screen: 'Tasks' },
    { icon: 'bar-chart', label: 'Insights', color: '#9B59B6', screen: 'Insights' },
    { icon: 'settings', label: 'Settings', color: '#34C759', screen: 'Settings' },
  ];

  const tips = [
    '💡 Start your day by reviewing your top 3 priorities.',
    '🚀 Use voice input to quickly capture ideas on the go.',
    '📊 Check your Insights weekly to track progress.',
    '🔔 Set task reminders so nothing slips through.',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, Bob! 👋</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>BC</Text>
          </View>
        </View>

        {/* AI Status Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="brain" size={28} color="#4A90E2" />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>AI Assistant Ready</Text>
              <Text style={styles.cardSub}>Powered by GPT-4o · AI Invoice Generator</Text>
            </View>
            <View style={styles.statusDot} />
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Ionicons name={action.icon} size={32} color={action.color} />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Tip */}
        <Text style={styles.sectionTitle}>Today's Tip</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>{tips[new Date().getDay() % tips.length]}</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Chat')}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          <Text style={styles.ctaText}>Start AI Chat</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  date: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4A90E2', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#1C2E4A', borderRadius: 16, padding: 16, marginBottom: 24 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardText: { flex: 1, marginLeft: 12 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardSub: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#7ED321' },
  sectionTitle: { color: '#8E8E93', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionCard: { backgroundColor: '#1C2E4A', borderRadius: 16, padding: 20, alignItems: 'center', width: '47%' },
  actionLabel: { color: '#fff', marginTop: 8, fontWeight: '600' },
  tipCard: { backgroundColor: '#1C2E4A', borderRadius: 16, padding: 16, marginBottom: 24 },
  tipText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  ctaButton: { backgroundColor: '#4A90E2', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
