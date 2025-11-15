import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParameterCategory } from "@/interfaces/ParameterInterface";
import { getCategoryBgColor, getCategoryBorderColor } from "@/utils/parameterUtils";

interface CategorySelectorProps {
    categories: ParameterCategory[];
    selectedCategory: ParameterCategory | "all";
    onSelectCategory: (category: ParameterCategory | "all") => void;
}

/**
 * Category Selector Component
 * Left sidebar showing category cards for filtering parameters
 */
export function CategorySelector({ categories, selectedCategory, onSelectCategory }: CategorySelectorProps) {
    return (
        <div className="space-y-4">
            <Card className="bg-theme-card border-theme-border sticky top-8">
                <CardHeader>
                    <CardTitle className="text-lg">Categories</CardTitle>
                    <CardDescription className="text-xs">Select to filter parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {/* All Categories Option */}
                    <button
                        onClick={() => onSelectCategory("all")}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            selectedCategory === "all"
                                ? "border-white bg-white/10 shadow-lg"
                                : "border-theme-border bg-theme-card hover:border-gray-600 hover:bg-theme-card/50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">All Categories</span>
                        </div>
                    </button>

                    {/* Individual Category Cards */}
                    {categories.map((category) => {
                        const isSelected = selectedCategory === category;

                        return (
                            <button
                                key={category}
                                onClick={() => onSelectCategory(category)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                    isSelected
                                        ? getCategoryBorderColor(category) + " shadow-lg"
                                        : "border-theme-border bg-theme-card hover:border-gray-600 hover:bg-theme-card/50"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold">{category}</span>
                                </div>
                                <div className={`h-1 rounded-full ${getCategoryBgColor(category)}`}></div>
                            </button>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
