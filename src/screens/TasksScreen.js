import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = { primary: '#1E6FD9', bg: '#F2F4F8', card: '#fff', text: '#1C1C1E', sub: '#8E8E93' };
const PRIORITIES = ['High', 'Medium', 'Low'];
const PRIORITY_COLORS = { High: '#FF3B30', Medium: '#FF9500', Low: '#34C759' };

export default function TasksScreen() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Review Q2 sales report', priority: 'High', done: false },
    { id: '2', title: 'Send client proposal', priority: 'High', done: false },
    { id: '3', title: 'Update website copy', priority: 'Medium', done: true },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [filter, setFilter] = useState('All');

  const filtered = tasks.filter(t => filter === 'All' ? true : filter === 'Done' ? t.done : !t.done);

  const addTask = () => {
    if (!newTitle.trim()) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), title: newTitle.trim(), priority: newPriority, done: false }]);
    setNewTitle(''); setNewPriority('Medium'); setShowModal(false);
  };

  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Filter tabs */}
      <View style={styles.filters}>
        {['All', 'Active', 'Done'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.activeTab]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.activeText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <TouchableOpacity onPress={() => toggleTask(item.id)} style={styles.checkbox}>
              <Ionicons name={item.done ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={item.done ? '#34C759' : COLORS.sub} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.taskTitle, item.done && styles.doneText]}>{item.title}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[item.priority] + '20' }]}>
                <Text style={[styles.priorityText, { color: PRIORITY_COLORS[item.priority] }]}>{item.priority}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Ionicons name="trash-outline" size={20} color={COLORS.sub} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tasks here!</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Task</Text>
            <TextInput style={styles.modalInput} placeholder="Task title..." value={newTitle} onChangeText={setNewTitle} autoFocus />
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map(p => (
                <TouchableOpacity key={p} style={[styles.priorityBtn, newPriority === p && { backgroundColor: PRIORITY_COLORS[p] }]} onPress={() => setNewPriority(p)}>
                  <Text style={[styles.priorityBtnText, newPriority === p && { color: '#fff' }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={addTask}><Text style={{ color: '#fff', fontWeight: '600' }}>Add Task</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', padding: 12, gap: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#E5E5EA' },
  activeTab: { backgroundColor: '#1E6FD9' },
  filterText: { color: '#8E8E93', fontWeight: '500' },
  activeText: { color: '#fff' },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, gap: 10 },
  checkbox: { marginRight: 4 },
  taskTitle: { fontSize: 15, color: '#1C1C1E', marginBottom: 4 },
  doneText: { textDecorationLine: 'line-through', color: '#8E8E93' },
  priorityBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  priorityText: { fontSize: 11, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontSize: 16 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1E6FD9', justifyContent: 'center', alignItems: 'center', shadowColor: '#1E6FD9', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalInput: { backgroundColor: '#F2F4F8', borderRadius: 12, padding: 12, fontSize: 15, marginBottom: 16 },
  label: { fontSize: 13, color: '#8E8E93', marginBottom: 8 },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  priorityBtn: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#F2F4F8', alignItems: 'center' },
  priorityBtnText: { fontWeight: '600', color: '#1C1C1E' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#F2F4F8', alignItems: 'center' },
  addBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#1E6FD9', alignItems: 'center' },
});
