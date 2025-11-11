import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useFeatureFlag, useParameterValue } from "@/hooks/useParameter";

/**
 * PromotionalBanner Component
 * Displays promotional messages at the top of the page
 * Controlled by feature flag and dismissible by users
 */
export const PromotionalBanner: React.FC = () => {
    const isEnabled = useFeatureFlag("promotional_banner_enabled", false);
    const promotionalMessage = useParameterValue<string>("content.promotional_message", "");
    const [isDismissed, setIsDismissed] = useState(false);

    // Check localStorage for dismissed state on mount
    useEffect(() => {
        const dismissed = localStorage.getItem("promotional_banner_dismissed");
        const dismissedMessage = localStorage.getItem("promotional_banner_message");

        // If the message has changed, show the banner again
        if (dismissed === "true" && dismissedMessage === promotionalMessage) {
            setIsDismissed(true);
        } else if (dismissedMessage !== promotionalMessage) {
            // New message, clear dismissed state
            localStorage.removeItem("promotional_banner_dismissed");
            setIsDismissed(false);
        }
    }, [promotionalMessage]);

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem("promotional_banner_dismissed", "true");
        localStorage.setItem("promotional_banner_message", promotionalMessage);
    };

    // Don't render if disabled, no message, or dismissed
    if (!isEnabled || !promotionalMessage || promotionalMessage.trim() === "" || isDismissed) {
        return null;
    }

    return (
        <div className="w-full bg-[var(--primary-color)] text-black py-3 px-4 relative z-50">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex-1 text-center">
                    <p className="text-sm md:text-base font-medium">{promotionalMessage}</p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 hover:opacity-70 transition-opacity p-1"
                    aria-label="Dismiss promotional banner"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default PromotionalBanner;
