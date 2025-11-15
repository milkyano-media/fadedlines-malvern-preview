import { useState } from "react";
import { Control } from "react-hook-form";
import { AlertCircle, CheckCircle } from "lucide-react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ParameterType } from "@/interfaces/ParameterInterface";

interface ParameterFormData {
    key: string;
    value: string;
    type: ParameterType;
    description?: string;
    isActive: boolean;
}

interface ParameterValueFieldProps {
    control: Control<ParameterFormData>;
    paramType: ParameterType;
}

/**
 * Parameter Value Field Component
 * Handles type-specific input rendering for parameter values
 *
 * This component fixes the useState hook violations by moving the
 * jsonError and urlError state to the component level instead of
 * inside the FormField render callback
 */
export function ParameterValueField({ control, paramType }: ParameterValueFieldProps) {
    // Move useState to component level (fixes hook violations)
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [urlError, setUrlError] = useState<string | null>(null);

    return (
        <FormField
            control={control}
            name="value"
            render={({ field }) => {
                // Color Picker for COLOR type
                if (paramType === ParameterType.COLOR) {
                    return (
                        <FormItem>
                            <FormLabel>Value (Color)</FormLabel>
                            <FormControl>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={field.value || "#000000"}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className="h-10 w-20 rounded border border-theme-border bg-theme-card cursor-pointer"
                                    />
                                    <Input
                                        {...field}
                                        placeholder="var(--primary-color)"
                                        className="bg-theme-card border-theme-border flex-1"
                                    />
                                </div>
                            </FormControl>
                            <FormDescription>Select color or enter hex value</FormDescription>
                            <FormMessage />
                        </FormItem>
                    );
                }

                // File Upload for BASE64 type
                if (paramType === ParameterType.BASE64) {
                    return (
                        <FormItem>
                            <FormLabel>Value (Image)</FormLabel>
                            <FormControl>
                                <div className="space-y-3">
                                    <Input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    field.onChange(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="bg-theme-card border-theme-border"
                                    />
                                    {field.value &&
                                        typeof field.value === "string" &&
                                        field.value.startsWith("data:image/") && (
                                            <div className="rounded-lg border border-theme-border p-3 bg-theme-card">
                                                <p className="text-xs text-gray-400 mb-2">Preview:</p>
                                                <img
                                                    src={field.value}
                                                    alt="Preview"
                                                    className="max-w-full h-auto max-h-48 rounded"
                                                />
                                            </div>
                                        )}
                                </div>
                            </FormControl>
                            <FormDescription>
                                Upload PNG, JPG, or JPEG image (converted to base64)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    );
                }

                // JSON Editor with real-time validation
                if (paramType === ParameterType.JSON) {
                    return (
                        <FormItem>
                            <FormLabel>Value (JSON)</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <Textarea
                                        {...field}
                                        placeholder='{"key": "value"}'
                                        className="bg-theme-card border-theme-border min-h-[120px] font-mono text-sm"
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                            // Real-time validation
                                            try {
                                                if (e.target.value.trim()) {
                                                    JSON.parse(e.target.value);
                                                    setJsonError(null);
                                                } else {
                                                    setJsonError(null);
                                                }
                                            } catch (err) {
                                                setJsonError(
                                                    err instanceof Error ? err.message : "Invalid JSON"
                                                );
                                            }
                                        }}
                                    />
                                    {jsonError && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {jsonError}
                                        </p>
                                    )}
                                    {!jsonError && field.value && field.value.trim() && (
                                        <p className="text-sm text-green-500 flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            Valid JSON
                                        </p>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>Enter valid JSON object (e.g., business hours)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    );
                }

                // URL Input with real-time validation
                if (paramType === ParameterType.URL) {
                    return (
                        <FormItem>
                            <FormLabel>Value (URL)</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <Input
                                        {...field}
                                        type="url"
                                        placeholder="https://example.com"
                                        className="bg-theme-card border-theme-border"
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                            // Real-time validation
                                            try {
                                                if (e.target.value.trim()) {
                                                    new URL(e.target.value);
                                                    setUrlError(null);
                                                } else {
                                                    setUrlError(null);
                                                }
                                            } catch {
                                                setUrlError(
                                                    "Invalid URL format (must include https:// or http://)"
                                                );
                                            }
                                        }}
                                    />
                                    {urlError && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {urlError}
                                        </p>
                                    )}
                                    {!urlError && field.value && field.value.trim() && (
                                        <p className="text-sm text-green-500 flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            Valid URL
                                        </p>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>Enter complete URL with protocol (https://...)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    );
                }

                // Textarea for all other types
                return (
                    <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Enter value"
                                className="bg-theme-card border-theme-border min-h-[80px]"
                            />
                        </FormControl>
                        <FormDescription>Enter value according to the selected type</FormDescription>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
