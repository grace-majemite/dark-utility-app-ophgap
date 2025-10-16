
import { router } from 'expo-router';
import { StyleSheet, Text, View, Pressable, ScrollView, Platform, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useState } from 'react';
import { useWidget } from '@/contexts/WidgetContext';

const BET_AMOUNT = 100;

export default function BettingScreen() {
  const { walletBalance, updateWalletBalance, addTransaction } = useWidget();
  const [selectedBet, setSelectedBet] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [processing, setProcessing] = useState(false);

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
    if (walletBalance < BET_AMOUNT) {
      alert("Insufficient wallet balance");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmBet = async () => {
    setProcessing(true);
    try {
      const bet = bets.find(b => b.id === selectedBet);
      if (!bet) {
        alert('Bet not found');
        setProcessing(false);
        return;
      }

      // Simulate bet processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const success = await updateWalletBalance(-BET_AMOUNT);
      if (success) {
        addTransaction({
          id: 'txn_' + Date.now(),
          type: 'debit',
          amount: BET_AMOUNT,
          description: `Bet placed on ${bet.match}`,
          timestamp: Date.now(),
          status: 'completed',
        });

        setShowConfirmation(false);
        setSelectedBet(null);
        alert(`Bet placed successfully!\nMatch: ${bet.match}\nPotential win: ₦${bet.potential}`);
      } else {
        alert('Failed to place bet');
      }
    } catch (error) {
      console.log('Error placing bet:', error);
      alert('An error occurred while placing bet');
    } finally {
      setProcessing(false);
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
            (selectedBet === null || walletBalance < BET_AMOUNT) && styles.placeBetButtonDisabled
          ]}
          onPress={handlePlaceBet}
          disabled={selectedBet === null || walletBalance < BET_AMOUNT}
        >
          <Text style={styles.placeBetButtonText}>Place Bet (₦{BET_AMOUNT})</Text>
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

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="slide"
        onRequestClose={() => !processing && setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Bet</Text>
              {!processing && (
                <Pressable onPress={() => setShowConfirmation(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.text} />
                </Pressable>
              )}
            </View>

            {selectedBet && bets.find(b => b.id === selectedBet) && (
              <View style={styles.confirmationContent}>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Match</Text>
                  <Text style={styles.confirmationValue}>{bets.find(b => b.id === selectedBet)?.match}</Text>
                </View>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Prediction</Text>
                  <Text style={styles.confirmationValue}>{bets.find(b => b.id === selectedBet)?.prediction}</Text>
                </View>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Odds</Text>
                  <Text style={styles.confirmationValue}>{bets.find(b => b.id === selectedBet)?.odds.toFixed(2)}</Text>
                </View>
                <View style={[styles.confirmationItem, styles.confirmationItemHighlight]}>
                  <Text style={styles.confirmationLabel}>Bet Amount</Text>
                  <Text style={styles.confirmationValueHighlight}>₦{BET_AMOUNT}</Text>
                </View>
                <View style={[styles.confirmationItem, styles.confirmationItemHighlight]}>
                  <Text style={styles.confirmationLabel}>Potential Win</Text>
                  <Text style={styles.confirmationValueHighlight}>₦{bets.find(b => b.id === selectedBet)?.potential}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmation(false)}
                disabled={processing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmBet}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Bet</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  confirmationModal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  confirmationContent: {
    marginBottom: 20,
  },
  confirmationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
  },
  confirmationItemHighlight: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginTop: 8,
  },
  confirmationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  confirmationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  confirmationValueHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.highlight,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  confirmButton: {
    backgroundColor: colors.accent,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
});
