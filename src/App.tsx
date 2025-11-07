import React, { useEffect } from "react";
import "@/App.scss";
import AppRoutes from "@/routes";
import { ThemeProvider } from "@/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import "@fontsource-variable/inter";
import { useParameterValue } from "@/hooks/useParameter";

const App: React.FC = () => {
  // Fetch all theme color parameters
  const primaryColor = useParameterValue<string>('theme.primary_color', '#33FF00');
  const secondaryColor = useParameterValue<string>('theme.secondary_color', '#ffffff');
  const backgroundColor = useParameterValue<string>('theme.background_color', '#000000');
  const cardBackgroundColor = useParameterValue<string>('theme.card_background_color', '#0a0a0a');
  const borderColor = useParameterValue<string>('theme.border_color', '#292524');
  const textColorPrimary = useParameterValue<string>('theme.text_color_primary', '#ffffff');
  const textColorSecondary = useParameterValue<string>('theme.text_color_secondary', '#a8a29e');

  useEffect(() => {
    // Apply all theme colors to CSS custom properties on root element
    const colors = {
      '--primary-color': primaryColor,
      '--secondary-color': secondaryColor,
      '--background-color': backgroundColor,
      '--card-background-color': cardBackgroundColor,
      '--border-color': borderColor,
      '--text-color-primary': textColorPrimary,
      '--text-color-secondary': textColorSecondary,
    };

    Object.entries(colors).forEach(([property, value]) => {
      if (value) {
        document.documentElement.style.setProperty(property, value);
      }
    });

    // Apply background color to body element
    if (backgroundColor) {
      document.body.style.backgroundColor = backgroundColor;
    }

    // Apply primary text color to body element
    if (textColorPrimary) {
      document.body.style.color = textColorPrimary;
    }
  }, [primaryColor, secondaryColor, backgroundColor, cardBackgroundColor, borderColor, textColorPrimary, textColorSecondary]);

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
