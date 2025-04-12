import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  TrendingUp,
  Calendar as CalendarIcon,
  QrCode,
  Search,
  Loader2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VolunteerScannerModal } from "@/components/volunteers/VolunteerScannerModal";

// Mock data for upcoming events
const upcomingEvents = [
  {
    id: "1",
    title: "Coastal Clean-up Drive",
    organization: "Ocean Care PH",
    date: "April 15, 2025",
    time: "8:00 AM - 12:00 PM",
    location: "Manila Bay, Manila",
    image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=300",
    category: "Environment",
  },
  {
    id: "2",
    title: "Book Reading for Kids",
    organization: "Education First Foundation",
    date: "April 22, 2025",
    time: "2:00 PM - 4:00 PM",
    location: "Public Library, Quezon City",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=300",
    category: "Education",
  },
];

// Mock data for past events
const pastEvents = [
  {
    id: "3",
    title: "Tree Planting Activity",
    organization: "Green Earth PH",
    date: "March 10, 2025",
    points: 3,
    hours: 4,
    location: "La Mesa Watershed, Quezon City",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=300",
    category: "Environment",
  },
  {
    id: "4",
    title: "Food Distribution Drive",
    organization: "Feed the Hungry",
    date: "February 25, 2025",
    points: 5,
    hours: 6,
    location: "Tondo, Manila",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=300",
    category: "Community Service",
  },
];

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Handler functions for quick action buttons
  const handleFindEvents = () => {
    navigate('/events');
  };
  
  const handleMyQrCode = () => {
    setShowQrCode(true);
  };
  
  const handleImpactStats = () => {
    navigate('/profile', { state: { tab: 'impact' } });
  };
  
  const handleBadges = () => {
    navigate('/profile', { state: { tab: 'badges' } });
  };
  
  const handleScanQrCode = () => {
    setShowQrScanner(true);
  };
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-seekup-blue" />
      </div>
    );
  }
  
  if (!user) return null;
  
  // Generate a unique QR code value for the volunteer
  const volunteerQrValue = JSON.stringify({
    id: user.id,
    name: user.name,
    role: user.role,
    timestamp: new Date().toISOString(),
  });
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(" ")[0]}!</h1>
        <p className="text-gray-600">Here's your volunteer activity and upcoming events.</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-500">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="h-8 w-8 text-seekup-purple mr-3" />
              <div>
                <p className="text-3xl font-bold">{user.points}</p>
                <p className="text-sm text-gray-500">Level: Community Hero</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-500">Volunteer Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-seekup-blue mr-3" />
              <div>
                <p className="text-3xl font-bold">28</p>
                <p className="text-sm text-gray-500">Last 30 days: +8 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-500">Next Milestone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-medium">Silver Badge</p>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500">{user.points} / 65 points</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Button 
          variant="outline" 
          className="h-auto py-6 flex flex-col items-center gap-2"
          onClick={handleFindEvents}
        >
          <Search className="h-5 w-5" />
          <span>Find Events</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-6 flex flex-col items-center gap-2"
          onClick={handleMyQrCode}
        >
          <QrCode className="h-5 w-5" />
          <span>My QR Code</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-6 flex flex-col items-center gap-2"
          onClick={handleImpactStats}
        >
          <TrendingUp className="h-5 w-5" />
          <span>Impact Stats</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-6 flex flex-col items-center gap-2"
          onClick={handleBadges}
        >
          <Award className="h-5 w-5" />
          <span>Badges</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-6 flex flex-col items-center gap-2"
          onClick={handleScanQrCode}
        >
          <Search className="h-5 w-5" />
          <span>Scan QR</span>
        </Button>
      </div>
      
      {/* QR Code Modal */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Volunteer QR Code</DialogTitle>
            <DialogDescription>
              Use this QR code to check in at volunteer events
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <div className="bg-white p-4 rounded-lg border mb-4">
              <QRCodeSVG 
                value={volunteerQrValue} 
                size={200} 
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-center mb-2 font-medium">{user.name}</p>
            <p className="text-xs text-center text-muted-foreground mb-2">
              ID: {user.id?.substring(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-center text-muted-foreground">
              This QR code contains your unique volunteer information and can be 
              scanned by event organizers to verify your attendance.
            </p>
          </div>
          <DialogFooter className="flex justify-center sm:justify-between">
            <Button variant="outline" onClick={() => setShowQrCode(false)}>Close</Button>
            <Button 
              onClick={() => {
                // This would download the QR code in a real implementation
                // For now we'll just close the dialog and show a toast
                setShowQrCode(false);
              }}
            >
              Download QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* QR Scanner Modal */}
      <VolunteerScannerModal 
        open={showQrScanner} 
        onClose={() => setShowQrScanner(false)} 
      />
      
      {/* Events Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={() => navigate('/events')}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No upcoming events. Find events to join!</p>
                <Button 
                  className="mt-4 bg-seekup-blue hover:bg-seekup-blue/90"
                  onClick={() => navigate('/events')}
                >
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="sm:flex">
                    <div className="sm:w-1/3">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="h-48 sm:h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-5 sm:w-2/3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg line-clamp-2">{event.title}</h3>
                          <Badge variant="outline" className="ml-2">
                            {event.category}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3 text-sm">
                          {event.organization}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            {event.date}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            {event.time}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-seekup-blue hover:bg-seekup-blue/90"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Add to Calendar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No past events yet. Join an event to get started!</p>
                <Button 
                  className="mt-4 bg-seekup-blue hover:bg-seekup-blue/90"
                  onClick={() => navigate('/events')}
                >
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="sm:flex">
                    <div className="sm:w-1/3">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="h-48 sm:h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-5 sm:w-2/3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg line-clamp-2">{event.title}</h3>
                          <Badge variant="outline" className="ml-2">
                            {event.category}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3 text-sm">
                          {event.organization}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            {event.date}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Award className="h-4 w-4 mr-2" />
                            Earned: {event.points} points ({event.hours} hours)
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button variant="outline" size="sm">
                          View Certificate
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
