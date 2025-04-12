import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Home, LogOut, User, Settings, Calendar, ClipboardList, Users, 
  Award, BarChart, HelpCircle, Globe, Mail
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    // Redirect to login if no user
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Role-specific navigation items
  const getNavItems = () => {
    switch (user.role) {
      case "volunteer":
        return [
          { icon: Home, label: "Dashboard", path: "/volunteer/dashboard" },
          { icon: Calendar, label: "Events", path: "/events" },
          { icon: ClipboardList, label: "My Tasks", path: "/tasks" },
          { icon: Award, label: "Achievements", path: "/profile" },
          { icon: Users, label: "Community", path: "/community" },
        ];
      case "organization":
        return [
          { icon: Home, label: "Dashboard", path: "/organization/dashboard" },
          { icon: Calendar, label: "Events", path: "/events" },
          { icon: Users, label: "Volunteers", path: "/volunteers" },
          { icon: BarChart, label: "Reports", path: "/reports" },
        ];
      case "sponsor":
        return [
          { icon: Home, label: "Dashboard", path: "/sponsor/dashboard" },
          { icon: Calendar, label: "Events", path: "/events" },
          { icon: BarChart, label: "Impact", path: "/impact" },
          { icon: Globe, label: "Organizations", path: "/organizations" },
        ];
      case "admin":
        return [
          { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
          { icon: Users, label: "Users", path: "/admin/users" },
          { icon: Calendar, label: "Events", path: "/admin/events" },
          { icon: Settings, label: "Settings", path: "/admin/settings" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <div className="flex items-center">
              <img 
                src="/seekup-uploads/885d4a8e-416c-42af-8a1c-5823a1889941.png" 
                alt="SEEKUP Logo" 
                className="h-10 w-auto"
              />
            </div>
          </div>
          
          <div className="px-4 mb-6">
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-seekup-blue">
                  <img 
                    src={user.avatar || "https://i.pravatar.cc/150?img=1"} 
                    alt={user.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 px-3">
            <nav className="flex-1 space-y-1">
              {navItems.map((item, index) => (
                <Button 
                  key={index} 
                  variant="ghost" 
                  className="w-full justify-start mb-1"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <div className="p-4 mt-6 border-t">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/profile')}
              >
                <User className="mr-3 h-5 w-5" />
                Profile
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/contact')}
              >
                <Mail className="mr-3 h-5 w-5" />
                Contact Support
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/seekup-uploads/885d4a8e-416c-42af-8a1c-5823a1889941.png" 
              alt="SEEKUP Logo" 
              className="h-8 w-auto"
            />
          </div>
          
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8">
          {children}
        </main>
        
        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t">
          <nav className="flex justify-around">
            {navItems.slice(0, 5).map((item, index) => (
              <Button 
                key={index} 
                variant="ghost" 
                className="py-3 px-2 flex flex-col items-center rounded-none"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
