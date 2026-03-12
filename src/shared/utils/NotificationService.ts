import { Alert, Platform } from 'react-native';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { useUIPreferencesStore } from '../stores/uiPreferencesStore';

/**
 * NotificationService
 * Handles real system notifications using @notifee/react-native.
 */
class NotificationService {
  private static instance: NotificationService;
  private channelId: string = 'default';

  private constructor() {
    this.createChannel();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async createChannel() {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: this.channelId,
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
        vibration: true,
      });
    }
  }

  /**
   * Request notification permissions.
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();
      
      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log('[NotificationService] Permission granted');
        return true;
      } else {
        console.log('[NotificationService] Permission denied');
        return false;
      }
    } catch (error) {
      console.error('[NotificationService] Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Check current permission status
   */
  public async checkPermissions(): Promise<boolean> {
    const settings = await notifee.getNotificationSettings();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  }

  /**
   * Trigger an instant market alert notification
   */
  public async triggerMarketAlert(cardName: string) {
    const { marketAlertsEnabled, notificationsEnabled } = useUIPreferencesStore.getState();
    
    if (!notificationsEnabled || !marketAlertsEnabled) return;

    await notifee.displayNotification({
      title: '🔔 Thẻ bài mới trên chợ!',
      body: `${cardName} vừa được rao bán. Kiểm tra ngay!`,
      android: {
        channelId: this.channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  /**
   * Trigger an instant price change notification
   */
  public async triggerPriceAlert(cardName: string, changePercent: number) {
    const { priceChangeAlertsEnabled, notificationsEnabled } = useUIPreferencesStore.getState();
    
    if (!notificationsEnabled || !priceChangeAlertsEnabled) return;

    const direction = changePercent > 0 ? 'tăng' : 'giảm';
    const color = changePercent > 0 ? '#22c55e' : '#ef4444';

    await notifee.displayNotification({
      title: '📈 Biến động giá!',
      body: `Thẻ ${cardName} vừa ${direction} ${Math.abs(changePercent)}% trong hôm nay.`,
      android: {
        channelId: this.channelId,
        color: color,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  public async scheduleDailySummary() {
    // Basic implementation for now
    console.log('[NotificationService] Daily summary logic can be expanded here.');
  }
}

export default NotificationService.getInstance();

