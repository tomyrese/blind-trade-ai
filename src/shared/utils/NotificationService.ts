import { Alert, Platform } from 'react-native';
import { useUIPreferencesStore } from '../stores/uiPreferencesStore';

/**
 * NotificationService
 * Handles permission requests and simulated notifications for the app.
 * In a real-world scenario, this would integrate with expo-notifications 
 * or @react-native-firebase/messaging.
 */
class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request notification permissions on first launch or when toggled.
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      // In a real implementation with expo-notifications:
      // const { status } = await Notifications.requestPermissionsAsync();
      // return status === 'granted';

      // For now, we simulate the request if on a real device or emulator
      console.log('[NotificationService] Requesting permissions...');
      
      // We can use Alert as a standby for the permission prompt in this simulated environment
      return new Promise((resolve) => {
        Alert.alert(
          'Notifications',
          'BlindTradeAI would like to send you notifications for price alerts and market updates.',
          [
            { text: 'Don\'t Allow', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Allow', onPress: () => resolve(true) },
          ]
        );
      });
    } catch (error) {
      console.error('[NotificationService] Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Check current permission status
   */
  public async checkPermissions(): Promise<boolean> {
    // Simulate checking permissions
    return true; 
  }

  /**
   * Schedule a daily summary notification (e.g., at 8:00 AM)
   */
  public async scheduleDailySummary() {
    const { dailySummaryEnabled, notificationsEnabled } = useUIPreferencesStore.getState();
    
    if (!notificationsEnabled || !dailySummaryEnabled) {
        console.log('[NotificationService] Daily summary disabled, skipping schedule.');
        return;
    }

    console.log('[NotificationService] Scheduling daily summary for 08:00 AM...');
    // Real implementation:
    // await Notifications.scheduleNotificationAsync({ ... });
  }

  /**
   * Trigger an instant market alert notification
   */
  public async triggerMarketAlert(cardName: string) {
    const { marketAlertsEnabled, notificationsEnabled } = useUIPreferencesStore.getState();
    
    if (!notificationsEnabled || !marketAlertsEnabled) return;

    console.log(`[NotificationService] Triggering market alert: ${cardName} is now available!`);
    // Real implementation: show local notification
  }

  /**
   * Trigger an instant price change notification
   */
  public async triggerPriceAlert(cardName: string, changePercent: number) {
    const { priceChangeAlertsEnabled, notificationsEnabled } = useUIPreferencesStore.getState();
    
    if (!notificationsEnabled || !priceChangeAlertsEnabled) return;

    const direction = changePercent > 0 ? 'tăng' : 'giảm';
    console.log(`[NotificationService] Triggering price alert: ${cardName} giá ${direction} ${Math.abs(changePercent)}%!`);
    // Real implementation: show local notification
  }
}

export default NotificationService.getInstance();
