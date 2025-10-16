import * as React from "react";
import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { ExtensionStorage } from "@bacons/apple-targets";
import * as SecureStore from 'expo-secure-store';

// Initialize storage with your group ID
const storage = new ExtensionStorage(
  "group.com.<user_name>.<app_name>"
);

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  profilePicture?: string;
  pin?: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

type WidgetContextType = {
  refreshWidget: () => void;
  walletBalance: number;
  setWalletBalance: (balance: number) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateWalletBalance: (amount: number) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  loadUserData: () => Promise<void>;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  const [walletBalance, setWalletBalance] = useState(5000);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load user data from secure storage on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Update widget state whenever what we want to show changes
  React.useEffect(() => {
    // set widget_state to null if we want to reset the widget
    // storage.set("widget_state", null);

    // Refresh widget
    ExtensionStorage.reloadWidget();
  }, []);

  const loadUserData = async () => {
    try {
      const storedProfile = await SecureStore.getItemAsync('userProfile');
      const storedBalance = await SecureStore.getItemAsync('walletBalance');
      const storedTransactions = await SecureStore.getItemAsync('transactions');

      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        // Initialize default profile
        const defaultProfile: UserProfile = {
          id: 'user_' + Date.now(),
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+234 (801) 234-5678',
          location: 'Lagos, Nigeria',
        };
        setUserProfile(defaultProfile);
        await SecureStore.setItemAsync('userProfile', JSON.stringify(defaultProfile));
      }

      if (storedBalance) {
        setWalletBalance(parseFloat(storedBalance));
      }

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const updateWalletBalance = async (amount: number): Promise<boolean> => {
    try {
      const newBalance = walletBalance + amount;
      if (newBalance < 0) {
        console.log('Insufficient balance');
        return false;
      }
      setWalletBalance(newBalance);
      await SecureStore.setItemAsync('walletBalance', newBalance.toString());
      return true;
    } catch (error) {
      console.log('Error updating wallet balance:', error);
      return false;
    }
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      const storedPin = await SecureStore.getItemAsync('userPin');
      return storedPin === pin;
    } catch (error) {
      console.log('Error verifying PIN:', error);
      return false;
    }
  };

  const setPin = async (pin: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync('userPin', pin);
    } catch (error) {
      console.log('Error setting PIN:', error);
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>): Promise<void> => {
    try {
      const updatedProfile = { ...userProfile, ...profile } as UserProfile;
      setUserProfile(updatedProfile);
      await SecureStore.setItemAsync('userProfile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.log('Error updating profile:', error);
    }
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
    SecureStore.setItemAsync('transactions', JSON.stringify([transaction, ...transactions])).catch(
      (error) => console.log('Error saving transaction:', error)
    );
  };

  const refreshWidget = useCallback(() => {
    ExtensionStorage.reloadWidget();
  }, []);

  return (
    <WidgetContext.Provider value={{
      refreshWidget,
      walletBalance,
      setWalletBalance,
      userProfile,
      setUserProfile,
      transactions,
      addTransaction,
      updateWalletBalance,
      verifyPin,
      setPin,
      updateProfile,
      loadUserData,
    }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
};
