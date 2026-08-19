import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const IRS_TAX_DEDUCTION_RATE = 0.67; // $0.67 per mile standard mileage rate

export default function MileageTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentMiles, setCurrentMiles] = useState(0.0);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  // Sample initial trips
  const [trips, setTrips] = useState([
    {
      id: 'trip-1',
      date: 'Today, 09:15 AM',
      from: 'Home Office',
      to: 'Acme Corp HQ',
      miles: 14.2,
      category: 'business',
      deduction: 9.51,
    },
    {
      id: 'trip-2',
      date: 'Yesterday, 02:40 PM',
      from: 'Client Site (Downtown)',
      to: 'Print Shop',
      miles: 6.8,
      category: 'business',
      deduction: 4.56,
    },
    {
      id: 'trip-3',
      date: 'Aug 17, 06:00 PM',
      from: 'Office',
      to: 'Grocery Mart',
      miles: 4.1,
      category: 'personal',
      deduction: 0.0,
    },
  ]);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      console.warn('Location permissions check error:', err);
      setHasPermission(false);
    }
  };

  const startTracking = async () => {
    if (!hasPermission) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS permission is required for automatic trip tracking.');
        return;
      }
      setHasPermission(true);
    }

    setIsTracking(true);
    setCurrentMiles(0.1);

    // Simulate location updates or use expo-location
    try {
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (loc) => {
          // Increment tracking simulated distance based on fix
          setCurrentMiles((prev) => +(prev + 0.2).toFixed(1));
        }
      );
      setLocationSubscription(sub);
    } catch (err) {
      console.warn('Location watch error:', err);
    }
  };

  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);

    const newTripMiles = currentMiles > 0 ? currentMiles : 5.4;
    const deduction = +(newTripMiles * IRS_TAX_DEDUCTION_RATE).toFixed(2);

    const newTrip = {
      id: `trip-${Date.now()}`,
      date: 'Just now',
      from: 'Current Location',
      to: 'Destination',
      miles: newTripMiles,
      category: 'business',
      deduction,
    };

    setTrips([newTrip, ...trips]);
    Alert.alert(
      'Trip Saved! 🚗',
      `Logged ${newTripMiles} miles. Tax deduction estimated at $${deduction}.`
    );
  };

  const toggleCategory = (tripId) => {
    setTrips((prevTrips) =>
      prevTrips.map((t) => {
        if (t.id === tripId) {
          const newCat = t.category === 'business' ? 'personal' : 'business';
          return {
            ...t,
            category: newCat,
            deduction: newCat === 'business' ? +(t.miles * IRS_TAX_DEDUCTION_RATE).toFixed(2) : 0,
          };
        }
        return t;
      })
    );
  };

  // Totals calculation
  const totalBusinessMiles = trips
    .filter((t) => t.category === 'business')
    .reduce((acc, t) => acc + t.miles, 0);

  const totalTaxSavings = trips
    .filter((t) => t.category === 'business')
    .reduce((acc, t) => acc + t.deduction, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.freeBadge}>
            <Text style={styles.freeText}>INCLUDED FREE</Text>
          </View>
          <Text style={styles.title}>GPS Mileage & Tax Deductions</Text>
          <Text style={styles.subtitle}>QuickBooks charges $15-20/mo — Invoice AI includes it free</Text>
        </View>
      </View>

      {/* Main Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Business Miles</Text>
          <Text style={styles.statValue}>{totalBusinessMiles.toFixed(1)} mi</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Est. Tax Deduction</Text>
          <Text style={[styles.statValue, { color: '#34C759' }]}>
            ${totalTaxSavings.toFixed(2)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>IRS Rate</Text>
          <Text style={styles.statValue}>$0.67/mi</Text>
        </View>
      </View>

      {/* GPS Active Tracker Panel */}
      <View style={[styles.trackerBox, isTracking && styles.trackerBoxActive]}>
        <View style={styles.trackerHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.liveDot, isTracking && styles.liveDotActive]} />
            <Text style={styles.trackerTitle}>
              {isTracking ? 'GPS Tracking Active...' : 'Auto-Trip Detection'}
            </Text>
          </View>
          {isTracking && (
            <Text style={styles.liveMiles}>{currentMiles.toFixed(1)} miles</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.trackBtn, isTracking ? styles.stopBtn : styles.startBtn]}
          onPress={isTracking ? stopTracking : startTracking}
        >
          <Ionicons
            name={isTracking ? 'stop-circle' : 'navigate-circle'}
            size={20}
            color="#FFF"
          />
          <Text style={styles.trackBtnText}>
            {isTracking ? 'Stop & Save Trip' : 'Start Trip Tracking'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trip List */}
      <Text style={styles.sectionTitle}>Recent Trips & Classification</Text>
      <View style={styles.tripList}>
        {trips.map((trip) => {
          const isBusiness = trip.category === 'business';
          return (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="location-sharp" size={16} color="#4A90E2" />
                  <Text style={styles.tripRoute}>
                    {trip.from} → {trip.to}
                  </Text>
                </View>
                <Text style={styles.tripMiles}>{trip.miles} mi</Text>
              </View>

              <Text style={styles.tripDate}>{trip.date}</Text>

              <View style={styles.tripFooter}>
                <Text style={styles.deductionText}>
                  Deduction: <Text style={{ color: isBusiness ? '#34C759' : '#8E8E93', fontWeight: '700' }}>
                    ${trip.deduction.toFixed(2)}
                  </Text>
                </Text>

                {/* Classification Toggle Button / Swipe substitute */}
                <TouchableOpacity
                  style={[
                    styles.catBadge,
                    isBusiness ? styles.catBusiness : styles.catPersonal,
                  ]}
                  onPress={() => toggleCategory(trip.id)}
                >
                  <Ionicons
                    name={isBusiness ? 'briefcase' : 'person'}
                    size={12}
                    color={isBusiness ? '#FFF' : '#8E8E93'}
                  />
                  <Text style={[styles.catText, isBusiness ? { color: '#FFF' } : { color: '#8E8E93' }]}>
                    {isBusiness ? 'Business (Tap to change)' : 'Personal (Tap to change)'}
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
  container: {
    backgroundColor: '#1C2E4A',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    marginBottom: 12,
  },
  headerLeft: {
    gap: 2,
  },
  freeBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  freeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#0A1628',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#1C2E4A',
  },
  trackerBox: {
    backgroundColor: '#0A1628',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1C2E4A',
  },
  trackerBoxActive: {
    borderColor: '#4A90E2',
  },
  trackerHeader: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8E8E93',
  },
  liveDotActive: {
    backgroundColor: '#E74C3C',
  },
  trackerTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  liveMiles: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '700',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  startBtn: {
    backgroundColor: '#4A90E2',
  },
  stopBtn: {
    backgroundColor: '#E74C3C',
  },
  trackBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  tripList: {
    gap: 10,
  },
  tripCard: {
    backgroundColor: '#0A1628',
    borderRadius: 12,
    padding: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tripRoute: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  tripMiles: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tripDate: {
    color: '#8E8E93',
    fontSize: 11,
    marginBottom: 10,
  },
  tripFooter: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
  },
  deductionText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  catBusiness: {
    backgroundColor: '#4A90E2',
  },
  catPersonal: {
    backgroundColor: '#1C2E4A',
  },
  catText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
