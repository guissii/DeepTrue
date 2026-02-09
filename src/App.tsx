import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";

// Pages
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { DeepfakeLab } from "@/pages/DeepfakeLab";
import { DeepfakeHistory } from "@/pages/DeepfakeHistory";
import { FinanceDocs } from "@/pages/FinanceDocs";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { Admin } from "@/pages/Admin";

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/app" element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    
                    {/* Deepfake Routes */}
                    <Route path="deepfake" element={<DeepfakeLab />} />
                    <Route path="deepfake/:type" element={<DeepfakeLab />} />
                    <Route path="deepfake/history" element={<DeepfakeHistory />} />
                    
                    {/* Finance Routes */}
                    <Route path="finance" element={<FinanceDocs />} />
                    <Route path="finance/:type" element={<FinanceDocs />} />
                    
                    {/* Other Routes */}
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="admin" element={<Admin />} />
                  </Route>
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}

export default App;
