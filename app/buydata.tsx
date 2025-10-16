
import { router } from 'expo-router';
import { StyleSheet, Text, View, Pressable, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useState } from 'react';

export default function BuyDataScreen() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [walletBalance] = useState(5000);

  const dataPlans = [
    { id: 1, name: "500MB", price: 100, validity: "7 days", speed: "4G" },
    { id: 2, name: "1GB", price: 200, validity: "14 days", speed: "4G" },
    { id: 3, name: "2GB", price: 350, validity: "30 days", speed: "4G" },
    { id: 4, name: "5GB", price: 800, validity: "30 days", speed: "4G" },
    { id: 5, name: "10GB", price: 1500, validity: "30 days", speed: "4G" },
    { id: 6, name: "20GB", price: 2800, validity: "30 days", speed: "4G" },
  ];

  const handlePurchase = () => {
    if (selectedPlan === null) {
      alert("Please select a data plan");
      return;
    }
    const plan = dataPlans.find(p => p.id === selectedPlan);
    if (plan && walletBalance >= plan.price) {
      alert(`Successfully purchased ${plan.name} for ₦${plan.price}`);
      setSelectedPlan(null);
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

        <Text style={styles.sectionTitle}>Available Plans</Text>
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

        <Pressable
          style={[
            styles.purchaseButton,
            selectedPlan === null && styles.purchaseButtonDisabled
          ]}
          onPress={handlePurchase}
        >
          <Text style={styles.purchaseButtonText}>Purchase Plan</Text>
        </Pressable>
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
});
