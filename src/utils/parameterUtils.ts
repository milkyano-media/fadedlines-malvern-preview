import { ParameterCategory, ParameterType } from "@/interfaces/ParameterInterface";

/**
 * Get category color for badges (background + text)
 */
export function getCategoryColor(category: ParameterCategory): string {
    const colors: Record<ParameterCategory, string> = {
        [ParameterCategory.THEME]: "bg-purple-500/10 text-purple-500",
        [ParameterCategory.CONTENT]: "bg-yellow-500/10 text-yellow-500",
        [ParameterCategory.FEATURE_FLAG]: "bg-red-500/10 text-red-500",
        [ParameterCategory.BRANDING]: "bg-orange-500/10 text-orange-500",
        [ParameterCategory.CONTACT]: "bg-amber-500/10 text-amber-500",
    };
    return colors[category] || "bg-gray-500/10 text-gray-500";
}

/**
 * Get category border color for selected state (border + background)
 */
export function getCategoryBorderColor(category: ParameterCategory): string {
    const colors: Record<ParameterCategory, string> = {
        [ParameterCategory.THEME]: "border-purple-500 bg-purple-500/10",
        [ParameterCategory.CONTENT]: "border-yellow-500 bg-yellow-500/10",
        [ParameterCategory.FEATURE_FLAG]: "border-red-500 bg-red-500/10",
        [ParameterCategory.BRANDING]: "border-orange-500 bg-orange-500/10",
        [ParameterCategory.CONTACT]: "border-amber-500 bg-amber-500/10",
    };
    return colors[category] || "border-gray-500 bg-gray-500/10";
}

/**
 * Get category border color for parameter cards (lighter variant)
 */
export function getCategoryBorderColorLight(category: ParameterCategory): string {
    const colors: Record<ParameterCategory, string> = {
        [ParameterCategory.THEME]: "border-purple-500/30",
        [ParameterCategory.CONTENT]: "border-yellow-500/30",
        [ParameterCategory.FEATURE_FLAG]: "border-red-500/30",
        [ParameterCategory.BRANDING]: "border-orange-500/30",
        [ParameterCategory.CONTACT]: "border-amber-500/30",
    };
    return colors[category] || "border-gray-500/30";
}

/**
 * Get category background color for accent bars
 */
export function getCategoryBgColor(category: ParameterCategory): string {
    const colors: Record<ParameterCategory, string> = {
        [ParameterCategory.THEME]: "bg-purple-500",
        [ParameterCategory.CONTENT]: "bg-yellow-500",
        [ParameterCategory.FEATURE_FLAG]: "bg-red-500",
        [ParameterCategory.BRANDING]: "bg-orange-500",
        [ParameterCategory.CONTACT]: "bg-amber-500",
    };
    return colors[category] || "bg-gray-500";
}

/**
 * Parse parameter value based on type
 * Converts string input to appropriate type for API submission
 */
export function parseParameterValue(value: string, type: ParameterType): string | number | boolean | object {
    switch (type) {
        case ParameterType.NUMBER:
            return parseFloat(value);
        case ParameterType.BOOLEAN:
            return value === "true" || value === "1";
        case ParameterType.JSON:
            return JSON.parse(value);
        default:
            return value;
    }
}
