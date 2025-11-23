import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Calculate position to center above the element
            // We'll adjust this in a real scenario if we had the tooltip ref too, 
            // but for now let's center it and put it above.
            // To do it perfectly we need the tooltip dimensions, so let's render it first.

            setPosition({
                top: rect.top - 10, // 10px spacing above
                left: rect.left + rect.width / 2
            });
        }
    }, [isVisible]);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            ref={triggerRef}
        >
            {children}
            {isVisible && createPortal(
                <div
                    className="fixed z-[9999] px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full max-w-xs w-max"
                    style={{
                        top: position.top,
                        left: position.left
                    }}
                >
                    {content}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>,
                document.body
            )}
        </div>
    );
};
