import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { GlassCard } from '../../components/GlassCard';
import { getWeather, getCropAdvisory } from '../../api/weatherApi';
import { WeatherData } from '../../navigation/types';

export const WeatherScreen: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [advisories, setAdvisories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const data = await getWeather();
      setWeather(data);
      setAdvisories(getCropAdvisory(data));
      setLoading(false);
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    })();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#0A1A06', '#0F2209']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loadingCenter}>
            <Text style={styles.loadingEmoji}>🌤️</Text>
            <Text style={styles.loadingText}>Loading weather data...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!weather) return null;

  const getUVLabel = (uv: number) => uv <= 2 ? 'Low' : uv <= 5 ? 'Moderate' : uv <= 7 ? 'High' : 'Very High';
  const getUVColor = (uv: number) => uv <= 2 ? Colors.success : uv <= 5 ? Colors.warning : Colors.danger;

  return (
    <LinearGradient colors={['#0A1A06', '#0D2A15', '#0A1A06']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.ScrollView
          style={{ opacity: fadeIn }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Header */}
          <Text style={styles.pageTitle}>🌦️ Weather & Advisory</Text>
          <Text style={styles.pageLocation}>📍 {weather.location}</Text>

          {/* Main Weather Card */}
          <LinearGradient
            colors={['rgba(13,42,21,0.9)', 'rgba(15,34,9,0.95)']}
            style={styles.mainCard}
          >
            <View style={styles.mainCardBorder} />
            <Text style={styles.mainIcon}>{weather.icon}</Text>
            <Text style={styles.mainTemp}>{weather.temperature}°C</Text>
            <Text style={styles.mainDesc}>{weather.description}</Text>
            <View style={styles.mainMetrics}>
              {[
                { icon: '💧', label: 'Humidity', value: `${weather.humidity}%` },
                { icon: '💨', label: 'Wind', value: `${weather.windSpeed} km/h` },
                { icon: '🌡️', label: 'Feels Like', value: `${weather.feelsLike}°C` },
                { icon: '👁️', label: 'Visibility', value: `${weather.visibility} km` },
              ].map((m, i) => (
                <View key={i} style={styles.metricBox}>
                  <Text style={styles.metricIcon}>{m.icon}</Text>
                  <Text style={styles.metricValue}>{m.value}</Text>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* UV Index */}
          <GlassCard style={styles.uvCard} padding={16}>
            <View style={styles.uvRow}>
              <View>
                <Text style={styles.uvTitle}>☀️ UV Index</Text>
                <Text style={[styles.uvValue, { color: getUVColor(weather.uvIndex) }]}>{weather.uvIndex}</Text>
                <Text style={[styles.uvLabel, { color: getUVColor(weather.uvIndex) }]}>{getUVLabel(weather.uvIndex)}</Text>
              </View>
              <View style={styles.uvBar}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                  <View
                    key={v}
                    style={[
                      styles.uvSegment,
                      { backgroundColor: v <= weather.uvIndex ? getUVColor(weather.uvIndex) : Colors.surfaceHigh },
                    ]}
                  />
                ))}
              </View>
            </View>
          </GlassCard>

          {/* 7-Day Forecast */}
          <Text style={styles.sectionHeading}>📅 7-Day Forecast</Text>
          <GlassCard style={styles.forecastCard} padding={0}>
            {weather.forecast.map((day, i) => (
              <View key={i} style={[styles.forecastRow, i < weather.forecast.length - 1 && styles.forecastDivider]}>
                <Text style={styles.forecastDay}>{day.day}</Text>
                <Text style={styles.forecastIcon}>{day.icon}</Text>
                <Text style={styles.forecastDesc}>{day.description}</Text>
                <View style={styles.forecastRight}>
                  {day.rainChance > 0 && (
                    <Text style={styles.rainChance}>🌧 {day.rainChance}%</Text>
                  )}
                  <Text style={styles.forecastTemps}>{day.high}° / {day.low}°</Text>
                </View>
              </View>
            ))}
          </GlassCard>

          {/* Crop Advisories */}
          <Text style={styles.sectionHeading}>🌾 Crop Advisory</Text>
          {advisories.map((advisory, i) => (
            <GlassCard key={i} style={styles.advisoryItem} padding={14}>
              <Text style={styles.advisoryText}>{advisory}</Text>
            </GlassCard>
          ))}

          {/* Irrigation Guide */}
          <Text style={styles.sectionHeading}>💧 Irrigation Guide</Text>
          <GlassCard style={styles.irrigationCard} padding={16}>
            {[
              { crop: '🍅 Tomato', schedule: 'Every 2-3 days', amount: '40-50 mm/week' },
              { crop: '🌾 Wheat', schedule: 'Every 5-7 days', amount: '25-30 mm/week' },
              { crop: '🌾 Rice', schedule: 'Continuous flooding', amount: '5 cm standing water' },
              { crop: '🥔 Potato', schedule: 'Every 3-4 days', amount: '35-40 mm/week' },
            ].map((item, i) => (
              <View key={i} style={[styles.irrigRow, i < 3 && styles.irrigDivider]}>
                <Text style={styles.irrigCrop}>{item.crop}</Text>
                <View style={styles.irrigDetails}>
                  <Text style={styles.irrigSchedule}>{item.schedule}</Text>
                  <Text style={styles.irrigAmount}>{item.amount}</Text>
                </View>
              </View>
            ))}
          </GlassCard>

          <View style={{ height: 32 }} />
        </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.screenPadding, paddingTop: 16 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingEmoji: { fontSize: 60, marginBottom: 16 },
  loadingText: { color: Colors.textMuted, fontSize: Typography.fontSize.base },
  pageTitle: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extraBold, color: Colors.textPrimary },
  pageLocation: { fontSize: Typography.fontSize.sm, color: Colors.textMuted, marginTop: 4, marginBottom: Spacing[5] },
  mainCard: {
    borderRadius: BorderRadius.xl, padding: Spacing[6], alignItems: 'center',
    marginBottom: Spacing[4], position: 'relative', overflow: 'hidden',
  },
  mainCardBorder: {
    ...StyleSheet.absoluteFillObject, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.border,
  },
  mainIcon: { fontSize: 72, marginBottom: 8 },
  mainTemp: { fontSize: 64, fontWeight: Typography.fontWeight.extraBold, color: Colors.textPrimary, lineHeight: 72 },
  mainDesc: { fontSize: Typography.fontSize.lg, color: Colors.textSecondary, marginBottom: Spacing[5] },
  mainMetrics: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 8 },
  metricBox: { alignItems: 'center' },
  metricIcon: { fontSize: 20, marginBottom: 4 },
  metricValue: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  metricLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  uvCard: { marginBottom: Spacing[4] },
  uvRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  uvTitle: { fontSize: Typography.fontSize.sm, color: Colors.textMuted, marginBottom: 4 },
  uvValue: { fontSize: Typography.fontSize['4xl'], fontWeight: Typography.fontWeight.extraBold },
  uvLabel: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semiBold },
  uvBar: { flex: 1, marginLeft: 20, flexDirection: 'row', gap: 3 },
  uvSegment: { flex: 1, height: 8, borderRadius: 2 },
  sectionHeading: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing[3], marginTop: Spacing[4] },
  forecastCard: { marginBottom: Spacing[4], overflow: 'hidden' },
  forecastRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  forecastDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  forecastDay: { width: 44, fontSize: Typography.fontSize.sm, color: Colors.textSecondary, fontWeight: Typography.fontWeight.semiBold },
  forecastIcon: { fontSize: 22, marginHorizontal: 8 },
  forecastDesc: { flex: 1, fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  forecastRight: { alignItems: 'flex-end' },
  rainChance: { fontSize: 10, color: Colors.info },
  forecastTemps: { fontSize: Typography.fontSize.sm, color: Colors.textPrimary, fontWeight: Typography.fontWeight.semiBold },
  advisoryItem: { marginBottom: Spacing[2] },
  advisoryText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  irrigationCard: {},
  irrigRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  irrigDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  irrigCrop: { fontSize: Typography.fontSize.sm, color: Colors.textPrimary, fontWeight: Typography.fontWeight.semiBold, flex: 1 },
  irrigDetails: { alignItems: 'flex-end' },
  irrigSchedule: { fontSize: Typography.fontSize.xs, color: Colors.secondary },
  irrigAmount: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
});
