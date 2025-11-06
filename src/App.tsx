import React, { useEffect } from "react";
import "@/App.scss";
import AppRoutes from "@/routes";
import { ThemeProvider } from "@/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import "@fontsource-variable/inter";
import { useParameterValue } from "@/hooks/useParameter";

const App: React.FC = () => {
  // Fetch primary color parameter and apply to CSS variable
  const primaryColor = useParameterValue<string>('theme.primary_color', '#33FF00');

  useEffect(() => {
    // Apply primary color to CSS custom property on root element
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary-color', primaryColor);
    }
  }, [primaryColor]);

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
