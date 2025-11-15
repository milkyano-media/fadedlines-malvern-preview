import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Parameter, ParameterCategory } from "@/interfaces/ParameterInterface";
import { RefreshCw, Search } from "lucide-react";
import { ParameterCard } from "./ParameterCard";

interface ParameterListProps {
    parameters: Parameter[];
    isLoading: boolean;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    filterCategory: ParameterCategory | "all";
    onEdit: (parameter: Parameter) => void;
    onToggle: (id: string, currentStatus: boolean) => void;
}

/**
 * Parameter List Component
 * Right side panel showing search bar and grid of parameter cards
 */
export function ParameterList({
    parameters,
    isLoading,
    searchTerm,
    onSearchChange,
    filterCategory,
    onEdit,
    onToggle,
}: ParameterListProps) {
    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search parameters..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 bg-theme-card border-theme-border h-12"
                />
            </div>

            {/* Parameters Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">
                        {filterCategory === "all" ? "All Parameters" : filterCategory}
                    </h2>
                    <p className="text-sm text-gray-400">{parameters.length} parameters found</p>
                </div>
            </div>

            {/* Parameters Cards Grid */}
            {isLoading ? (
                <div className="text-center py-16 text-gray-400">
                    <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin" />
                    <p>Loading parameters...</p>
                </div>
            ) : parameters.length === 0 ? (
                <Card className="bg-theme-card border-theme-border">
                    <CardContent className="py-16 text-center">
                        <div className="text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-semibold mb-1">No parameters found</p>
                            <p className="text-sm">
                                {searchTerm
                                    ? "Try adjusting your search term"
                                    : "No parameters available in this category"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {parameters.map((parameter) => (
                        <ParameterCard key={parameter.id} parameter={parameter} onEdit={onEdit} onToggle={onToggle} />
                    ))}
                </div>
            )}
        </div>
    );
}
