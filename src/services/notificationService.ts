
interface NotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
}

class NotificationService {
  private hasPermission: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Este browser não suporta notificações.');
      return false;
    }

    const permission = await Notification.requestPermission();
    this.hasPermission = permission === 'granted';
    return this.hasPermission;
  }

  showNotification(title: string, options?: NotificationOptions) {
    if (!this.hasPermission) {
      console.log('Permissão de notificação não concedida.');
      return;
    }

    try {
      // Prioritize service worker notifications if available (better for mobile)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            ...options,
            icon: options?.icon || '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
          });
        });
      } else {
        // Fallback to standard Notification API
        new Notification(title, options);
      }
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
    }
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}

export const notificationService = new NotificationService();
