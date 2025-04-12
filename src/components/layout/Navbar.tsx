import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Bell, User, ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "volunteer":
        return "/volunteer/dashboard";
      case "organization":
        return "/organization/dashboard";
      case "sponsor":
        return "/sponsor/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/login";
    }
  };
  
  const dashboardLink = getDashboardLink();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/seekup-uploads/885d4a8e-416c-42af-8a1c-5823a1889941.png" 
              alt="SEEKUP Logo" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className="text-gray-700 hover:text-seekup-blue transition-colors px-2 py-1">
                    Home
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-seekup-blue transition-colors">
                    About
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            to="/about"
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-seekup-blue/10 to-seekup-purple/10 p-6 no-underline outline-none focus:shadow-md"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Our Mission
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Learn about how SEEKUP is bridging the gap between volunteers and organizations.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <Link 
                          to="/about"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">About Us</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Our story and mission
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/how-it-works"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">How It Works</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            The platform that connects communities
                          </p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/events" className="text-gray-700 hover:text-seekup-blue transition-colors px-2 py-1">
                    Events
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/success-stories" className="text-gray-700 hover:text-seekup-blue transition-colors px-2 py-1">
                    Success Stories
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/contact" className="text-gray-700 hover:text-seekup-blue transition-colors px-2 py-1">
                    Contact
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Authentication Buttons */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-seekup-red rounded-full w-4 h-4 text-[10px] text-white flex items-center justify-center">
                    2
                  </span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-seekup-blue">
                          <img 
                            src={user.avatar || "https://i.pravatar.cc/150?img=1"} 
                            alt={user.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={dashboardLink} className="cursor-pointer">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t mt-2">
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={toggleMobileMenu}>
                Home
              </Link>
              <Link to="/about" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={toggleMobileMenu}>
                About
              </Link>
              <Link to="/events" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={toggleMobileMenu}>
                Events
              </Link>
              <Link to="/success-stories" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={toggleMobileMenu}>
                Success Stories
              </Link>
              <Link to="/contact" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={toggleMobileMenu}>
                Contact
              </Link>
              
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  <Link to="/login" onClick={toggleMobileMenu}>
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/register" onClick={toggleMobileMenu}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  <Link to={dashboardLink} className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={toggleMobileMenu}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link to="/profile" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={toggleMobileMenu}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <Button onClick={logout} variant="ghost" className="justify-start">
                    Log out
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
