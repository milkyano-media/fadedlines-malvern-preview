import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Parameter } from "@/interfaces/ParameterInterface";

interface ToggleConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    parameter: Parameter | null;
    currentStatus: boolean;
}

/**
 * Toggle Confirm Dialog Component
 * Confirmation dialog for toggling parameter active/inactive status
 */
export function ToggleConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    parameter,
    currentStatus,
}: ToggleConfirmDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-theme-card border-theme-border text-white">
                <DialogHeader>
                    <DialogTitle>Confirm Parameter Status Change</DialogTitle>
                    <DialogDescription>Are you sure you want to change the status of this parameter?</DialogDescription>
                </DialogHeader>
                {parameter && (
                    <div className="space-y-3 py-4">
                        <div className="rounded-lg bg-theme-card border border-theme-border p-4">
                            <p className="text-sm text-gray-400 mb-1">Parameter</p>
                            <p className="font-mono text-sm">{parameter.key}</p>
                        </div>
                        <div className="rounded-lg bg-theme-card border border-theme-border p-4">
                            <p className="text-sm text-gray-400 mb-1">Status Change</p>
                            <div className="flex items-center gap-3">
                                <Badge variant={currentStatus ? "default" : "secondary"}>
                                    {currentStatus ? "Active" : "Inactive"}
                                </Badge>
                                <span className="text-gray-400">→</span>
                                <Badge variant={!currentStatus ? "default" : "secondary"}>
                                    {!currentStatus ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                        <div className="rounded-lg bg-yellow-900/20 border border-yellow-500/50 p-4">
                            <p className="text-sm text-yellow-200">
                                ⚠️ This will {currentStatus ? "disable" : "enable"} this parameter on the live website
                                immediately.
                            </p>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} className="border-theme-border">
                        Cancel
                    </Button>
                    <Button type="button" onClick={onConfirm} className="bg-white text-black hover:bg-gray-200">
                        Confirm Change
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
