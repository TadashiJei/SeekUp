
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Pages
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import SuccessStories from "./pages/SuccessStories";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProfilePage from "./pages/profile/ProfilePage";
import VolunteerDashboard from "./pages/dashboard/VolunteerDashboard";
import OrganizationDashboard from "./pages/dashboard/OrganizationDashboard";
import SponsorDashboard from "./pages/dashboard/SponsorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import EventsPage from "./pages/events/EventsPage";
import EventDetail from "./pages/events/EventDetail";
import TasksPage from "./pages/TasksPage";
import CommunityPage from "./pages/CommunityPage";

// Context
import { AuthProvider } from "./context/AuthContext";

// Components
import { Toaster as SonnerToaster } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Dashboard routes - both formats */}
          <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
          <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} /> {/* Added new path format */}
          <Route path="/dashboard/organization" element={<OrganizationDashboard />} />
          <Route path="/organization/dashboard" element={<OrganizationDashboard />} />
          <Route path="/dashboard/sponsor" element={<SponsorDashboard />} />
          <Route path="/sponsor/dashboard" element={<SponsorDashboard />} /> {/* Added new path format */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* Added new path format */}
          
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TasksPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SonnerToaster position="top-right" />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
