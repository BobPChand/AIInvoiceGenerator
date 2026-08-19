import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OfflineModeBanner({ pendingCount = 0 }) {
  const [isOffline, setIsOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Monitor online/offline status using window/navigator or fetch check
    const checkConnection = async () => {
      try {
        // Simple light request check to detect true connectivity
        const res = await fetch('https://www.google.com/generate_204', {
          method: 'HEAD',
          cache: 'no-cache',
        });
        setIsOffline(!res.ok);
      } catch (err) {
        setIsOffline(true);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setIsOffline(false);
      setSyncing(false);
    }, 1500);
  };

  if (!isOffline && pendingCount === 0) {
    return null;
  }

  return (
    <View style={[styles.banner, isOffline ? styles.bannerOffline : styles.bannerSyncing]}>
      <View style={styles.leftGroup}>
        <Ionicons
          name={isOffline ? 'cloud-offline' : 'sync'}
          size={18}
          color="#FFF"
        />
        <View style={styles.textGroup}>
          <Text style={styles.title}>
            {isOffline ? 'Offline Mode Active' : 'Auto-Syncing Offline Data'}
          </Text>
          <Text style={styles.subtitle}>
            {isOffline
              ? `Working offline. ${pendingCount > 0 ? `${pendingCount} item(s)` : 'Invoices'} will auto-sync when back online.`
              : 'Connection restored. Syncing invoices to cloud...'}
          </Text>
        </View>
      </View>

      {isOffline && (
        <TouchableOpacity style={styles.retryBtn} onPress={handleManualSync}>
          <Text style={styles.retryText}>{syncing ? 'Checking...' : 'Retry'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 8,
  },
  bannerOffline: {
    backgroundColor: '#F5A623',
  },
  bannerSyncing: {
    backgroundColor: '#4A90E2',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 1,
  },
  retryBtn: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  retryText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
