import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function CrewScreen() {
  const [crewMembers, setCrewMembers] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchCrew = async () => {
    try {
      const res = await fetch(`${API_URL}/api/crew-members`);
      if (res.ok) setCrewMembers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchCrew(); }, []));

  const handleAdd = async () => {
    if (!newName.trim()) return Alert.alert('Error', 'Enter name');
    setAdding(true);
    try {
      const res = await fetch(`${API_URL}/api/crew-members`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      if (res.ok) { setNewName(''); fetchCrew(); Alert.alert('Added!'); }
    } catch (e) { Alert.alert('Error'); }
    finally { setAdding(false); }
  };

  const handleDelete = (m) => {
    Alert.alert('Delete?', `Remove ${m.name}?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await fetch(`${API_URL}/api/crew-members/${m._id}`, { method: 'DELETE' });
        fetchCrew();
      }}
    ]);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#4ade80" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.addSection}>
        <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Enter name..." placeholderTextColor="#6b7280" />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} disabled={adding}>
          {adding ? <ActivityIndicator color="#fff" /> : <Ionicons name="add" size={28} color="#fff" />}
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.list} refreshControl={<RefreshControl refreshing={false} onRefresh={fetchCrew} tintColor="#4ade80" />}>
        {crewMembers.map(m => (
          <View key={m._id} style={styles.card}>
            <Text style={styles.name}>{m.name}</Text>
            <TouchableOpacity onPress={() => handleDelete(m)}><Ionicons name="trash-outline" size={22} color="#ef4444" /></TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  loading: { flex: 1, backgroundColor: '#0f0f23', justifyContent: 'center', alignItems: 'center' },
  addSection: { flexDirection: 'row', padding: 16, backgroundColor: '#1a1a2e' },
  input: { flex: 1, backgroundColor: '#0f0f23', padding: 14, borderRadius: 12, color: '#fff', marginRight: 12 },
  addBtn: { backgroundColor: '#16a34a', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1, padding: 16 },
  card: { backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#fff', fontSize: 18 },
});
