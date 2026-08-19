import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AIService from '../services/AIService';

export default function AIFinancialInsights({ onAction, invoices = [] }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const data = await AIService.generateFinancialInsights(invoices);
      setInsights(data || []);
    } catch (err) {
      console.error('Failed to load AI financial insights:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsights();
  };

  const handleDismiss = (id) => {
    setDismissed((prev) => [...prev, id]);
  };

  const handleActionPress = (insight) => {
    if (onAction) {
      onAction(insight);
    } else {
      Alert.alert(
        insight.title,
        `Action triggered: ${insight.actionText}\n\n${insight.description}`,
        [{ text: 'OK' }]
      );
    }
  };

  const visibleInsights = insights.filter((item) => !dismissed.includes(item.id));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.cfoBadge}>
            <Ionicons name="sparkles" size={14} color="#FFF" />
            <Text style={styles.cfoBadgeText}>AI CFO INSIGHTS</Text>
          </View>
          <Text style={styles.mainHeading}>Proactive Financial Advisory</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={handleRefresh}
          disabled={refreshing || loading}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : (
            <Ionicons name="refresh" size={18} color="#4A90E2" />
          )}
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>GPT-4o Analyzing Revenue & Payment Velocity...</Text>
        </View>
      ) : visibleInsights.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="checkmark-circle-outline" size={32} color="#7ED321" />
          <Text style={styles.emptyText}>All financial metrics optimized! No urgent alerts.</Text>
        </View>
      ) : (
        /* Insight List */
        <View style={styles.list}>
          {visibleInsights.map((insight) => {
            const iconName = insight.icon || 'analytics';
            const accentColor = insight.accentColor || '#4A90E2';

            return (
              <View key={insight.id} style={[styles.card, { borderLeftColor: accentColor }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}25` }]}>
                      <Ionicons name={iconName} size={20} color={accentColor} />
                    </View>
                    <Text style={styles.cardTitle}>{insight.title}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {insight.badge && (
                      <View style={[styles.badgeTag, { backgroundColor: `${accentColor}30` }]}>
                        <Text style={[styles.badgeTagText, { color: accentColor }]}>
                          {insight.badge}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity onPress={() => handleDismiss(insight.id)} style={{ padding: 4 }}>
                      <Ionicons name="close" size={16} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.description}>{insight.description}</Text>

                {insight.actionText && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: accentColor }]}
                    onPress={() => handleActionPress(insight)}
                  >
                    <Text style={styles.actionText}>{insight.actionText}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleGroup: {
    flex: 1,
  },
  cfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  cfoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  mainHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: '#1C2E4A',
    borderRadius: 10,
  },
  loadingBox: {
    backgroundColor: '#1C2E4A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justify: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 10,
  },
  emptyBox: {
    backgroundColor: '#1C2E4A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#1C2E4A',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justify: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  badgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
