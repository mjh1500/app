import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function TimeEntryScreen() {
  const [crewMembers, setCrewMembers] = useState([]);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [jobsiteInput, setJobsiteInput] = useState('');
  const [showCrewPicker, setShowCrewPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [activeEntries, setActiveEntries] = useState([]);

  const fetchData = async () => {
    try {
      const [crewRes, activeRes] = await Promise.all([
        fetch(`${API_URL}/api/crew-members`),
        fetch(`${API_URL}/api/time-entries/active`)
      ]);
      if (crewRes.ok) setCrewMembers(await crewRes.json());
      if (activeRes.ok) setActiveEntries(await activeRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const handleClockIn = async () => {
    if (!selectedCrew || !jobsiteInput.trim()) {
      Alert.alert('Error', 'Select crew member and enter jobsite');
      return;
    }
    setClocking(true);
    try {
      const jobRes = await fetch(`${API_URL}/api/jobsites`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: jobsiteInput.trim() })
      });
      const jobsite = await jobRes.json();
      
      const entryRes = await fetch(`${API_URL}/api/time-entries`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crew_member_id: selectedCrew._id, jobsite_id: jobsite._id, project_segment: 'Not Applicable' })
      });
      if (entryRes.ok) {
        Alert.alert('Success', `${selectedCrew.name} clocked in`);
        setSelectedCrew(null); setJobsiteInput(''); fetchData();
      }
    } catch (e) { Alert.alert('Error', 'Failed to clock in'); }
    finally { setClocking(false); }
  };

  const handleClockOut = async (entry) => {
    try {
      await fetch(`${API_URL}/api/time-entries/${entry._id}/stop`, { method: 'PUT' });
      Alert.alert('Clocked Out', `${entry.crew_member_name} clocked out`);
      fetchData();
    } catch (e) { Alert.alert('Error', 'Failed'); }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#4ade80" /></View>;

  return (
    <ScrollView style={styles.container}>
      {activeEntries.length > 0 && (
        <View style={styles.activeSection}>
          <Text style={styles.activeTitle}>Active ({activeEntries.length})</Text>
          {activeEntries.map(e => (
            <View key={e._id} style={styles.activeRow}>
              <Text style={styles.activeName}>{e.crew_member_name}</Text>
              <TouchableOpacity onPress={() => handleClockOut(e)}>
                <Ionicons name="stop-circle" size={32} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.label}>CREW MEMBER</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setShowCrewPicker(true)}>
          <Text style={styles.selectorText}>{selectedCrew ? selectedCrew.name : 'Select...'}</Text>
          <Ionicons name="chevron-down" size={24} color="#6b7280" />
        </TouchableOpacity>
        
        <Text style={styles.label}>JOBSITE</Text>
        <TextInput style={styles.input} value={jobsiteInput} onChangeText={setJobsiteInput} placeholder="Enter jobsite..." placeholderTextColor="#6b7280" />
        
        <TouchableOpacity style={styles.clockBtn} onPress={handleClockIn} disabled={clocking}>
          {clocking ? <ActivityIndicator color="#fff" /> : <Text style={styles.clockBtnText}>CLOCK IN</Text>}
        </TouchableOpacity>
      </View>

      <Modal visible={showCrewPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Crew</Text>
              <TouchableOpacity onPress={() => setShowCrewPicker(false)}><Ionicons name="close" size={28} color="#fff" /></TouchableOpacity>
            </View>
            <FlatList data={crewMembers} keyExtractor={i => i._id} renderItem={({ item }) => (
              <TouchableOpacity style={styles.crewItem} onPress={() => { setSelectedCrew(item); setShowCrewPicker(false); }}>
                <Text style={styles.crewItemText}>{item.name}</Text>
              </TouchableOpacity>
            )} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  loading: { flex: 1, backgroundColor: '#0f0f23', justifyContent: 'center', alignItems: 'center' },
  activeSection: { backgroundColor: '#14532d', margin: 12, borderRadius: 16, padding: 16 },
  activeTitle: { color: '#4ade80', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  activeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  activeName: { color: '#fff', fontSize: 16 },
  section: { padding: 16 },
  label: { color: '#9ca3af', fontSize: 12, marginBottom: 8, marginTop: 12 },
  selector: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12 },
  selectorText: { color: '#fff', fontSize: 16 },
  input: { backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, color: '#fff', fontSize: 16 },
  clockBtn: { backgroundColor: '#16a34a', padding: 20, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  clockBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2d2d44' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  crewItem: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#2d2d44' },
  crewItemText: { color: '#fff', fontSize: 17 },
});
