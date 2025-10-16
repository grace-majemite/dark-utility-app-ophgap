
import { router } from 'expo-router';
import { StyleSheet, Text, View, Pressable, ScrollView, Platform, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useState } from 'react';
import { useWidget } from '@/contexts/WidgetContext';

export default function FundWalletScreen() {
  const { walletBalance, updateWalletBalance, addTransaction } = useWidget();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fundingMethods = [
    { id: 'card', name: 'Debit Card', icon: 'creditcard', description: 'Visa, Mastercard' },
    { id: 'bank', name: 'Bank Transfer', icon: 'building.2', description: 'Direct transfer' },
    { id: 'ussd', name: 'USSD', icon: 'phone', description: '*901#' },
    { id: 'wallet', name: 'Mobile Money', icon: 'wallet.pass', description: 'MTN, Airtel' },
  ];

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  const handleFund = () => {
    if (!amount || !selectedMethod) {
      alert("Please select an amount and payment method");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmFund = async () => {
    setProcessing(true);
    try {
      const fundAmount = parseFloat(amount);
      if (isNaN(fundAmount) || fundAmount <= 0) {
        alert('Invalid amount');
        setProcessing(false);
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const success = await updateWalletBalance(fundAmount);
      if (success) {
        addTransaction({
          id: 'txn_' + Date.now(),
          type: 'credit',
          amount: fundAmount,
          description: `Wallet Funded via ${fundingMethods.find(m => m.id === selectedMethod)?.name}`,
          timestamp: Date.now(),
          status: 'completed',
        });

        setShowConfirmation(false);
        setAmount('');
        setSelectedMethod(null);
        alert(`Successfully funded wallet with ₦${fundAmount}`);
      } else {
        alert('Failed to fund wallet');
      }
    } catch (error) {
      console.log('Error funding wallet:', error);
      alert('An error occurred while funding wallet');
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
        <Text style={styles.headerTitle}>Fund Wallet</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Amount</Text>
          <View style={styles.quickAmountsGrid}>
            {quickAmounts.map((quickAmount) => (
              <Pressable
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  amount === quickAmount.toString() && styles.quickAmountButtonActive
                ]}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={[
                  styles.quickAmountText,
                  amount === quickAmount.toString() && styles.quickAmountTextActive
                ]}>
                  ₦{quickAmount.toLocaleString()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {fundingMethods.map((method) => (
            <Pressable
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={[
                styles.methodIcon,
                selectedMethod === method.id && styles.methodIconSelected
              ]}>
                <IconSymbol name={method.icon as any} size={24} color={colors.text} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
              {selectedMethod === method.id && (
                <View style={styles.selectedIndicator}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[
            styles.fundButton,
            (!amount || !selectedMethod) && styles.fundButtonDisabled
          ]}
          onPress={handleFund}
          disabled={!amount || !selectedMethod}
        >
          <Text style={styles.fundButtonText}>Fund Wallet</Text>
        </Pressable>
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
              <Text style={styles.modalTitle}>Confirm Funding</Text>
              {!processing && (
                <Pressable onPress={() => setShowConfirmation(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.text} />
                </Pressable>
              )}
            </View>

            <View style={styles.confirmationContent}>
              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Amount</Text>
                <Text style={styles.confirmationValueHighlight}>₦{amount}</Text>
              </View>
              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Payment Method</Text>
                <Text style={styles.confirmationValue}>
                  {fundingMethods.find(m => m.id === selectedMethod)?.name}
                </Text>
              </View>
            </View>

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
                onPress={handleConfirmFund}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.secondary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickAmountButton: {
    width: '30%',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  quickAmountButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  quickAmountTextActive: {
    color: colors.primary,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  methodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodIconSelected: {
    backgroundColor: colors.primary,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  fundButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  fundButtonDisabled: {
    opacity: 0.5,
  },
  fundButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
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
