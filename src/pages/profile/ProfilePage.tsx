
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import PageLayout from "@/components/layout/PageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Save, User } from "lucide-react";
import { toast } from "sonner";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const { user, isLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  // Redirect if not authenticated
  if (!isLoading && !user) {
    navigate("/login");
    return null;
  }
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      phone: user?.phone || "",
    },
  });

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile(values);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    form.reset({
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          Loading...
        </div>
      </PageLayout>
    );
  }

  if (!user) return null;
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "volunteer":
        return "bg-seekup-blue text-white";
      case "organization":
        return "bg-seekup-purple text-white";
      case "sponsor":
        return "bg-seekup-green text-white";
      case "admin":
        return "bg-seekup-red text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-seekup-blue text-white text-xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription className="flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${getRoleBadgeColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
                
                {user.role === "volunteer" && (
                  <div>
                    <p className="text-sm text-muted-foreground">Impact Points</p>
                    <p className="font-semibold text-seekup-blue">{user.points || 0} points</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Profile Details */}
          <div className="md:col-span-2">
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Profile Details</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Manage your personal details</CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </Button>
                    ) : (
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        Cancel
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter your name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Tell us about yourself" 
                                    className="resize-none" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Location</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="City, Country" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Phone number" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button type="submit">
                              <Save className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground">Full Name</h3>
                          <p>{user.name}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground">Bio</h3>
                          <p>{user.bio || "No bio provided yet"}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Location</h3>
                            <p>{user.location || "Not specified"}</p>
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Phone</h3>
                            <p>{user.phone || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Password</h3>
                      <p className="text-sm text-muted-foreground">
                        Change your password to keep your account secure
                      </p>
                      <Button variant="outline">Change Password</Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Email Preferences</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your notification settings
                      </p>
                      <Button variant="outline">Update Preferences</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
