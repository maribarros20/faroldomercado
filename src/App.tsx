
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import MaterialsPage from "@/pages/MaterialsPage";
import VideosPage from "@/pages/VideosPage";
import ProfilePage from "@/pages/Profile";
import CommunityPage from "@/pages/CommunityPage";
import ProgressPage from "@/pages/ProgressPage";
import AdminPage from "@/pages/AdminPage";
import PlansPage from "@/pages/PlansPage";
import NotFound from "@/pages/NotFound";
import AppLayout from '@/components/AppLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import ProfileSettingsPage from '@/pages/ProfileSettingsPage';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage register={true} />} />
              <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
              <Route path="/materials" element={<AppLayout><MaterialsPage /></AppLayout>} />
              <Route path="/videos" element={<AppLayout><VideosPage /></AppLayout>} />
              <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
              <Route path="/profile-settings" element={<AppLayout><ProfileSettingsPage /></AppLayout>} />
              <Route path="/community" element={<AppLayout><CommunityPage /></AppLayout>} />
              <Route path="/progress" element={<AppLayout><ProgressPage /></AppLayout>} />
              <Route path="/admin" element={<AppLayout><AdminPage /></AppLayout>} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
};

export default App;
