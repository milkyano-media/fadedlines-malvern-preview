import { EditParameterDialog } from "@/components/admin/parameter-form/EditParameterDialog";
import { ToggleConfirmDialog } from "@/components/admin/parameter-form/ToggleConfirmDialog";
import { CategorySelector } from "@/components/admin/parameter-list/CategorySelector";
import { ParameterList } from "@/components/admin/parameter-list/ParameterList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Parameter, ParameterCategory } from "@/interfaces/ParameterInterface";
import {
    getAllCategories,
    getAllParameters,
    getParametersByCategory,
    toggleParameterStatus,
} from "@/utils/parameterApi";
import { RefreshCw, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ParameterManagement() {
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<ParameterCategory | "all">("all");
    const [parameterCategories, setParameterCategories] = useState<ParameterCategory[]>([]);
    const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);
    const [togglePendingParameter, setTogglePendingParameter] = useState<{ id: string; currentStatus: boolean } | null>(
        null
    );
    const { toast } = useToast();

    const fetchParameters = useCallback(async () => {
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
    }, [toast, filterCategory]);

    useEffect(() => {
        fetchParameters();
    }, [fetchParameters]);

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

    const handleEdit = (parameter: Parameter) => {
        setEditingParameter(parameter);
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
    };

    const filteredParameters = parameters.filter(
        (param) =>
            param.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            param.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <Button
                        variant="outline"
                        onClick={fetchParameters}
                        className="border-theme-border hover:bg-theme-card"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    <CategorySelector
                        categories={parameterCategories}
                        selectedCategory={filterCategory}
                        onSelectCategory={setFilterCategory}
                    />

                    <ParameterList
                        parameters={filteredParameters}
                        isLoading={isLoading}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        filterCategory={filterCategory}
                        onEdit={handleEdit}
                        onToggle={handleToggleClick}
                    />
                </div>

                <EditParameterDialog
                    isOpen={isDialogOpen}
                    onClose={handleDialogClose}
                    parameter={editingParameter}
                    onSuccess={fetchParameters}
                />

                <ToggleConfirmDialog
                    isOpen={isToggleConfirmOpen}
                    onClose={handleToggleConfirmClose}
                    onConfirm={confirmToggle}
                    parameter={
                        togglePendingParameter
                            ? parameters.find((p) => p.id === togglePendingParameter.id) || null
                            : null
                    }
                    currentStatus={togglePendingParameter?.currentStatus ?? false}
                />
            </div>
        </div>
    );
}
