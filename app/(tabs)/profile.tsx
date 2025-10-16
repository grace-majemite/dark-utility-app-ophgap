import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Modal, TextInput, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { userProfile, updateProfile, setPin } = useWidget();
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [settingPin, setSettingPin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.name);
      setEditEmail(userProfile.email);
      setEditPhone(userProfile.phone);
      setEditLocation(userProfile.location);
    }
  }, [userProfile]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const base64 = await convertImageToBase64(result.assets[0].uri);
        await updateProfile({ profilePicture: base64 });
        alert('Profile picture updated successfully');
      }
    } catch (error) {
      console.log('Error picking image:', error);
      alert('Failed to pick image');
    }
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.log('Error converting image:', error);
      throw error;
    }
  };

  const handleSetPin = async () => {
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      setPinError('PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }

    setSettingPin(true);
    try {
      await setPin(newPin);
      setShowPinModal(false);
      setNewPin('');
      setConfirmPin('');
      setPinError('');
      alert('PIN set successfully');
    } catch (error) {
      console.log('Error setting PIN:', error);
      setPinError('Failed to set PIN');
    } finally {
      setSettingPin(false);
    }
  };

  const handleUpdateProfile = async () => {
    setEditingProfile(true);
    try {
      await updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
        location: editLocation,
      });
      setShowEditModal(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.log('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setEditingProfile(false);
    }
  };

  const menuItems = [
    { icon: "bell", label: "Notifications", value: "Enabled" },
    { icon: "lock", label: "Security", value: "Active" },
    { icon: "doc.text", label: "Terms & Conditions", value: "" },
    { icon: "questionmark.circle", label: "Help & Support", value: "" },
    { icon: "info.circle", label: "About Nova", value: "v1.0.0" },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Pressable style={styles.avatarContainer} onPress={handlePickImage}>
            {userProfile?.profilePicture ? (
              <Image
                source={{ uri: userProfile.profilePicture }}
                style={styles.profileImage}
              />
            ) : (
              <IconSymbol name="person.circle.fill" size={80} color={colors.primary} />
            )}
            <View style={styles.cameraIcon}>
              <IconSymbol name="camera.fill" size={16} color={colors.background} />
            </View>
          </Pressable>
          <Text style={styles.name}>{userProfile?.name || 'John Doe'}</Text>
          <Text style={styles.email}>{userProfile?.email || 'john.doe@example.com'}</Text>
          <Text style={styles.joinDate}>Joined January 2024</Text>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Pressable onPress={() => setShowEditModal(true)}>
              <IconSymbol name="pencil" size={20} color={colors.primary} />
            </Pressable>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="phone.fill" size={20} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{userProfile?.phone || '+234 (801) 234-5678'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="location.fill" size={20} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{userProfile?.location || 'Lagos, Nigeria'}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Pressable style={styles.menuItem} onPress={() => setShowPinModal(true)}>
            <View style={styles.menuItemLeft}>
              <IconSymbol name="lock" size={20} color={colors.primary} />
              <Text style={styles.menuLabel}>Set PIN</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
          </Pressable>
          {menuItems.map((item, index) => (
            <Pressable key={index} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <IconSymbol name={item.icon as any} size={20} color={colors.primary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton}>
          <IconSymbol name="arrowshape.turn.up.left" size={20} color={colors.accent} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="slide"
        onRequestClose={() => !settingPin && setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pinModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set PIN</Text>
              {!settingPin && (
                <Pressable onPress={() => setShowPinModal(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.text} />
                </Pressable>
              )}
            </View>

            <View style={styles.pinContent}>
              <Text style={styles.pinLabel}>Create a 4-digit PIN for transactions</Text>
              <TextInput
                style={styles.pinInput}
                placeholder="Enter PIN"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                value={newPin}
                onChangeText={(text) => {
                  setNewPin(text);
                  setPinError('');
                }}
                editable={!settingPin}
              />
              <TextInput
                style={[styles.pinInput, { marginTop: 12 }]}
                placeholder="Confirm PIN"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                value={confirmPin}
                onChangeText={(text) => {
                  setConfirmPin(text);
                  setPinError('');
                }}
                editable={!settingPin}
              />
              {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPinModal(false)}
                disabled={settingPin}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSetPin}
                disabled={settingPin || newPin.length !== 4 || confirmPin.length !== 4}
              >
                {settingPin ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.confirmButtonText}>Set PIN</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => !editingProfile && setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              {!editingProfile && (
                <Pressable onPress={() => setShowEditModal(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.text} />
                </Pressable>
              )}
            </View>

            <ScrollView style={styles.editContent}>
              <Text style={styles.editLabel}>Name</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                editable={!editingProfile}
              />

              <Text style={styles.editLabel}>Email</Text>
              <TextInput
                style={styles.editInput}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                editable={!editingProfile}
              />

              <Text style={styles.editLabel}>Phone</Text>
              <TextInput
                style={styles.editInput}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                editable={!editingProfile}
              />

              <Text style={styles.editLabel}>Location</Text>
              <TextInput
                style={styles.editInput}
                value={editLocation}
                onChangeText={setEditLocation}
                editable={!editingProfile}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
                disabled={editingProfile}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateProfile}
                disabled={editingProfile}
              >
                {editingProfile ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.confirmButtonText}>Save Changes</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  avatarContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  menuValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  pinModal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  editModal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
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
  pinContent: {
    marginBottom: 20,
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
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  pinError: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 8,
    textAlign: 'center',
  },
  editContent: {
    marginBottom: 20,
    maxHeight: 300,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  editInput: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.highlight,
    marginBottom: 12,
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
