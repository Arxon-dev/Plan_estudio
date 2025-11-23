import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import {
    XMarkIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    MegaphoneIcon
} from '@heroicons/react/24/outline';

interface Announcement {
    id: number;
    content: string;
    type: 'info' | 'warning' | 'success' | 'error';
    link?: string;
}

export const GlobalAnnouncementBanner: React.FC = () => {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const response = await apiClient.get('/announcements/active');
                if (response.data) {
                    // Check if this specific announcement was closed by the user in this session
                    const closedId = sessionStorage.getItem('closedAnnouncementId');
                    if (closedId !== String(response.data.id)) {
                        setAnnouncement(response.data);
                        setIsVisible(true);
                    }
                }
            } catch (error: any) {
                // Ignorar errores 503 (mantenimiento) para no ensuciar la consola
                if (error.response?.status !== 503) {
                    console.error('Error fetching announcement:', error);
                }
            }
        };

        fetchAnnouncement();
    }, []);

    const handleClose = () => {
        if (announcement) {
            sessionStorage.setItem('closedAnnouncementId', String(announcement.id));
            setIsVisible(false);
        }
    };

    if (!isVisible || !announcement) return null;

    const getStyles = (type: string) => {
        switch (type) {
            case 'info':
                return { bg: 'bg-blue-600', icon: <InformationCircleIcon className="h-5 w-5" /> };
            case 'warning':
                return { bg: 'bg-yellow-500', icon: <ExclamationTriangleIcon className="h-5 w-5" /> };
            case 'success':
                return { bg: 'bg-green-600', icon: <CheckCircleIcon className="h-5 w-5" /> };
            case 'error':
                return { bg: 'bg-red-600', icon: <XCircleIcon className="h-5 w-5" /> };
            default:
                return { bg: 'bg-blue-600', icon: <MegaphoneIcon className="h-5 w-5" /> };
        }
    };

    const styles = getStyles(announcement.type);

    return (
        <div className={`${styles.bg} text-white px-4 py-3 shadow-md relative z-40 animate-slide-down`}>
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <span className="flex-shrink-0 opacity-90">
                        {styles.icon}
                    </span>
                    <div className="text-sm font-medium flex-1">
                        {announcement.content}
                        {announcement.link && (
                            <a
                                href={announcement.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 underline opacity-90 hover:opacity-100"
                            >
                                Más info &rarr;
                            </a>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity p-1"
                    aria-label="Cerrar aviso"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};
