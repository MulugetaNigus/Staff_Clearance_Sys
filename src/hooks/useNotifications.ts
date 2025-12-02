import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { toastUtils } from '../utils/toastUtils';

interface Notification {
    _id: string;
    type: string;
    message: string;
    relatedRequest?: any;
    relatedStep?: any;
    read: boolean;
    createdAt: string;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getMyNotifications();
            if (response.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            // Update local state
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toastUtils.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toastUtils.success('All notifications marked as read');
        } catch (error) {
            toastUtils.error('Failed to mark all as read');
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Poll every 5 seconds for new notifications
        const interval = setInterval(fetchNotifications, 5000);

        return () => clearInterval(interval);
    }, []);

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
    };
};
