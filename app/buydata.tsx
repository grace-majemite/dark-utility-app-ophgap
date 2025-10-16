
import { router } from 'expo-router';
import { StyleSheet, Text, View, Pressable, ScrollView, Platform, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useState, useEffect } from 'react';
import { useWidget } from '@/contexts/WidgetContext';

interface DataPlan {
  id: string;
  provider: string;
  name: string;
  price: number;
  validity: string;
  speed: string;
  data: string;
}

export default function BuyDataScreen() {
  const { walletBalance, updateWalletBalance, addTransaction, verifyPin } = useWidget();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState<'mtn' | 'airtel' | 'glo' | null>(null);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch data plans based on provider
  useEffect(() => {
    if (provider) {
      fetchDataPlans(provider);
    }
  }, [provider]);

  const fetchDataPlans = async (selectedProvider: 'mtn' | 'airtel' | 'glo') => {
    setLoading(true);
    try {
      // Simulating API call - in production, replace with real API
      const plans: DataPlan[] = {
        mtn: [
          { id: 'mtn_1', provider: 'MTN', name: '500MB', price: 100, validity: '7 days', speed: '4G', data: '500MB' },
          { id: 'mtn_2', provider: 'MTN', name: '1GB', price: 200, validity: '14 days', speed: '4G', data: '1GB' },
          { id: 'mtn_3', provider: 'MTN', name: '2GB', price: 350, validity: '30 days', speed: '4G', data: '2GB' },
          { id: 'mtn_4', provider: 'MTN', name: '5GB', price: 800, validity: '30 days', speed: '4G', data: '5GB' },
          { id: 'mtn_5', provider: 'MTN', name: '10GB', price: 1500, validity: '30 days', speed: '4G', data: '10GB' },
          { id: 'mtn_6', provider: 'MTN', name: '20GB', price: 2800, validity: '30 days', speed: '4G', data: '20GB' },
        ],
        airtel: [
          { id: 'airtel_1', provider: 'Airtel', name: '500MB', price: 110, validity: '7 days', speed: '4G', data: '500MB' },
          { id: 'airtel_2', provider: 'Airtel', name: '1GB', price: 210, validity: '14 days', speed: '4G', data: '1GB' },
          { id: 'airtel_3', provider: 'Airtel', name: '2GB', price: 360, validity: '30 days', speed: '4G', data: '2GB' },
          { id: 'airtel_4', provider: 'Airtel', name: '5GB', price: 850, validity: '30 days', speed: '4G', data: '5GB' },
          { id: 'airtel_5', provider: 'Airtel', name: '10GB', price: 1600, validity: '30 days', speed: '4G', data: '10GB' },
          { id: 'airtel_6', provider: 'Airtel', name: '20GB', price: 3000, validity: '30 days', speed: '4G', data: '20GB' },
        ],
        glo: [
          { id: 'glo_1', provider: 'Glo', name: '500MB', price: 90, validity: '7 days', speed: '4G', data: '500MB' },
          { id: 'glo_2', provider: 'Glo', name: '1GB', price: 180, validity: '14 days', speed: '4G', data: '1GB' },
          { id: 'glo_3', provider: 'Glo', name: '2GB', price: 330, validity: '30 days', speed: '4G', data: '2GB' },
          { id: 'glo_4', provider: 'Glo', name: '5GB', price: 750, validity: '30 days', speed: '4G', data: '5GB' },
          { id: 'glo_5', provider: 'Glo', name: '10GB', price: 1400, validity: '30 days', speed: '4G', data: '10GB' },
          { id: 'glo_6', provider: 'Glo', name: '20GB', price: 2600, validity: '30 days', speed: '4G', data: '20GB' },
        ],
      }[selectedProvider];

      setDataPlans(plans);
    } catch (error) {
      console.log('Error fetching data plans:', error);
      alert('Failed to fetch data plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }
    if (!selectedPlan) {
      alert('Please select a data plan');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmPurchase = () => {
    setShowConfirmation(false);
    setShowPinModal(true);
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      setPinError('PIN must be 4 digits');
      return;
    }

    setProcessingPayment(true);
    try {
      const isValidPin = await verifyPin(pin);
      if (!isValidPin) {
        setPinError('Invalid PIN');
        setProcessingPayment(false);
        return;
      }

      const plan = dataPlans.find(p => p.id === selectedPlan);
      if (!plan) {
        alert('Plan not found');
        setProcessingPayment(false);
        return;
      }

      // Deduct from wallet
      const success = await updateWalletBalance(-plan.price);
      if (success) {
        // Add transaction
        addTransaction({
          id: 'txn_' + Date.now(),
          type: 'debit',
          amount: plan.price,
          description: `${plan.provider} Data - ${plan.name}`,
          timestamp: Date.now(),
          status: 'completed',
        });

        setShowPinModal(false);
        setPin('');
        setPinError('');
        setPhoneNumber('');
        setSelectedPlan(null);
        setProvider(null);

        alert(`Successfully purchased ${plan.name} for ₦${plan.price}. Data will be activated shortly.`);
      } else {
        alert('Insufficient wallet balance');
      }
    } catch (error) {
      console.log('Error processing payment:', error);
      setPinError('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const selectedPlanData = dataPlans.find(p => p.id === selectedPlan);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Buy Data</Text>
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

        {/* Phone Number Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter phone number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            editable={!provider}
          />
        </View>

        {/* Provider Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Provider</Text>
          <View style={styles.providerGrid}>
            {(['mtn', 'airtel', 'glo'] as const).map((prov) => (
              <Pressable
                key={prov}
                style={[
                  styles.providerButton,
                  provider === prov && styles.providerButtonActive
                ]}
                onPress={() => setProvider(provider === prov ? null : prov)}
              >
                <Text style={[
                  styles.providerText,
                  provider === prov && styles.providerTextActive
                ]}>
                  {prov.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Data Plans */}
        {provider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Plans</Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <View style={styles.plansGrid}>
                {dataPlans.map((plan) => (
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
                        <IconSymbol name="calendar" size={12} color={colors.textSecondary} />
                        <Text style={styles.planDetailText}>{plan.validity}</Text>
                      </View>
                      <View style={styles.planDetail}>
                        <IconSymbol name="bolt.fill" size={12} color={colors.secondary} />
                        <Text style={styles.planDetailText}>{plan.speed}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {provider && (
          <Pressable
            style={[
              styles.purchaseButton,
              (!selectedPlan || !phoneNumber) && styles.purchaseButtonDisabled
            ]}
            onPress={handlePurchase}
            disabled={!selectedPlan || !phoneNumber}
          >
            <Text style={styles.purchaseButtonText}>Continue to Payment</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Purchase</Text>
              <Pressable onPress={() => setShowConfirmation(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </Pressable>
            </View>

            {selectedPlanData && (
              <View style={styles.confirmationContent}>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Phone Number</Text>
                  <Text style={styles.confirmationValue}>{phoneNumber}</Text>
                </View>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Provider</Text>
                  <Text style={styles.confirmationValue}>{selectedPlanData.provider}</Text>
                </View>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Data Plan</Text>
                  <Text style={styles.confirmationValue}>{selectedPlanData.name}</Text>
                </View>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Validity</Text>
                  <Text style={styles.confirmationValue}>{selectedPlanData.validity}</Text>
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
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmPurchase}
              >
                <Text style={styles.confirmButtonText}>Proceed to Pay</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="slide"
        onRequestClose={() => !processingPayment && setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pinModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter PIN</Text>
              {!processingPayment && (
                <Pressable onPress={() => setShowPinModal(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.text} />
                </Pressable>
              )}
            </View>

            <View style={styles.pinContent}>
              <Text style={styles.pinLabel}>Enter your 4-digit PIN to confirm payment</Text>
              <TextInput
                style={styles.pinInput}
                placeholder="••••"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                value={pin}
                onChangeText={(text) => {
                  setPin(text);
                  setPinError('');
                }}
                editable={!processingPayment}
              />
              {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPinModal(false)}
                disabled={processingPayment}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handlePinSubmit}
                disabled={processingPayment || pin.length !== 4}
              >
                {processingPayment ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.confirmButtonText}>Pay ₦{selectedPlanData?.price}</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  phoneInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  providerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  providerButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  providerButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  providerText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  providerTextActive: {
    color: colors.primary,
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
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
    fontSize: 18,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 8,
  },
  planDetails: {
    gap: 4,
  },
  planDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planDetailText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonText: {
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
    maxHeight: '80%',
  },
  pinModal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 300,
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
  pinContent: {
    marginBottom: 24,
  },
  pinLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  pinInput: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  pinError: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 8,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
