// Serviço de notificações para vulnerabilidades críticas

import type { TriageResult } from "@/types/vulnerability";

export interface Notification {
  id: string;
  type: "CRITICAL" | "HIGH" | "INFO";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

class NotificationService {
  private storageKey = "vulnerability-notifications";

  /**
   * Cria notificações baseadas no resultado da triagem
   */
  createNotificationsFromResult(result: TriageResult): Notification[] {
    const notifications: Notification[] = [];

    // Notificação para vulnerabilidades críticas
    if (result.critical > 0) {
      notifications.push({
        id: `critical-${Date.now()}`,
        type: "CRITICAL",
        title: "⚠️ Vulnerabilidades Críticas Detectadas",
        message: `${result.critical} vulnerabilidade(s) crítica(s) encontrada(s). Ação imediata recomendada.`,
        timestamp: Date.now(),
        read: false,
      });
    }

    // Notificação para alta taxa de falsos positivos
    const falsePositiveRate = result.total > 0 
      ? (result.falsePositives / result.total) * 100 
      : 0;
    
    if (falsePositiveRate > 50) {
      notifications.push({
        id: `fp-rate-${Date.now()}`,
        type: "INFO",
        title: "📊 Alta Taxa de Falsos Positivos",
        message: `${falsePositiveRate.toFixed(1)}% das vulnerabilidades foram classificadas como falsos positivos. Considere revisar os critérios do scanner.`,
        timestamp: Date.now(),
        read: false,
      });
    }

    // Notificação para muitas vulnerabilidades de alta severidade
    if (result.high > 10) {
      notifications.push({
        id: `high-count-${Date.now()}`,
        type: "HIGH",
        title: "🔴 Múltiplas Vulnerabilidades de Alta Severidade",
        message: `${result.high} vulnerabilidade(s) de alta severidade encontrada(s).`,
        timestamp: Date.now(),
        read: false,
      });
    }

    return notifications;
  }

  /**
   * Salva notificações
   */
  saveNotifications(notifications: Notification[]): void {
    if (typeof window === "undefined") return;

    try {
      const existing = this.getNotifications();
      const combined = [...notifications, ...existing];
      
      // Mantém apenas as últimas 50 notificações
      if (combined.length > 50) {
        combined.splice(50);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(combined));
      
      // Dispara evento para atualizar UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notifications-updated"));
      }
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  }

  /**
   * Obtém todas as notificações
   */
  getNotifications(): Notification[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading notifications:", error);
      return [];
    }
  }

  /**
   * Obtém notificações não lidas
   */
  getUnreadNotifications(): Notification[] {
    return this.getNotifications().filter((n) => !n.read);
  }

  /**
   * Marca notificação como lida
   */
  markAsRead(id: string): void {
    const notifications = this.getNotifications();
    const notification = notifications.find((n) => n.id === id);
    
    if (notification) {
      notification.read = true;
      this.saveNotifications([]); // Limpa e salva novamente
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    }
  }

  /**
   * Marca todas como lidas
   */
  markAllAsRead(): void {
    const notifications = this.getNotifications();
    notifications.forEach((n) => (n.read = true));
    localStorage.setItem(this.storageKey, JSON.stringify(notifications));
  }

  /**
   * Remove notificação
   */
  removeNotification(id: string): void {
    const notifications = this.getNotifications().filter((n) => n.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(notifications));
  }

  /**
   * Limpa todas as notificações
   */
  clearNotifications(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Mostra notificação no navegador (se permitido)
   */
  async showBrowserNotification(title: string, message: string): Promise<void> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/favicon.ico",
      });
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(title, {
          body: message,
          icon: "/favicon.ico",
        });
      }
    }
  }
}

export const notificationService = new NotificationService();

