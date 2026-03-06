Commit changes
3. Create app/jobsites.tsx
Add file → Name: app/jobsites.tsx
Paste:
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function JobsitesScreen() {
  const [jobsites, setJobsites] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobsites = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobsites`);
      if (res.ok) setJobsites(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchJobsites(); }, []));

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await fetch(`${API_URL}/api/jobsites`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      setNewName(''); fetchJobsites();
    } catch (e) { Alert.alert('Error'); }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#4ade80" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.addSection}>
        <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Enter jobsite..." placeholderTextColor="#6b7280" />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}><Ionicons name="add" size={28} color="#fff" /></TouchableOpacity>
      </View>
      <ScrollView style={styles.list} refreshControl={<RefreshControl refreshing={false} onRefresh={fetchJobsites} tintColor="#4ade80" />}>
        {jobsites.map(j => (
          <View key={j._id} style={styles.card}>
            <Ionicons name="location" size={24} color="#60a5fa" />
            <Text style={styles.name}>{j.name}</Text>
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
  addBtn: { backgroundColor: '#3b82f6', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1, padding: 16 },
  card: { backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  name: { color: '#fff', fontSize: 17, marginLeft: 12 },
});
Commit changes
4. Create app/reports.tsx
Add file → Name: app/reports.tsx
Paste:
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ReportsScreen() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return Alert.alert('Enter email');
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/send-daily-report`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_email: email.trim() })
      });
      if (res.ok) {
        Alert.alert('Sent!', `Report sent to ${email}`);
        setEmail('');
      } else {
        Alert.alert('Error', 'Failed to send');
      }
    } catch (e) { Alert.alert('Error'); }
    finally { setSending(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.header}>
          <Ionicons name="mail" size={24} color="#4ade80" />
          <Text style={styles.title}>Email Daily Report</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.desc}>Send today's time tracking summary to an email.</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email..." placeholderTextColor="#6b7280" keyboardType="email-address" autoCapitalize="none" />
          <TouchableOpacity style={styles.btn} onPress={handleSend} disabled={sending}>
            {sending ? <ActivityIndicator color="#fff" /> : <><Ionicons name="send" size={20} color="#fff" /><Text style={styles.btnText}>Send Report</Text></>}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  section: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20 },
  desc: { color: '#9ca3af', marginBottom: 16 },
  input: { backgroundColor: '#0f0f23', padding: 16, borderRadius: 12, color: '#fff', marginBottom: 16 },
  btn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
