import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Parameter } from "@/interfaces/ParameterInterface";
import { getCategoryBorderColorLight, getCategoryColor } from "@/utils/parameterUtils";
import { Edit } from "lucide-react";

interface ParameterCardProps {
    parameter: Parameter;
    onEdit: (parameter: Parameter) => void;
    onToggle: (id: string, currentStatus: boolean) => void;
}

/**
 * Parameter Card Component
 * Displays a single parameter with its details, controls, and category styling
 */
export function ParameterCard({ parameter, onEdit, onToggle }: ParameterCardProps) {
    return (
        <Card
            className={`bg-theme-card border-2 transition-all duration-200 hover:shadow-lg ${
                parameter.isActive ? getCategoryBorderColorLight(parameter.category) : "border-theme-border opacity-60"
            }`}
        >
            <CardContent className="p-5">
                <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-mono text-sm font-bold truncate">{parameter.key}</h3>
                                <Badge className={getCategoryColor(parameter.category)}>{parameter.category}</Badge>
                            </div>
                            {parameter.description && (
                                <p className="text-xs text-gray-400 line-clamp-2">{parameter.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Switch
                                checked={parameter.isActive}
                                onCheckedChange={() => onToggle(parameter.id, parameter.isActive)}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(parameter)}
                                className="hover:bg-white/10"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Value Row */}
                    <div className="flex items-center gap-3 pt-2 border-t border-theme-border">
                        <Badge variant="outline" className="border-stone-700 flex-shrink-0">
                            {parameter.type}
                        </Badge>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono truncate text-gray-300">
                                {typeof parameter.value === "object"
                                    ? JSON.stringify(parameter.value)
                                    : String(parameter.value)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
