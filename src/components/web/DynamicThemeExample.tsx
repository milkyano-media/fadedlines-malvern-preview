import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFeatureFlag, useParameterValue, useParametersByCategory } from "@/hooks/useParameter";
import { ParameterCategory } from "@/interfaces/ParameterInterface";
import { Layout, Palette, Zap } from "lucide-react";

/**
 * DynamicThemeExample Component
 *
 * This component demonstrates how to use the parameter system
 * to dynamically control website appearance and behavior.
 *
 * It showcases three different ways to consume parameters:
 * 1. useParameterValue - for single parameter values
 * 2. useParametersByCategory - for all parameters in a category
 * 3. useFeatureFlag - for feature flags
 */
export default function DynamicThemeExample() {
    // Method 1: Get individual parameter values with defaults
    const primaryColor = useParameterValue<string>("theme.primary_color", "#ffffff");
    const companyName = useParameterValue<string>("branding.company_name", "Milkyano Barber");
    const heroTitle = useParameterValue<string>("content.homepage_hero_title", "Book Your Perfect Cut");

    // Method 2: Get all parameters from a category
    const { values: themeParams, loading: themeLoading } = useParametersByCategory(ParameterCategory.THEME);
    const { values: brandingParams, loading: brandingLoading } = useParametersByCategory(ParameterCategory.BRANDING);

    // Method 3: Use feature flags to conditionally render features
    const isBookingEnabled = useFeatureFlag("booking_enabled", true);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header with dynamic branding */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold" style={{ color: primaryColor }}>
                        {companyName}
                    </h1>
                    <p className="text-2xl text-gray-400">{heroTitle}</p>
                </div>

                {/* Feature Flags Demo */}
                <Card className="bg-[#0a0a0a] border-stone-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5" style={{ color: primaryColor }} />
                            <CardTitle>Feature Flags</CardTitle>
                        </div>
                        <CardDescription>Dynamically control which features are enabled</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg border border-stone-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold">Booking System</span>
                                    <Badge
                                        variant={isBookingEnabled ? "default" : "secondary"}
                                        className={
                                            isBookingEnabled ? "bg-green-500/10 text-green-500" : "bg-gray-500/10"
                                        }
                                    >
                                        {isBookingEnabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-400">
                                    {isBookingEnabled
                                        ? "Users can book appointments online"
                                        : "Online booking is currently disabled"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Theme Parameters Demo */}
                <Card className="bg-[#0a0a0a] border-stone-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5" style={{ color: primaryColor }} />
                            <CardTitle>Theme Configuration</CardTitle>
                        </div>
                        <CardDescription>All theme parameters loaded from the parameter system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {themeLoading ? (
                            <div className="text-gray-400">Loading theme parameters...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(themeParams).map(([key, value]) => (
                                    <div key={key} className="p-4 rounded-lg border border-stone-800">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm text-gray-400">{key}</span>
                                            {key.includes("color") ? (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 rounded border border-stone-700"
                                                        style={{ backgroundColor: String(value) }}
                                                    />
                                                    <span className="font-mono text-sm">{String(value)}</span>
                                                </div>
                                            ) : (
                                                <span className="font-semibold">{String(value)}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Branding Parameters Demo */}
                <Card className="bg-[#0a0a0a] border-stone-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Layout className="w-5 h-5" style={{ color: primaryColor }} />
                            <CardTitle>Branding Configuration</CardTitle>
                        </div>
                        <CardDescription>All branding parameters loaded from the parameter system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {brandingLoading ? (
                            <div className="text-gray-400">Loading branding parameters...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(brandingParams).map(([key, value]) => (
                                    <div key={key} className="p-4 rounded-lg border border-stone-800">
                                        <div className="flex flex-col gap-2">
                                            <span className="font-mono text-sm text-gray-400">{key}</span>
                                            {key.includes("url") && typeof value === "string" ? (
                                                <a
                                                    href={value}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 truncate"
                                                >
                                                    {value}
                                                </a>
                                            ) : (
                                                <span className="font-semibold">{String(value)}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Usage Instructions */}
                <Card className="bg-[#0a0a0a] border-stone-800">
                    <CardHeader>
                        <CardTitle>How to Use Parameters</CardTitle>
                        <CardDescription>
                            Three simple ways to integrate dynamic parameters in your components
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold" style={{ color: primaryColor }}>
                                1. Single Parameter Value
                            </h3>
                            <code className="block p-3 rounded-lg bg-stone-900 text-sm font-mono text-gray-300">
                                const primaryColor = useParameterValue&lt;string&gt;('theme.primary_color', '#ffffff');
                            </code>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold" style={{ color: primaryColor }}>
                                2. All Parameters by Category
                            </h3>
                            <code className="block p-3 rounded-lg bg-stone-900 text-sm font-mono text-gray-300">
                                const {"{values, loading}"} = useParametersByCategory(ParameterCategory.THEME);
                            </code>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold" style={{ color: primaryColor }}>
                                3. Feature Flags
                            </h3>
                            <code className="block p-3 rounded-lg bg-stone-900 text-sm font-mono text-gray-300">
                                const isBookingEnabled = useFeatureFlag('booking_enabled');
                            </code>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
