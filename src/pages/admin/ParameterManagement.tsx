import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Parameter, ParameterCategory, ParameterType, UpdateParameterRequest } from "@/interfaces/ParameterInterface";
import {
    getAllCategories,
    getAllParameters,
    getParametersByCategory,
    toggleParameterStatus,
    updateParameter
} from "@/utils/parameterApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Edit, RefreshCw, Search, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

export default function ParameterManagement() {
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<ParameterCategory | "all">("all");
    const [parameterCategories, setParameterCategories] = useState<[ParameterCategory]>();
    const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);
    const [togglePendingParameter, setTogglePendingParameter] = useState<{ id: string; currentStatus: boolean } | null>(
        null
    );
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

    // Fetch parameters on mount
    useEffect(() => {
        fetchParameters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCategory]);

    const fetchCategory = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getAllCategories();
            setParameterCategories(response.data);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch parameter categories",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCategory();
    }, [fetchCategory]);

    const fetchParameters = async () => {
        try {
            setIsLoading(true);
            const response =
                filterCategory === "all"
                    ? await getAllParameters()
                    : await getParametersByCategory(filterCategory as ParameterCategory);
            setParameters(response.parameters);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch parameters",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: ParameterFormData) => {
        try {
            setIsLoading(true);

            // Parse value based on type
            let parsedValue: string | number | boolean | object = data.value;
            if (data.type === ParameterType.NUMBER) {
                parsedValue = parseFloat(data.value);
            } else if (data.type === ParameterType.BOOLEAN) {
                parsedValue = data.value === "true" || data.value === "1";
            } else if (data.type === ParameterType.JSON) {
                parsedValue = JSON.parse(data.value);
            }

            const requestData: UpdateParameterRequest = {
                key: data.key,
                value: parsedValue,
                description: data.description,
                isActive: data.isActive,
            };

            await updateParameter(editingParameter!.id, requestData);
            toast({
                title: "Success",
                description: "Parameter updated successfully",
            });

            setIsDialogOpen(false);
            form.reset();
            setEditingParameter(null);
            fetchParameters();
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

    const handleEdit = (parameter: Parameter) => {
        setEditingParameter(parameter);
        console.log(`parameter.type: ${parameter.type}`);
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
        setIsDialogOpen(true);
    };

    const handleToggleClick = (parameterId: string, currentStatus: boolean) => {
        setTogglePendingParameter({ id: parameterId, currentStatus });
        setIsToggleConfirmOpen(true);
    };

    const confirmToggle = async () => {
        if (!togglePendingParameter) return;

        try {
            await toggleParameterStatus(togglePendingParameter.id, !togglePendingParameter.currentStatus);
            toast({
                title: "Success",
                description: "Parameter status updated successfully",
            });
            fetchParameters();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update status",
                variant: "destructive",
            });
        } finally {
            setIsToggleConfirmOpen(false);
            setTogglePendingParameter(null);
        }
    };

    const handleToggleConfirmClose = () => {
        setIsToggleConfirmOpen(false);
        setTogglePendingParameter(null);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingParameter(null);
        form.reset();
    };

    const filteredParameters = parameters.filter(
        (param) =>
            param.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            param.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryColor = (category: ParameterCategory) => {
        const colors: Record<ParameterCategory, string> = {
            [ParameterCategory.THEME]: "bg-purple-500/10 text-purple-500",
            [ParameterCategory.CONTENT]: "bg-yellow-500/10 text-yellow-500",
            [ParameterCategory.FEATURE_FLAG]: "bg-red-500/10 text-red-500",
            [ParameterCategory.BRANDING]: "bg-orange-500/10 text-orange-500",
            [ParameterCategory.CONTACT]: "bg-amber-500/10 text-amber-500",
        };
        return colors[category] || "bg-gray-500/10 text-gray-500";
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        <div>
                            <h1 className="text-3xl font-bold">Parameter Management</h1>
                            <p className="text-gray-400">Manage dynamic website appearance and behavior</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={fetchParameters}
                            className="border-theme-border hover:bg-theme-card"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                            <DialogContent className="bg-theme-card border-theme-border text-white max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingParameter ? "Edit Parameter" : "Create New Parameter"}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingParameter
                                            ? "Update the parameter details below"
                                            : "Add a new parameter to control website appearance"}
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit, (errors) => {
                                            console.error("Form validation failed:", errors);
                                        })}
                                        className="space-y-4"
                                    >
                                        {/* Debug: Show form errors */}
                                        {Object.keys(form.formState.errors).length > 0 && (
                                            <div className="bg-red-900/20 border border-red-500 rounded p-3 text-sm">
                                                <p className="font-semibold text-red-400 mb-1">
                                                    Form Validation Errors:
                                                </p>
                                                <ul className="list-disc list-inside text-red-300">
                                                    {Object.entries(form.formState.errors).map(([field, error]) => (
                                                        <li key={field}>
                                                            {field}: {error?.message?.toString()}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
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
                                        <FormField
                                            control={form.control}
                                            name="value"
                                            render={({ field }) => {
                                                const paramType = form.watch("type");

                                                // Color Picker for COLOR type
                                                if (paramType === "COLOR") {
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
                                                            <FormDescription>
                                                                Select color or enter hex value
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    );
                                                }

                                                // File Upload for BASE64 type
                                                if (paramType === "BASE64") {
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
                                                                                    field.onChange(
                                                                                        reader.result as string
                                                                                    );
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
                                                                                <p className="text-xs text-gray-400 mb-2">
                                                                                    Preview:
                                                                                </p>
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
                                                if (paramType === "JSON") {
                                                    const [jsonError, setJsonError] = useState<string | null>(null);

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
                                                                                    err instanceof Error
                                                                                        ? err.message
                                                                                        : "Invalid JSON"
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
                                                                    {!jsonError &&
                                                                        field.value &&
                                                                        field.value.trim() && (
                                                                            <p className="text-sm text-green-500 flex items-center gap-1">
                                                                                <CheckCircle className="w-4 h-4" />
                                                                                Valid JSON
                                                                            </p>
                                                                        )}
                                                                </div>
                                                            </FormControl>
                                                            <FormDescription>
                                                                Enter valid JSON object (e.g., business hours)
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    );
                                                }

                                                // URL Input with real-time validation
                                                if (paramType === "URL") {
                                                    const [urlError, setUrlError] = useState<string | null>(null);

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
                                                            <FormDescription>
                                                                Enter complete URL with protocol (https://...)
                                                            </FormDescription>
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
                                                        <FormDescription>
                                                            Enter value according to the selected type
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />
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
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleDialogClose}
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
                    </div>
                </div>

                {/* Filters */}
                <Card className="bg-theme-card border-theme-border">
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search parameters..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-theme-card border-theme-border"
                                />
                            </div>
                            <Select
                                value={filterCategory}
                                onValueChange={(value: string) => setFilterCategory(value as ParameterCategory | "all")}
                            >
                                <SelectTrigger className="w-48 bg-theme-card border-theme-border">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent className="bg-theme-card border-theme-border">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {parameterCategories?.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Parameters Table */}
                <Card className="bg-theme-card border-theme-border">
                    <CardHeader>
                        <CardTitle>Parameters ({filteredParameters.length})</CardTitle>
                        <CardDescription>Manage all parameters that control your website's appearance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-400">Loading parameters...</div>
                        ) : filteredParameters.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                No parameters found. Create one to get started.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-theme-border hover:bg-theme-card/50">
                                        <TableHead>Key</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredParameters.map((parameter) => (
                                        <TableRow
                                            key={parameter.id}
                                            className="border-theme-border hover:bg-theme-card/50"
                                        >
                                            <TableCell className="font-mono text-sm">
                                                {parameter.key}
                                                {parameter.description && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {parameter.description}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {typeof parameter.value === "object"
                                                    ? JSON.stringify(parameter.value)
                                                    : String(parameter.value)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-stone-700">
                                                    {parameter.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getCategoryColor(parameter.category)}>
                                                    {parameter.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={parameter.isActive}
                                                    onCheckedChange={() =>
                                                        handleToggleClick(parameter.id, parameter.isActive)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(parameter)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Toggle Confirmation Dialog */}
                <Dialog open={isToggleConfirmOpen} onOpenChange={handleToggleConfirmClose}>
                    <DialogContent className="bg-theme-card border-theme-border text-white">
                        <DialogHeader>
                            <DialogTitle>Confirm Parameter Status Change</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to change the status of this parameter?
                            </DialogDescription>
                        </DialogHeader>
                        {togglePendingParameter && (
                            <div className="space-y-3 py-4">
                                <div className="rounded-lg bg-theme-card border border-theme-border p-4">
                                    <p className="text-sm text-gray-400 mb-1">Parameter</p>
                                    <p className="font-mono text-sm">
                                        {parameters.find((p) => p.id === togglePendingParameter.id)?.key}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-theme-card border border-theme-border p-4">
                                    <p className="text-sm text-gray-400 mb-1">Status Change</p>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={togglePendingParameter.currentStatus ? "default" : "secondary"}>
                                            {togglePendingParameter.currentStatus ? "Active" : "Inactive"}
                                        </Badge>
                                        <span className="text-gray-400">→</span>
                                        <Badge
                                            variant={!togglePendingParameter.currentStatus ? "default" : "secondary"}
                                        >
                                            {!togglePendingParameter.currentStatus ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-yellow-900/20 border border-yellow-500/50 p-4">
                                    <p className="text-sm text-yellow-200">
                                        ⚠️ This will {togglePendingParameter.currentStatus ? "disable" : "enable"} this
                                        parameter on the live website immediately.
                                    </p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleToggleConfirmClose}
                                className="border-theme-border"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmToggle}
                                className="bg-white text-black hover:bg-gray-200"
                            >
                                Confirm Change
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
