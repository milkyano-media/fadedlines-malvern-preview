import "@/App.scss";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { useParameterValue } from "@/hooks/useParameter";
import AppRoutes from "@/routes";
import { ThemeProvider } from "@/ThemeProvider";
import "@fontsource-variable/inter";
import React, { useEffect } from "react";
import Color from "color";

const App: React.FC = () => {
    // Fetch all theme color parameters
    const primaryColor = useParameterValue<string>("theme.primary_color", "#33FF00");
    const backgroundColor = useParameterValue<string>("theme.background_color", "#000000");
    const borderColor = useParameterValue<string>("theme.border_color", "#33ff00");
    const textColorPrimary = useParameterValue<string>("theme.text_color_primary", "#33ff00");
    const textColorSecondary = useParameterValue<string>("theme.text_color_secondary", "#ffffff");
    const shadowColorParameter = useParameterValue<string>("theme.shadow_color", "#33ff00");

    useEffect(() => {
        // Apply all theme colors to CSS custom properties on root element

        // Increase the opacity of shadow colow parameter
        const shadowColorParameterOpacitied = Color(shadowColorParameter).alpha(0.1).hsl().toString();

        // setup primary color variation
        const primaryColor20 = Color(primaryColor).lightness(20).hsl().string();
        const primaryColor35 = Color(primaryColor).lightness(35).hsl().string();
        const primaryColor50 = Color(primaryColor).lightness(50).hsl().string();

        // setup text primary color variation
        const textColorPrimary85 = Color(textColorPrimary).lightness(85).hsl().string();

        const colors = {
            "--primary-color-20": primaryColor20,
            "--primary-color-35": primaryColor35,
            "--primary-color-50": primaryColor50,
            "--primary-color": primaryColor,

            "--text-color-primary": textColorPrimary,
            "--text-color-primary-85": textColorPrimary85,

            "--text-color-secondary": textColorSecondary,

            "--background-color": backgroundColor,
            "--border-color": borderColor,

            "--shadow-color": shadowColorParameterOpacitied,
        };

        Object.entries(colors).forEach(([property, value]) => {
            if (value) {
                document.documentElement.style.setProperty(property, value);
            }
        });

        if (textColorSecondary) {
            document.body.style.color = textColorSecondary;
        }

        // Apply background color to body element
        if (backgroundColor) {
            document.body.style.backgroundColor = backgroundColor;
        }
    }, [primaryColor, backgroundColor, borderColor, textColorPrimary, textColorSecondary, shadowColorParameter]);

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AuthProvider>
                <div className="App">
                    <AppRoutes />
                    <Toaster />
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
