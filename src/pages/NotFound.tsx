
import { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";
import { Home, Search, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Get the appropriate home link based on user role
  const getHomeLink = () => {
    if (!isAuthenticated || !user) return "/";
    
    switch(user.role) {
      case "volunteer": 
        return "/volunteer/dashboard";
      case "organization": 
        return "/organization/dashboard";
      case "sponsor": 
        return "/sponsor/dashboard";
      case "admin": 
        return "/admin/dashboard";
      default: 
        return "/";
    }
  };

  const homeLink = getHomeLink();

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-seekup-blue to-seekup-purple h-24 w-24 text-white text-6xl font-bold flex items-center justify-center rounded-xl">
              404
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            Oops! It seems the page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={homeLink}>
              <Button className="w-full sm:w-auto bg-seekup-blue hover:bg-seekup-blue/90">
                <Home className="mr-2 h-4 w-4" />
                {isAuthenticated ? "Go to Dashboard" : "Go Home"}
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Find Events
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
