import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: number;
  read: boolean;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private unreadCount: number = 0;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async loadNotifications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
        this.updateUnreadCount();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  async saveNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.updateUnreadCount();
    await this.saveNotifications();
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.updateUnreadCount();
      await this.saveNotifications();
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.updateUnreadCount();
    await this.saveNotifications();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.updateUnreadCount();
    await this.saveNotifications();
  }

  async clearAllNotifications(): Promise<void> {
    this.notifications = [];
    this.updateUnreadCount();
    await this.saveNotifications();
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.unreadCount;
  }

  hasUnreadNotifications(): boolean {
    return this.unreadCount > 0;
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  // Sample notifications for testing
  async addSampleNotifications(): Promise<void> {
    const sampleNotifications = [
      {
        title: 'Welcome to FYP Healthcare!',
        message: 'Your account has been created successfully. Start exploring our services.',
        type: 'success' as const,
      },
      {
        title: 'Appointment Reminder',
        message: 'You have an appointment with Dr. Smith tomorrow at 2:00 PM.',
        type: 'info' as const,
      },
      {
        title: 'Prescription Ready',
        message: 'Your prescription is ready for pickup at the pharmacy.',
        type: 'warning' as const,
      },
    ];

    for (const notification of sampleNotifications) {
      await this.addNotification(notification);
    }
  }
}

export default NotificationService.getInstance();
