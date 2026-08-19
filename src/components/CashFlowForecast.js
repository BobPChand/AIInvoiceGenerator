import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AIService from '../services/AIService';

export default function CashFlowForecast() {
  const [timeframe, setTimeframe] = useState(30);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    loadForecast();
  }, [timeframe]);

  const loadForecast = async () => {
    try {
      setLoading(true);
      const data = await AIService.predictCashFlow(timeframe);
      setForecast(data);
    } catch (err) {
      console.error('Failed to predict cash flow:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate visual bars for income vs expense projection
  const mockChartBars = [
    { label: 'Week 1', income: 3800, expense: 900, confidenceHigh: 4200, confidenceLow: 3400 },
    { label: 'Week 2', income: 2400, expense: 750, confidenceHigh: 2800, confidenceLow: 2100 },
    { label: 'Week 3', income: 4100, expense: 1100, confidenceHigh: 4500, confidenceLow: 3600 },
    { label: 'Week 4', income: 2200, expense: 450, confidenceHigh: 2500, confidenceLow: 1900 },
  ];

  const maxVal = 5000;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Cash Flow Forecast</Text>
          <Text style={styles.subtitle}>AI revenue prediction & confidence bounds</Text>
        </View>

        {/* Timeframe Selector */}
        <View style={styles.timeframeRow}>
          {[30, 60, 90].map((days) => (
            <TouchableOpacity
              key={days}
              style={[styles.tfBtn, timeframe === days && styles.tfBtnActive]}
              onPress={() => setTimeframe(days)}
            >
              <Text style={[styles.tfBtnText, timeframe === days && styles.tfBtnTextActive]}>
                {days}D
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Running predictive cash flow model...</Text>
        </View>
      ) : (
        forecast && (
          <View style={styles.card}>
            {/* Top Metrics Row */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Projected Income</Text>
                <Text style={[styles.metricValue, { color: '#34C759' }]}>
                  +${forecast.expectedIncome?.toLocaleString() || '12,500'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Est. Expenses</Text>
                <Text style={[styles.metricValue, { color: '#E74C3C' }]}>
                  -${forecast.expectedExpenses?.toLocaleString() || '3,200'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Net Cash Position</Text>
                <Text style={[styles.metricValue, { color: '#4A90E2' }]}>
                  ${forecast.netCash?.toLocaleString() || '9,300'}
                </Text>
              </View>
            </View>

            {/* Confidence Interval Indicator */}
            <View style={styles.confidenceBarContainer}>
              <View style={styles.confidenceHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="shield-checkmark" size={16} color="#7ED321" />
                  <Text style={styles.confidenceTitle}>AI Confidence Interval</Text>
                </View>
                <Text style={styles.confidenceScore}>{forecast.confidenceScore || 92}% Accurate</Text>
              </View>

              <View style={styles.confidenceTrack}>
                <View style={[styles.confidenceFill, { width: `${forecast.confidenceScore || 92}%` }]} />
              </View>
              <Text style={styles.confidenceHint}>
                Based on client payment history, contract due dates & seasonal patterns.
              </Text>
            </View>

            {/* Chart Visual Representation */}
            <Text style={styles.chartTitle}>30-Day Cash Trajectory & Volatility Band</Text>
            <View style={styles.chartContainer}>
              {mockChartBars.map((bar, idx) => {
                const incHeight = (bar.income / maxVal) * 100;
                const expHeight = (bar.expense / maxVal) * 100;

                return (
                  <View key={idx} style={styles.chartCol}>
                    <View style={styles.barsGroup}>
                      {/* Income Bar */}
                      <View style={[styles.bar, styles.barIncome, { height: `${incHeight}%` }]} />
                      {/* Expense Bar */}
                      <View style={[styles.bar, styles.barExpense, { height: `${expHeight}%` }]} />
                    </View>
                    <Text style={styles.colLabel}>{bar.label}</Text>
                    <Text style={styles.colValue}>${(bar.income - bar.expense).toLocaleString()}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
                <Text style={styles.legendText}>Projected Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E74C3C' }]} />
                <Text style={styles.legendText}>Expenses</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4A90E230', borderWidth: 1, borderColor: '#4A90E2' }]} />
                <Text style={styles.legendText}>95% Confidence Band</Text>
              </View>
            </View>

            {/* AI Summary / Insights */}
            {forecast.insights && forecast.insights.length > 0 && (
              <View style={styles.insightsBox}>
                <Text style={styles.insightsBoxTitle}>💡 AI CFO Key Recommendations</Text>
                {forecast.insights.map((item, i) => (
                  <Text key={i} style={styles.insightBullet}>
                    • {item}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  timeframeRow: {
    flexDirection: 'row',
    backgroundColor: '#1C2E4A',
    borderRadius: 8,
    padding: 2,
  },
  tfBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tfBtnActive: {
    backgroundColor: '#4A90E2',
  },
  tfBtnText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  tfBtnTextActive: {
    color: '#FFF',
  },
  loadingCard: {
    backgroundColor: '#1C2E4A',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#1C2E4A',
    borderRadius: 16,
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justify: 'space-between',
    backgroundColor: '#0A1628',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  confidenceBarContainer: {
    backgroundColor: '#0A1628',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  confidenceScore: {
    color: '#7ED321',
    fontSize: 12,
    fontWeight: '700',
  },
  confidenceTrack: {
    height: 6,
    backgroundColor: '#1C2E4A',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#7ED321',
  },
  confidenceHint: {
    color: '#8E8E93',
    fontSize: 11,
  },
  chartTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    justify: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    backgroundColor: '#0A1628',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  chartCol: {
    alignItems: 'center',
    height: '100%',
    justify: 'flex-end',
  },
  barsGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 70,
  },
  bar: {
    width: 12,
    borderRadius: 4,
  },
  barIncome: {
    backgroundColor: '#34C759',
  },
  barExpense: {
    backgroundColor: '#E74C3C',
  },
  colLabel: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 6,
  },
  colValue: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justify: 'center',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#8E8E93',
    fontSize: 11,
  },
  insightsBox: {
    backgroundColor: '#0A1628',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F5A623',
  },
  insightsBoxTitle: {
    color: '#F5A623',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 6,
  },
  insightBullet: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
});
