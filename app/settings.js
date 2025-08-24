import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { setLanguage, setCurrency, setTheme, setNotifications } from '@/store/slices/settingsSlice';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
];

const THEMES = [
  { key: 'light', name: 'Light', icon: 'sunny-outline' },
  { key: 'dark', name: 'Dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleLanguageChange = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      dispatch(setLanguage(languageCode));
      Alert.alert(t('common.success'), 'Language changed successfully');
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to change language');
    }
    setShowLanguageModal(false);
  };

  const handleCurrencyChange = (currencyCode) => {
    dispatch(setCurrency(currencyCode));
    Alert.alert(t('common.success'), 'Currency changed successfully');
    setShowCurrencyModal(false);
  };

  const handleThemeChange = (themeKey) => {
    dispatch(setTheme(themeKey));
    Alert.alert(t('common.success'), 'Theme changed successfully');
    setShowThemeModal(false);
  };

  const handleNotificationToggle = (value) => {
    dispatch(setNotifications(value));
  };

  const getCurrentLanguageName = () => {
    const lang = LANGUAGES.find(l => l.code === settings.language);
    return lang ? lang.nativeName : 'English';
  };

  const getCurrentCurrencyName = () => {
    const currency = CURRENCIES.find(c => c.code === settings.currency);
    return currency ? `${currency.name} (${currency.code})` : 'US Dollar (USD)';
  };

  const getCurrentThemeName = () => {
    const theme = THEMES.find(t => t.key === settings.theme);
    return theme ? t(`settings.${theme.key}`) : t('settings.light');
  };

  const renderOptionModal = (visible, onClose, title, options, currentValue, onSelect, keyProp = 'code', nameProp = 'name') => (
    <View style={[styles.modalOverlay, { display: visible ? 'flex' : 'none' }]}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={styles.cancelText}>{t('common.cancel')}</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.modalTitle}>{title}</ThemedText>
          <View style={{ width: 60 }} />
        </View>
        
        <View style={styles.optionsList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option[keyProp]}
              style={styles.optionItem}
              onPress={() => onSelect(option[keyProp])}
            >
              <ThemedText style={styles.optionText}>
                {option.nativeName || option[nameProp]}
              </ThemedText>
              {currentValue === option[keyProp] && (
                <Ionicons name="checkmark" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: t('settings.title') }} />
      
      <ScrollView style={styles.container}>
        {/* Language Setting */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={24} color="#007AFF" />
              <ThemedText style={styles.settingTitle}>
                {t('settings.language')}
              </ThemedText>
            </View>
            <View style={styles.settingRight}>
              <ThemedText style={styles.settingValue}>
                {getCurrentLanguageName()}
              </ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Currency Setting */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowCurrencyModal(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
              <ThemedText style={styles.settingTitle}>
                {t('settings.currency')}
              </ThemedText>
            </View>
            <View style={styles.settingRight}>
              <ThemedText style={styles.settingValue}>
                {getCurrentCurrencyName()}
              </ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Theme Setting */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowThemeModal(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette-outline" size={24} color="#FF9500" />
              <ThemedText style={styles.settingTitle}>
                {t('settings.theme')}
              </ThemedText>
            </View>
            <View style={styles.settingRight}>
              <ThemedText style={styles.settingValue}>
                {getCurrentThemeName()}
              </ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Notifications Setting */}
        <View style={styles.section}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color="#FF3B30" />
              <ThemedText style={styles.settingTitle}>
                {t('settings.notifications')}
              </ThemedText>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={24} color="#8E8E93" />
              <ThemedText style={styles.settingTitle}>
                {t('settings.about')}
              </ThemedText>
            </View>
          </View>
          
          <View style={[styles.settingItem, styles.aboutItem]}>
            <ThemedText style={styles.aboutLabel}>
              {t('settings.version')}
            </ThemedText>
            <ThemedText style={styles.aboutValue}>1.0.0</ThemedText>
          </View>
          
          <View style={[styles.settingItem, styles.aboutItem]}>
            <ThemedText style={styles.aboutLabel}>App Name</ThemedText>
            <ThemedText style={styles.aboutValue}>Finance Tracker</ThemedText>
          </View>
        </View>

        {/* Reset Data Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={() => {
              Alert.alert(
                'Reset Data',
                'This will delete all your transactions and categories. This action cannot be undone.',
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: 'Reset', style: 'destructive', onPress: () => {
                    Alert.alert('Feature Coming Soon', 'Data reset functionality will be available in a future update.');
                  }}
                ]
              );
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              <ThemedText style={[styles.settingTitle, styles.dangerText]}>
                Reset All Data
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Modal */}
      {renderOptionModal(
        showLanguageModal,
        () => setShowLanguageModal(false),
        t('settings.language'),
        LANGUAGES,
        settings.language,
        handleLanguageChange
      )}

      {/* Currency Modal */}
      {renderOptionModal(
        showCurrencyModal,
        () => setShowCurrencyModal(false),
        t('settings.currency'),
        CURRENCIES,
        settings.currency,
        handleCurrencyChange
      )}

      {/* Theme Modal */}
      {renderOptionModal(
        showThemeModal,
        () => setShowThemeModal(false),
        t('settings.theme'),
        THEMES,
        settings.theme,
        handleThemeChange,
        'key',
        'name'
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  aboutItem: {
    paddingLeft: 56,
  },
  aboutLabel: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  aboutValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#FF3B30',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  optionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
});