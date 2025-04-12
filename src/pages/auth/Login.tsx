
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/layout/PageLayout";
import { toast as sonnerToast } from "sonner";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Add effect to redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // User is already authenticated, redirect based on role
      redirectToDashboard(user.role);
    }
  }, [user]);

  const redirectToDashboard = (role) => {
    switch(role) {
      case "volunteer":
        navigate("/volunteer/dashboard");
        break;
      case "organization":
        navigate("/organization/dashboard");
        break;
      case "sponsor":
        navigate("/sponsor/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    if (!email || !password) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", { email });
      const result = await login(email, password);
      console.log("Login result:", result);
      
      // Show success message using both toast systems for reliability
      toast({
        title: "Login successful",
        description: "Welcome back to SEEKUP!",
      });
      sonnerToast.success("Login successful", {
        description: "Welcome back to SEEKUP!"
      });
      
      // Immediately redirect based on user role instead of using setTimeout
      if (result?.role) {
        redirectToDashboard(result.role);
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Invalid credentials";
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      sonnerToast.error("Login failed", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-gradient-to-r from-seekup-blue to-seekup-purple p-2 rounded-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Sign in to SEEKUP</CardTitle>
            <CardDescription>
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="email" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone" disabled>
                  Phone (Coming Soon)
                </TabsTrigger>
              </TabsList>
              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="mail@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                          to="/forgot-password"
                          className="text-sm text-seekup-blue hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full bg-seekup-blue hover:bg-seekup-blue/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                  </div>
                </form>
                <div className="mt-4 text-center text-sm">
                  <p className="text-muted-foreground">
                    For demo purposes, try:
                  </p>
                  <p className="font-mono text-muted-foreground">
                    volunteer@example.com / password
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm text-muted-foreground mt-2">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-seekup-blue hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Login;
