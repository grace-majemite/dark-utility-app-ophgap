import { router } from 'expo-router';
import { StyleSheet, Text, View, Pressable, ScrollView, Platform, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useState } from 'react';
import { useWidget } from '@/contexts/WidgetContext';

interface TVPlan {
  id: string;
  name: string;
  price: number;
  channels: number;
  duration: string;
  description: string;
}

export default function TVScreen() {
  const { walletBalance, updateWalletBalance, addTransaction } = useWidget();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [processing, setProcessing] = useState(false);

  const tvPlans: TVPlan[] = [
    { id: 'basic', name: 'Basic', price: 500, channels: 50, duration: '30 days', description: 'Essential channels' },
    { id: 'standard', name: 'Standard', price: 1000, channels: 100, duration: '30 days', description: 'Popular channels' },
    { id: 'premium', name: 'Premium', price: 1500, channels: 150, duration: '30 days', description: 'All channels' },
    { id: 'sports', name: 'Sports Plus', price: 800, channels: 30, duration: '30 days', description: 'Sports channels' },
  ];

  const handleSubscribe = () => {
    if (!selectedPlan) {
      alert('Please select a TV plan');
      return;
    }
    if (walletBalance < (tvPlans.find(p => p.id === selectedPlan)?.price || 0)) {
      alert('Insufficient wallet balance');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSubscription = async () => {
    setProcessing(true);
    try {
      const plan = tvPlans.find(p => p.id === selectedPlan);
      if (!plan) {
        alert('Plan not found');
        setProcessing(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      const success = await updateWalletBalance(-plan.price);
      if (success) {
        addTransaction({
          id: 'txn_' + Date.now(),
          type: 'debit',
          amount: plan.price,
          description: `TV Subscription - ${plan.name}`,
          timestamp: Date.now(),
          status: 'completed',
        });

        setShowConfirmation(false);
        setSelectedPlan(null);
        alert(`Successfully subscribed to ${plan.name}!\nYou now have access to ${plan.channels} channels.`);
      } else {
        alert('Failed to subscribe');
      }
    } catch (error) {
      console.log('Error subscribing:', error);
      alert('An error occurred while subscribing');
    } finally {
      setProcessing(false);
    }
  };

  const selectedPlanData = tvPlans.find(p => p.id === selectedPlan);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>TV Streaming</Text>
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
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>₦{walletBalance.toLocaleString()}</Text>
        </View>

        <Text style={styles.sectionTitle}>Available Plans</Text>
        <View style={styles.plansContainer}>
          {tvPlans.map((plan) => (
            <Pressable
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                {selectedPlan === plan.id && (
                  <View style={styles.checkmark}>
                    <IconSymbol name="checkmark" size={16} color={colors.background} />
                  </View>
                )}
              </View>
              <Text style={styles.planPrice}>₦{plan.price}</Text>
              <View style={styles.planDetails}>
                <View style={styles.planDetail}>
                  <IconSymbol name="tv" size={12} color={colors.secondary} />
                  <Text style={styles.planDetailText}>{plan.channels} channels</Text>
                </View>
                <View style={styles.planDetail}>
                  <IconSymbol name="calendar" size={12} color={colors.secondary} />
                  <Text style={styles.planDetailText}>{plan.duration}</Text>
                </View>
              </View>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[
            styles.subscribeButton,
            !selectedPlan && styles.subscribeButtonDisabled
          ]}
          onPress={handleSubscribe}
          disabled={!selectedPlan}
        >
          <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showConfirmation}
        transparent
        animationType="slide"
        onRequestClose={() => !processing && setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Subscription</Text>
              {!processing && (
                <Pressable onPress={() => setShowConfirmation(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.text} />
                </Pressable>
              )}
            </View>

            {selectedPlanData && (
              <View style={styles.confirmationContent}>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Plan</Text>
                  <Text style={styles.confirmationValue}>{selectedPlanData.name}</Text>
                </View>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Channels</Text>
                  <Text style={styles.confirmationValue}>{selectedPlanData.channels}</Text>
                </View>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Duration</Text>
                  <Text style={styles.confirmationValue}>{selectedPlanData.duration}</Text>
                </View>
                <View style={[styles.confirmationItem, styles.confirmationItemHighlight]}>
                  <Text style={styles.confirmationLabel}>Amount</Text>
                  <Text style={styles.confirmationValueHighlight}>₦{selectedPlanData.price}</Text>
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
                onPress={handleConfirmSubscription}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
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
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.secondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 8,
  },
  planDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  planDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  planDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  subscribeButtonDisabled: {
    opacity: 0.5,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
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
    fontSize: 18,
    fontWeight: '800',
    color: colors.secondary,
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
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
});
