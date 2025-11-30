import React from 'react';
import { ModeToggle } from './ModeToggle';

interface ChatToolbarProps {
    mode: 'normal' | 'simplified';
    onModeChange: (mode: 'normal' | 'simplified') => void;
    children?: React.ReactNode;
}

export const ChatToolbar: React.FC<ChatToolbarProps> = ({ mode, onModeChange, children }) => {
    return (
        <div className="flex items-center justify-between p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <ModeToggle mode={mode} onChange={onModeChange} />
            <div className="flex items-center space-x-2">
                {children}
            </div>
        </div>
    );
};
