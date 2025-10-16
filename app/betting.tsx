
import { router } from 'expo-router';
import { StyleSheet, Text, View, Pressable, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useState } from 'react';

export default function BettingScreen() {
  const [selectedBet, setSelectedBet] = useState<number | null>(null);
  const [walletBalance] = useState(5000);

  const bets = [
    { id: 1, match: 'Man United vs Liverpool', odds: 1.85, prediction: 'Home Win', potential: 185 },
    { id: 2, match: 'Chelsea vs Arsenal', odds: 2.10, prediction: 'Away Win', potential: 210 },
    { id: 3, match: 'Man City vs Tottenham', odds: 1.65, prediction: 'Home Win', potential: 165 },
    { id: 4, match: 'Brighton vs Newcastle', odds: 2.50, prediction: 'Draw', potential: 250 },
    { id: 5, match: 'Aston Villa vs Everton', odds: 1.95, prediction: 'Home Win', potential: 195 },
    { id: 6, match: 'Fulham vs Brentford', odds: 2.20, prediction: 'Away Win', potential: 220 },
  ];

  const handlePlaceBet = () => {
    if (selectedBet === null) {
      alert("Please select a bet");
      return;
    }
    const bet = bets.find(b => b.id === selectedBet);
    if (bet && walletBalance >= 100) {
      alert(`Bet placed on ${bet.match}\nPotential win: ₦${bet.potential}`);
      setSelectedBet(null);
    } else {
      alert("Insufficient wallet balance");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Betting</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>₦{walletBalance.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceIcon}>
              <IconSymbol name="dice" size={32} color={colors.accent} />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Available Bets</Text>
        {bets.map((bet) => (
          <Pressable
            key={bet.id}
            style={[
              styles.betCard,
              selectedBet === bet.id && styles.betCardSelected
            ]}
            onPress={() => setSelectedBet(bet.id)}
          >
            <View style={styles.betHeader}>
              <Text style={styles.betMatch}>{bet.match}</Text>
              {selectedBet === bet.id && (
                <View style={styles.checkmark}>
                  <IconSymbol name="checkmark" size={16} color={colors.background} />
                </View>
              )}
            </View>
            <View style={styles.betDetails}>
              <View style={styles.betDetail}>
                <Text style={styles.betDetailLabel}>Prediction</Text>
                <Text style={styles.betDetailValue}>{bet.prediction}</Text>
              </View>
              <View style={styles.betDetail}>
                <Text style={styles.betDetailLabel}>Odds</Text>
                <Text style={styles.betDetailValue}>{bet.odds.toFixed(2)}</Text>
              </View>
              <View style={styles.betDetail}>
                <Text style={styles.betDetailLabel}>Potential Win</Text>
                <Text style={[styles.betDetailValue, { color: colors.secondary }]}>₦{bet.potential}</Text>
              </View>
            </View>
          </Pressable>
        ))}

        <Pressable
          style={[
            styles.placeBetButton,
            selectedBet === null && styles.placeBetButtonDisabled
          ]}
          onPress={handlePlaceBet}
        >
          <Text style={styles.placeBetButtonText}>Place Bet (₦100)</Text>
        </Pressable>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Betting Tips</Text>
          <View style={styles.tipCard}>
            <IconSymbol name="lightbulb" size={20} color={colors.primary} />
            <Text style={styles.tipText}>Always bet responsibly and within your budget</Text>
          </View>
          <View style={styles.tipCard}>
            <IconSymbol name="lightbulb" size={20} color={colors.primary} />
            <Text style={styles.tipText}>Research teams and recent form before betting</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.accent,
  },
  balanceIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  betCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  betCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.highlight,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  betMatch: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  betDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  betDetail: {
    flex: 1,
  },
  betDetailLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  betDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  placeBetButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  placeBetButtonDisabled: {
    opacity: 0.5,
  },
  placeBetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  tipText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
});
