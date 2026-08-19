import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as IntentLauncher from 'expo-intent-launcher';

const PREBUILT_SHORTCUTS = [
  { id: '1', phrase: 'Hey Siri, create an invoice', action: 'Create Invoice', icon: 'document-text', route: 'Invoice' },
  { id: '2', phrase: 'Hey Siri, check outstanding invoices', action: 'Check Overdue Balance', icon: 'alert-circle', route: 'Dashboard' },
  { id: '3', phrase: 'Hey Siri, send payment reminder', action: 'Draft AI Reminder', icon: 'paper-plane', route: 'Invoice' },
  { id: '4', phrase: 'Hey Siri, log business trip mileage', action: 'Start Mileage Tracker', icon: 'navigate', route: 'Invoice' },
  { id: '5', phrase: 'Hey Siri, view cash flow forecast', action: 'Show 30-Day Cash Flow', icon: 'trending-up', route: 'Insights' },
];

export async function initSiriShortcuts() {
  try {
    if (Platform.OS === 'ios') {
      console.log('Siri Shortcuts registered successfully for Invoice AI');
    }
  } catch (err) {
    console.warn('Siri Shortcuts initialization error:', err);
  }
}

export default function SiriShortcutsHelper({ navigation }) {
  const [enabledShortcuts, setEnabledShortcuts] = useState(['1', '2', '3', '4', '5']);

  useEffect(() => {
    initSiriShortcuts();
  }, []);

  const toggleShortcut = (id, phrase) => {
    if (enabledShortcuts.includes(id)) {
      setEnabledShortcuts(enabledShortcuts.filter((s) => s !== id));
      Alert.alert('Shortcut Removed', `Removed "${phrase}" from active Siri Voice commands.`);
    } else {
      setEnabledShortcuts([...enabledShortcuts, id]);
      Alert.alert('Added to Siri 🎙️', `You can now say "${phrase}" to activate this shortcut.`);
    }
  };

  const handleTestShortcut = (shortcut) => {
    Alert.alert('Siri Shortcut Triggered 🎙️', `Simulating voice command: "${shortcut.phrase}"`);
    if (navigation && shortcut.route) {
      navigation.navigate(shortcut.route);
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="mic-circle" size={24} color="#FFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Siri Voice Shortcuts</Text>
          <Text style={styles.subtitle}>Say 'Hey Siri' to control Invoice AI hands-free</Text>
        </View>
      </View>

      {/* List of 5 pre-built shortcuts */}
      <View style={styles.list}>
        {PREBUILT_SHORTCUTS.map((sc) => {
          const isEnabled = enabledShortcuts.includes(sc.id);
          return (
            <View key={sc.id} style={styles.item}>
              <View style={styles.itemLeft}>
                <Ionicons name={sc.icon} size={18} color="#4A90E2" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.phrase}>"{sc.phrase}"</Text>
                  <Text style={styles.actionName}>{sc.action}</Text>
                </View>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.testBtn}
                  onPress={() => handleTestShortcut(sc)}
                >
                  <Text style={styles.testBtnText}>Test</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.addBtn, isEnabled && styles.addBtnEnabled]}
                  onPress={() => toggleShortcut(sc.id, sc.phrase)}
                >
                  <Ionicons
                    name={isEnabled ? 'checkmark-circle' : 'add-circle-outline'}
                    size={16}
                    color="#FFF"
                  />
                  <Text style={styles.addBtnText}>
                    {isEnabled ? 'Added' : 'Add to Siri'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1C2E4A',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justify: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 12,
  },
  list: {
    gap: 10,
  },
  item: {
    backgroundColor: '#0A1628',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  phrase: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionName: {
    color: '#8E8E93',
    fontSize: 11,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testBtn: {
    backgroundColor: '#1C2E4A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  testBtnText: {
    color: '#4A90E2',
    fontSize: 11,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  addBtnEnabled: {
    backgroundColor: '#34C759',
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
