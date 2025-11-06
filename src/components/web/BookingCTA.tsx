import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useFeatureFlag } from "@/hooks/useParameter";
import { useParameterValue } from "@/hooks/useParameter";

interface BookingCTAProps {
    children?: React.ReactNode;
    className?: string;
    customText?: string;
    destination?: "services" | "custom";
    customLink?: string;
}

/**
 * BookingCTA Component
 * Smart CTA button that respects the booking_enabled feature flag
 * and uses dynamic CTA text from parameter system
 */
export const BookingCTA: React.FC<BookingCTAProps> = ({
    children,
    className = "",
    customText,
    destination = "services",
    customLink,
}) => {
    const location = useLocation();
    const isBookingEnabled = useFeatureFlag("booking_enabled");
    const ctaText = useParameterValue<string>("content.cta_primary_text", "BOOK NOW");

    // Generate booking link based on current path (handle /meta routes)
    const generateBookLink = (): string => {
        if (customLink) return customLink;

        const parts = location.pathname.split("/");
        const basePath = parts[1] === "meta" ? "/meta" : "";

        return `${basePath}/book/${destination}`;
    };

    const bookLink = generateBookLink();
    const displayText = customText || ctaText;
    const content = children || displayText;

    // If booking is disabled, show disabled state
    if (!isBookingEnabled) {
        return (
            <div className={`${className} opacity-50 cursor-not-allowed`} title="Booking temporarily unavailable">
                <div className="flex items-center justify-center w-full h-full">
                    {typeof content === "string" ? <span className="text-center">Booking Unavailable</span> : content}
                </div>
            </div>
        );
    }

    // If booking is enabled, show active link
    return (
        <Link to={bookLink} className={`${className} flex items-center justify-center w-full h-full`}>
            {content}
        </Link>
    );
};

export default BookingCTA;
