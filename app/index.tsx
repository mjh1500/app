import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Dashboard() {
  const [activeCrews, setActiveCrews] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [activeRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/active-crews`),
        fetch(`${API_URL}/api/dashboard/summary`),
      ]);
      if (activeRes.ok) setActiveCrews(await activeRes.json());
      if (summaryRes.ok) setSummaries(await summaryRes.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const formatElapsedTime = (startTime) => {
    const diffMs = new Date().getTime() - new Date(startTime).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#4ade80" />}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={24} color="#4ade80" />
          <Text style={styles.sectionTitle}>Active Crews</Text>
        </View>
        {activeCrews.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="moon-outline" size={48} color="#6b7280" />
            <Text style={styles.emptyText}>No active crews</Text>
          </View>
        ) : (
          activeCrews.map((site) => (
            <View key={site.jobsite_id} style={styles.siteCard}>
              <Text style={styles.siteName}>{site.jobsite_name}</Text>
              {site.crew_members.map((crew) => (
                <View key={crew.entry_id} style={styles.crewRow}>
                  <Text style={styles.crewName}>{crew.crew_member_name}</Text>
                  <Text style={styles.elapsedTime}>{formatElapsedTime(crew.start_time)}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="stats-chart" size={24} color="#4ade80" />
          <Text style={styles.sectionTitle}>Man Hours by Jobsite</Text>
        </View>
        {summaries.map((s) => (
          <View key={s.jobsite_id} style={styles.summaryCard}>
            <Text style={styles.summaryName}>{s.jobsite_name}</Text>
            <Text style={styles.statValue}>{s.total_hours.toFixed(1)} hours</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  loadingContainer: { flex: 1, backgroundColor: '#0f0f23', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9ca3af', marginTop: 16 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  emptyCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 18, marginTop: 16 },
  siteCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 12 },
  siteName: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  crewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  crewName: { color: '#e5e7eb', fontSize: 16 },
  elapsedTime: { color: '#4ade80', fontSize: 14, fontWeight: '600' },
  summaryCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 12 },
  summaryName: { color: '#fff', fontSize: 18, fontWeight: '600' },
  statValue: { color: '#4ade80', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
});
