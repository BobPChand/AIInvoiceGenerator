import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Share, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import Purchases from 'react-native-purchases';
import {
  getAvatarUsage,
  incrementAvatarUsage,
  addAvatarCredits,
  createAvatarVideo,
  getAvatarVideoStatus
} from '../services/AvatarApiService';

const VOICE_OPTIONS = [
  { id: '330290724a1b470fb63153f34d4c0183', name: 'Annie', label: 'Professional Female' },
  { id: '1bd001e7e50f421d891986aad5158bc8', name: 'Jason', label: 'Corporate Male' },
  { id: '2d8225c00e124803875e533e53610940', name: 'Serena', label: 'Executive Female' },
  { id: '077ab11b14f0440b8a13511102928509', name: 'Tyler', label: 'Conversational Male' },
];

const PRODUCT_5 = 'aibiz_inv_avatar_5';
const PRODUCT_10 = 'aibiz_inv_avatar_10';

export default function AvatarVideoScreen() {
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [usage, setUsage] = useState({ totalRemaining: 10, canGenerate: true, freeRemaining: 10, purchasedRemaining: 0 });
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    loadUsage();
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const loadUsage = async () => {
    setLoadingUsage(true);
    const data = await getAvatarUsage();
    setUsage(data);
    setLoadingUsage(false);
  };

  const handleBuyCredits = async (productId, creditsAmount) => {
    setPurchasing(true);
    try {
      const products = await Purchases.getProducts([productId]);
      if (products && products.length > 0) {
        const result = await Purchases.purchaseProduct(products[0]);
        if (result && result.customerInfo) {
          await addAvatarCredits(creditsAmount);
          await loadUsage();
          Alert.alert('Success', `Successfully purchased ${creditsAmount} video credits!`);
        }
      } else {
        Alert.alert('Notice', 'Could not load store products. Please try again.');
      }
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert('Purchase Error', e.message || 'Failed to complete purchase.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleGenerate = async () => {
    if (!script.trim()) {
      Alert.alert('Input Required', 'Please enter a script for your AI video.');
      return;
    }

    const currentUsage = await getAvatarUsage();
    setUsage(currentUsage);

    if (!currentUsage.canGenerate || currentUsage.totalRemaining <= 0) {
      Alert.alert(
        'No Credits Remaining',
        'You have used all your video credits. Purchase more credits to generate new videos.',
        [
          { text: 'Buy 5 Credits ($4.99)', onPress: () => handleBuyCredits(PRODUCT_5, 5) },
          { text: 'Buy 10 Credits ($9.99)', onPress: () => handleBuyCredits(PRODUCT_10, 10) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    setGenerating(true);
    setProgressMsg('Initiating AI avatar video generation...');
    setVideoUrl(null);

    try {
      const resp = await createAvatarVideo(
        script.trim(),
        selectedVoice,
        'Adriana_BizTalk_Front_public'
      );

      const videoId = resp.video_id || resp.id || (resp.data && resp.data.video_id);

      if (!videoId) {
        throw new Error(resp.error || resp.message || 'Failed to start video generation.');
      }

      setProgressMsg('Video rendering in progress. Polling server...');

      let attempts = 0;
      pollTimerRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const statusResp = await getAvatarVideoStatus(videoId);
          const status = statusResp.status || (statusResp.data && statusResp.data.status);
          const url = statusResp.video_url || (statusResp.data && statusResp.data.video_url);

          if (status === 'completed' || url) {
            clearInterval(pollTimerRef.current);
            setVideoUrl(url);
            setGenerating(false);
            setProgressMsg('');
            await incrementAvatarUsage();
            await loadUsage();
            Alert.alert('Success!', 'Your AI video message has been generated successfully.');
          } else if (status === 'failed') {
            clearInterval(pollTimerRef.current);
            setGenerating(false);
            setProgressMsg('');
            Alert.alert('Error', 'Video generation failed. Please try again.');
          } else {
            setProgressMsg(`Rendering video... (${attempts * 4}s elapsed)`);
          }
        } catch (err) {
          console.warn('Polling status error:', err);
        }

        if (attempts > 45) {
          clearInterval(pollTimerRef.current);
          setGenerating(false);
          setProgressMsg('');
          Alert.alert('Timeout', 'Video creation took longer than expected. Please check back shortly.');
        }
      }, 4000);

    } catch (err) {
      setGenerating(false);
      setProgressMsg('');
      Alert.alert('Error', err.message || 'Failed to generate video.');
    }
  };

  const handleShare = async () => {
    if (!videoUrl) return;
    try {
      if (Platform.OS === 'ios') {
        const fileUri = `${FileSystem.documentDirectory}ai_video_${Date.now()}.mp4`;
        const downloadRes = await FileSystem.downloadAsync(videoUrl, fileUri);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadRes.uri);
        } else {
          await Share.share({ url: videoUrl, message: 'Check out my AI Video Message!' });
        }
      } else {
        await Share.share({ url: videoUrl, message: 'Check out my AI Video Message!' });
      }
    } catch (e) {
      await Share.share({ message: `Check out my AI Video Message: ${videoUrl}` });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.badgeRow}>
            <Ionicons name="videocam" size={24} color="#4A90E2" />
            <Text style={styles.headerTitle}>AI Video Message</Text>
          </View>
          <View style={styles.usagePill}>
            {loadingUsage ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <Text style={styles.usagePillText}>
                {usage.totalRemaining} Credits Remaining
              </Text>
            )}
          </View>
        </View>

        {/* Free allowance info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="gift-outline" size={20} color="#4A90E2" style={{ marginRight: 8 }} />
          <Text style={styles.infoBannerText}>
            Every user gets 10 free AI videos every month
          </Text>
        </View>

        {/* Script Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Script / Video Message 💡 Tip: aim for 340-420 characters for a natural 20-25 second video.</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="Write or paste your invoice video message, client thank-you, or payment reminder script..."
            placeholderTextColor="#8E8E93"
            value={script}
            onChangeText={setScript}
          />
        </View>

        {/* Voice Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select AI Presenter Voice</Text>
          <View style={styles.voiceGrid}>
            {VOICE_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.voiceCard,
                  selectedVoice === v.id && styles.voiceCardSelected
                ]}
                onPress={() => setSelectedVoice(v.id)}
              >
                <Ionicons
                  name={selectedVoice === v.id ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={selectedVoice === v.id ? '#4A90E2' : '#8E8E93'}
                />
                <View style={styles.voiceInfo}>
                  <Text style={[styles.voiceName, selectedVoice === v.id && styles.voiceNameSelected]}>
                    {v.name}
                  </Text>
                  <Text style={styles.voiceLabel}>{v.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, (generating || purchasing) && styles.buttonDisabled]}
          onPress={handleGenerate}
          disabled={generating || purchasing}
        >
          {generating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.generateButtonText}>Generate AI Video</Text>
            </>
          )}
        </TouchableOpacity>

        {progressMsg !== '' && (
          <View style={styles.progressCard}>
            <ActivityIndicator size="small" color="#4A90E2" style={{ marginBottom: 6 }} />
            <Text style={styles.progressText}>{progressMsg}</Text>
          </View>
        )}

        {/* Video Result */}
        {videoUrl && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Generated AI Video</Text>
            <Video
              source={{ uri: videoUrl }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
            />
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.shareButtonText}>Share Video</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Purchase Credits Section */}
        <View style={styles.purchaseSection}>
          <Text style={styles.purchaseTitle}>Need More Video Credits?</Text>
          <Text style={styles.purchaseSubtitle}>Purchase additional video generation credits anytime:</Text>
          <View style={styles.purchaseButtonsRow}>
            <TouchableOpacity
              style={[styles.buyCard, purchasing && styles.buttonDisabled]}
              onPress={() => handleBuyCredits(PRODUCT_5, 5)}
              disabled={purchasing}
            >
              <Text style={styles.buyCardTitle}>5 Credits</Text>
              <Text style={styles.buyCardPrice}>Buy 5 Credits ($4.99)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buyCard, styles.buyCardFeatured, purchasing && styles.buttonDisabled]}
              onPress={() => handleBuyCredits(PRODUCT_10, 10)}
              disabled={purchasing}
            >
              <View style={styles.popularTag}><Text style={styles.popularTagText}>Best Value</Text></View>
              <Text style={styles.buyCardTitle}>10 Credits</Text>
              <Text style={styles.buyCardPrice}>Buy 10 Credits ($9.99)</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  scroll: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  usagePill: {
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  usagePillText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.12)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  infoBannerText: {
    color: '#E0E6ED',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1C2E4A',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2C4368',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  voiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  voiceCard: {
    width: '48%',
    backgroundColor: '#1C2E4A',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C4368',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  voiceCardSelected: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
  },
  voiceInfo: {
    marginLeft: 8,
  },
  voiceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  voiceNameSelected: {
    color: '#4A90E2',
  },
  voiceLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  generateButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  progressCard: {
    backgroundColor: '#1C2E4A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C4368',
  },
  progressText: {
    fontSize: 13,
    color: '#E0E6ED',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#1C2E4A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C4368',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  videoPlayer: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  shareButton: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  purchaseSection: {
    backgroundColor: '#1C2E4A',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C4368',
  },
  purchaseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  purchaseSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 12,
  },
  purchaseButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buyCard: {
    width: '48%',
    backgroundColor: '#0A1628',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2C4368',
    alignItems: 'center',
  },
  buyCardFeatured: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
  },
  popularTag: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  popularTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  buyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buyCardPrice: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    textAlign: 'center',
  },
});
