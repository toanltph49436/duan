import React, { useState, useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    const [isShowing, setIsShowing] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsShowing(true);
            const timer = setTimeout(() => {
                setIsShowing(false);
                setTimeout(onClose, 300); // Đợi animation kết thúc
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const getToastStyles = () => {
        const baseStyles = "fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out";
        
        switch (type) {
            case 'success':
                return `${baseStyles} bg-green-500 text-white`;
            case 'error':
                return `${baseStyles} bg-red-500 text-white`;
            case 'info':
                return `${baseStyles} bg-blue-500 text-white`;
            default:
                return `${baseStyles} bg-gray-500 text-white`;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'info':
                return 'ℹ️';
            default:
                return '💬';
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`${getToastStyles()} ${isShowing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-80">
                <span className="text-lg">{getIcon()}</span>
                <span className="flex-1 text-sm font-medium">{message}</span>
                <button
                    onClick={() => {
                        setIsShowing(false);
                        setTimeout(onClose, 300);
                    }}
                    className="text-white hover:text-gray-200 transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default Toast; 