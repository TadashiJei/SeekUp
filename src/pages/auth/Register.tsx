
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth, UserRole } from "@/context/AuthContext";
import PageLayout from "@/components/layout/PageLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

// Skills options for volunteers
const skillOptions = [
  "Teaching",
  "Medical",
  "Technical",
  "Construction",
  "Design",
  "Writing",
  "Marketing",
  "Project Management",
  "Counseling",
  "Sports",
  "Arts",
  "Environmental",
  "Legal",
  "Logistics",
];

// Categories for organizations
const orgCategories = [
  "Education",
  "Health",
  "Environment",
  "Animal Welfare",
  "Community Development",
  "Arts & Culture",
  "Disaster Relief",
  "Human Rights",
  "Youth Development",
  "Senior Care",
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>("volunteer");
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    organization: "",
    category: "",
    description: "",
    location: "",
    website: "",
    skills: [] as string[],
    acceptTerms: false,
  });
  
  // Check URL params for pre-selected role
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    
    if (type === "volunteer" || type === "organization" || type === "sponsor") {
      setActiveRole(type as UserRole);
    }
  }, [location]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }));
  };
  
  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => {
      const updatedSkills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      
      return { ...prev, skills: updatedSkills };
    });
  };
  
  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    if (!formData.acceptTerms) {
      setError("You must accept the terms and conditions");
      return false;
    }
    
    if (activeRole === "volunteer" && formData.skills.length === 0) {
      setError("Please select at least one skill");
      return false;
    }
    
    if (activeRole === "organization" && !formData.category) {
      setError("Please select a category for your organization");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await register(formData, activeRole);
      toast({
        title: "Registration successful",
        description: "Welcome to SEEKUP!",
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-sm text-gray-600 hover:text-seekup-blue">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-gradient-to-r from-seekup-blue to-seekup-purple p-2 rounded-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Join the community and start making a difference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as UserRole)} className="space-y-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
                <TabsTrigger value="organization">Organization</TabsTrigger>
                <TabsTrigger value="sponsor">Sponsor</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit}>
                {/* Shared Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {activeRole === "volunteer" ? "Full Name" : "Organization/Company Name"}
                      </Label>
                      <Input
                        id="name"
                        placeholder={activeRole === "volunteer" ? "John Doe" : "NGO Philippines"}
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="mail@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+63"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  {/* Volunteer-specific fields */}
                  {activeRole === "volunteer" && (
                    <div className="space-y-3">
                      <Label>Skills & Interests</Label>
                      <div className="flex flex-wrap gap-2">
                        {skillOptions.map((skill) => (
                          <label
                            key={skill}
                            className={`px-3 py-1.5 rounded-full border cursor-pointer text-sm transition-colors ${
                              formData.skills.includes(skill)
                                ? "bg-seekup-blue text-white border-seekup-blue"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={formData.skills.includes(skill)}
                              onChange={() => handleSkillToggle(skill)}
                            />
                            {skill}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Organization-specific fields */}
                  {activeRole === "organization" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleSelectChange("category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {orgCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Organization Description</Label>
                        <Input
                          id="description"
                          placeholder="Brief description of your organization"
                          value={formData.description}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            placeholder="City, Province"
                            value={formData.location}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website (Optional)</Label>
                          <Input
                            id="website"
                            placeholder="https://yourwebsite.com"
                            value={formData.website}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Sponsor-specific fields */}
                  {activeRole === "sponsor" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="description">Company Description</Label>
                        <Input
                          id="description"
                          placeholder="Brief description of your organization"
                          value={formData.description}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input
                          id="website"
                          placeholder="https://yourwebsite.com"
                          value={formData.website}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Terms & Conditions */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="acceptTerms" 
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleCheckboxChange("acceptTerms", checked as boolean)}
                    />
                    <label
                      htmlFor="acceptTerms"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{" "}
                      <Link to="/terms" className="text-seekup-blue hover:underline">
                        terms of service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-seekup-blue hover:underline">
                        privacy policy
                      </Link>
                    </label>
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                  
                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-seekup-blue hover:bg-seekup-blue/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm text-muted-foreground mt-2">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-seekup-blue hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Register;
