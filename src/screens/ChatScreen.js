import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { sendMessage } from '../services/AIService';

const COLORS = { primary: '#1E6FD9', dark: '#0A1628', bg: '#F2F4F8', card: '#fff', text: '#1C1C1E', sub: '#8E8E93' };

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  const suggestions = ['Write a sales email', 'Prioritize my tasks', 'Summarize a meeting', 'Growth strategies'];

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    const userMsg = { id: Date.now(), role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }));
      const reply = await sendMessage(msg, history);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: '❌ Error connecting to AI. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={{ padding: 16 }}>
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="sparkles" size={48} color={COLORS.primary} />
              <Text style={styles.emptyTitle}>AI Invoice Generator</Text>
              <Text style={styles.emptySub}>Powered by GPT-4o</Text>
              <View style={styles.suggestions}>
                {suggestions.map((s, i) => (
                  <TouchableOpacity key={i} style={styles.chip} onPress={() => handleSend(s)}>
                    <Text style={styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {messages.map(m => (
            <View key={m.id} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.bubbleText, m.role === 'user' ? styles.userText : styles.aiText]}>{m.text}</Text>
            </View>
          ))}
          {loading && (
            <View style={styles.aiBubble}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your AI assistant..."
            placeholderTextColor={COLORS.sub}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()} disabled={!input.trim() || loading}>
            <Ionicons name="arrow-up-circle" size={36} color={input.trim() ? COLORS.primary : COLORS.sub} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  messages: { flex: 1 },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1C1C1E', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#8E8E93', marginTop: 4, marginBottom: 24 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: { backgroundColor: '#E8F1FC', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { color: '#1E6FD9', fontSize: 13 },
  bubble: { maxWidth: '82%', borderRadius: 18, padding: 12, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#1E6FD9' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#1C1C1E' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E5EA' },
  input: { flex: 1, backgroundColor: '#F2F4F8', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, maxHeight: 100, color: '#1C1C1E' },
  sendBtn: { marginLeft: 8 },
});
