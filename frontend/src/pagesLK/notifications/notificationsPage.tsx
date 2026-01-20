import { useState, useEffect } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { Button, Loader, Group, Badge, Text } from "@mantine/core";
import styles from "./notificationsPage.module.css";

interface Notification {
    id: number;
    type: string;
    type_display: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    booking_id?: number;
    extra_data?: any;
}

export function NotificationsPage() {
    const isMobile = useMediaQuery('(max-width: 48em)');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch('/api/auth/notifications/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unread_count || 0);
                }
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(notificationId: number) {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/auth/notifications/read/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notification_id: notificationId }),
            });

            if (response.ok) {
                // Обновляем локальное состояние
                setNotifications(prev => 
                    prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async function markAllAsRead() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/auth/notifications/read-all/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Обновляем локальное состояние
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    function formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) {
                return 'только что';
            } else if (diffMins < 60) {
                return `${diffMins} ${diffMins === 1 ? 'минуту' : diffMins < 5 ? 'минуты' : 'минут'} назад`;
            } else if (diffHours < 24) {
                return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`;
            } else if (diffDays < 7) {
                return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`;
            } else {
                return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
        } catch {
            return dateString;
        }
    }

    const notificationsList = notifications.length > 0 ? notifications.map((notification) => (
        <div
            key={notification.id}
            className={`${styles.notificationItem} ${!notification.is_read ? styles.unread : ''}`}
            onClick={() => !notification.is_read && markAsRead(notification.id)}
            style={{ cursor: !notification.is_read ? 'pointer' : 'default' }}
        >
            <div className={styles.notificationContent}>
                <Group justify="space-between" align="flex-start" mb="xs">
                    <div style={{ flex: 1 }}>
                        <Group gap="xs" mb={4}>
                            <Text fw={600} size="md">{notification.title}</Text>
                            {!notification.is_read && (
                                <Badge size="sm" color="sberGreenColor.9" variant="filled">Новое</Badge>
                            )}
                        </Group>
                        <Text size="sm" c="dimmed" mb="xs">
                            {formatDate(notification.created_at)}
                        </Text>
                    </div>
                </Group>
                <Text size="sm" style={{ lineHeight: 1.6 }}>
                    {notification.message}
                </Text>
            </div>
        </div>
    )) : (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--mantine-color-grayColor-6)" }}>
            {loading ? "Загрузка..." : "Нет уведомлений. Как только появятся события (бронирования, изменения), они будут отображаться здесь."}
        </div>
    );

    return (
        <div className="paperdivLK">
            <div className="papercardLK">
                <div className="paperHeaderLK" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 className="HeadingTitle">Уведомления</h3>
                        {unreadCount > 0 && (
                            <Badge size="lg" color="sberGreenColor.9" variant="filled" mt="xs">
                                Непрочитанных: {unreadCount}
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            size="compact-md"
                            variant="outline"
                            color="sberGreenColor.9"
                            onClick={markAllAsRead}
                        >
                            Отметить все как прочитанные
                        </Button>
                    )}
                </div>
                <div className="papercard" style={{ paddingTop: "0px" }}>
                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center" }}>
                            <Loader size="md" />
                        </div>
                    ) : (
                        <div className={styles.notificationsList}>
                            {notificationsList}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
