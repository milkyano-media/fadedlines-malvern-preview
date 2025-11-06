import React from "react";
import { AlertCircle } from "lucide-react";
import { useParameterValue } from "@/hooks/useParameter";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * EmergencyAlert Component
 * Displays critical emergency messages prominently
 * Non-dismissible and always visible when message is set
 */
export const EmergencyAlert: React.FC = () => {
    const emergencyMessage = useParameterValue<string>("content.emergency_message", "");

    // Don't render if no emergency message
    if (!emergencyMessage || emergencyMessage.trim() === "") {
        return null;
    }

    return (
        <div className="w-full bg-red-600 border-red-700 border-b-2">
            <div className="container mx-auto px-4 py-3">
                <Alert className="border-none bg-transparent text-white">
                    <AlertCircle className="h-5 w-5 text-white" />
                    <AlertDescription className="ml-2 text-sm md:text-base font-medium">
                        {emergencyMessage}
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
};

export default EmergencyAlert;
