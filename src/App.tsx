import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/Components/theme-provider";
import { useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";

import Unit from "./pages/Unit";
import PrivateRoute from "@/routes/PrivateRoute";
import { SidebarSelectionProvider } from "@/context/SidebarSelectionContext";
import CertificatePage from "./pages/CertificatePage";

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <SidebarSelectionProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isLoggedIn ? <Home /> : <LoginPage />} />
            <Route path="/course/:id/" element={<Unit />} />
            <Route path="/certificate" element={<CertificatePage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </SidebarSelectionProvider>
  );
}

export default App;
