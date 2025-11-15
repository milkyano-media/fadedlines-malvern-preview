import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Parameter, ParameterType, UpdateParameterRequest } from "@/interfaces/ParameterInterface";
import { updateParameter } from "@/utils/parameterApi";
import { parseParameterValue } from "@/utils/parameterUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ParameterValueField } from "./ParameterValueField";

// Validation schema for parameter form
const parameterSchema = z.object({
    key: z
        .string()
        .min(1, "Key is required")
        .regex(/^[a-z0-9_.]+$/, "Key must contain only lowercase letters, numbers, dots, and underscores"),
    value: z.string().min(1, "Value is required"),
    type: z.nativeEnum(ParameterType),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
});

type ParameterFormData = z.infer<typeof parameterSchema>;

interface EditParameterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    parameter: Parameter | null;
    onSuccess: () => void;
}

/**
 * Edit Parameter Dialog Component
 * Modal form for editing parameter values and settings
 */
export function EditParameterDialog({ isOpen, onClose, parameter, onSuccess }: EditParameterDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<ParameterFormData>({
        resolver: zodResolver(parameterSchema),
        defaultValues: {
            key: "",
            value: "",
            type: ParameterType.STRING,
            description: "",
            isActive: true,
        },
    });

    // Reset form when parameter changes
    useEffect(() => {
        if (parameter) {
            form.reset({
                key: parameter.key,
                value:
                    typeof parameter.value === "object"
                        ? JSON.stringify(parameter.value, null, 2)
                        : String(parameter.value),
                type: parameter.type,
                description: parameter.description || "",
                isActive: parameter.isActive,
            });
        }
    }, [parameter, form]);

    const onSubmit = async (data: ParameterFormData) => {
        if (!parameter) return;

        try {
            setIsLoading(true);

            // Parse value based on type
            const parsedValue = parseParameterValue(data.value, data.type);

            const requestData: UpdateParameterRequest = {
                key: data.key,
                value: parsedValue,
                description: data.description,
                isActive: data.isActive,
            };

            await updateParameter(parameter.id, requestData);
            toast({
                title: "Success",
                description: "Parameter updated successfully",
            });

            onClose();
            form.reset();
            onSuccess();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save parameter",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        form.reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-theme-card border-theme-border text-white max-w-2xl max-h-[85vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-theme-border flex-shrink-0">
                    <DialogTitle>{parameter ? "Edit Parameter" : "Create New Parameter"}</DialogTitle>
                    <DialogDescription>
                        {parameter
                            ? "Update the parameter details below"
                            : "Add a new parameter to control website appearance"}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, (errors) => {
                            console.error("Form validation failed:", errors);
                        })}
                        className="flex flex-col flex-1 min-h-0"
                    >
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                            {/* Debug: Show form errors */}
                            {Object.keys(form.formState.errors).length > 0 && (
                                <div className="bg-red-900/20 border border-red-500 rounded p-3 text-sm">
                                    <p className="font-semibold text-red-400 mb-1">Form Validation Errors:</p>
                                    <ul className="list-disc list-inside text-red-300">
                                        {Object.entries(form.formState.errors).map(([field, error]) => (
                                            <li key={field}>
                                                {field}: {error?.message?.toString()}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Key Field (Read-only) */}
                            <FormField
                                control={form.control}
                                name="key"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Key</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g., theme.primary_color"
                                                className="bg-theme-card border-theme-border cursor-not-allowed opacity-60"
                                                readOnly
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Unique identifier (lowercase, dots, underscores only)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Type Field (Read-only) */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="bg-theme-card border-theme-border cursor-not-allowed opacity-60"
                                                readOnly
                                            />
                                        </FormControl>
                                        <FormDescription>Data type of the parameter</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Value Field (Type-specific) */}
                            <ParameterValueField control={form.control} paramType={form.watch("type")} />

                            {/* Description Field */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Describe this parameter"
                                                className="bg-theme-card border-theme-border"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Active Toggle */}
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border border-theme-border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Active</FormLabel>
                                            <FormDescription>
                                                Enable this parameter for use on the website
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Footer with buttons */}
                        <DialogFooter className="px-6 py-4 border-t border-theme-border flex-shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="border-theme-border"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-white text-black hover:bg-gray-200"
                            >
                                {isLoading ? "Saving..." : "Update"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
