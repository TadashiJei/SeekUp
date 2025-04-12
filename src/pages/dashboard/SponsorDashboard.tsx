
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Calendar,
  TrendingUp,
  PlusCircle,
  BarChart2,
  Award,
  ArrowRight,
} from "lucide-react";

const SponsorDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Redirect if not authenticated or not a sponsor
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== "sponsor"))) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate, user?.role]);
  
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
  
  // Sample data for sponsor dashboard
  const sponsoredEvents = [
    {
      id: "1",
      title: "Coastal Clean-up Drive",
      organization: "Ocean Care PH",
      date: "April 15, 2025",
      status: "active",
      impact: {
        volunteers: 45,
        hours: 180,
      }
    },
    {
      id: "2",
      title: "Tree Planting Activity",
      organization: "Green Earth PH",
      date: "March 10, 2025",
      status: "completed",
      impact: {
        volunteers: 72,
        hours: 288,
        trees: 350,
      }
    },
  ];
  
  const recommendedEvents = [
    {
      id: "3",
      title: "Community School Renovation",
      organization: "Build Better PH",
      date: "May 20, 2025",
      impact: {
        volunteers: 0,
        target: 50,
        budget: "₱120,000"
      }
    },
    {
      id: "4",
      title: "Tech Skills Workshop for Youth",
      organization: "Digital Future Foundation",
      date: "June 5, 2025",
      impact: {
        volunteers: 0,
        target: 30,
        budget: "₱75,000"
      }
    },
  ];
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sponsor Dashboard</h1>
            <p className="text-gray-600">Monitor your sponsorships and impact metrics.</p>
          </div>
          <Button className="bg-seekup-green hover:bg-seekup-green/90">
            <PlusCircle className="h-4 w-4 mr-2" />
            Sponsor New Event
          </Button>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="stat-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-500">Volunteer Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-seekup-purple mr-3" />
                <div>
                  <p className="text-3xl font-bold">117</p>
                  <p className="text-sm text-gray-500">Last 30 days: +45</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-500">Active Sponsorships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-seekup-blue mr-3" />
                <div>
                  <p className="text-3xl font-bold">3</p>
                  <p className="text-sm text-gray-500">Total Budget: ₱250,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-500">Social Impact Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-seekup-green mr-3" />
                <div>
                  <p className="text-3xl font-bold">85</p>
                  <p className="text-sm text-gray-500">Last 30 days: +12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sponsored Events */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Sponsored Events</h2>
            <Button variant="outline" size="sm" className="flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sponsoredEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{event.organization} • {event.date}</p>
                    </div>
                    <Badge 
                      className={event.status === 'active' ? 
                        'bg-seekup-blue hover:bg-seekup-blue/90' : 
                        'bg-green-600 hover:bg-green-600/90'
                      }
                    >
                      {event.status === 'active' ? 'Active' : 'Completed'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Volunteers</p>
                        <p className="text-lg font-medium">{event.impact.volunteers}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Hours</p>
                        <p className="text-lg font-medium">{event.impact.hours}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">
                          {event.impact.trees ? 'Trees' : 'Rating'}
                        </p>
                        <p className="text-lg font-medium">
                          {event.impact.trees || '4.8/5'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1 bg-seekup-blue hover:bg-seekup-blue/90">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        View Impact Report
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Event Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Recommended Sponsorships */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recommended Sponsorships</h2>
            <Button variant="outline" size="sm" className="flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendedEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{event.organization} • {event.date}</p>
                    </div>
                    <Badge variant="outline" className="border-seekup-purple text-seekup-purple">
                      Recommended
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Target</p>
                        <p className="text-lg font-medium">{event.impact.target} ppl</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="text-lg font-medium">{event.impact.budget}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Impact</p>
                        <div className="flex items-center justify-center mt-1">
                          <Award className="h-5 w-5 text-seekup-green" />
                          <Award className="h-5 w-5 text-seekup-green" />
                          <Award className="h-5 w-5 text-seekup-green" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1 bg-seekup-green hover:bg-seekup-green/90">
                        Sponsor This Event
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SponsorDashboard;
