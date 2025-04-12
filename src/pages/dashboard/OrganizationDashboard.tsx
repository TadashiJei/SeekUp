import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Calendar,
  BarChart2,
  PlusCircle,
  QrCode,
  ClipboardList,
  BarChart,
  Loader2,
} from "lucide-react";
import { EventsList } from "@/components/dashboard/organization/EventsList";
import { NewEventModal } from "@/components/dashboard/organization/NewEventModal";
import { QrCheckInModal } from "@/components/dashboard/organization/QrCheckInModal";
import { AttendanceModal } from "@/components/dashboard/organization/AttendanceModal";
import { ReportsModal } from "@/components/dashboard/organization/ReportsModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VolunteerScannerModal } from "@/components/volunteers/VolunteerScannerModal";

interface Event {
  id: string;
  title: string;
  date: string;
  status: string;
  volunteers: number;
  maxVolunteers: number;
  impact?: {
    hours?: number;
    trees?: number;
    waste?: string;
  };
}

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // State for modal visibility
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [qrCheckInModalOpen, setQrCheckInModalOpen] = useState(false);
  const [qrScannerModalOpen, setQrScannerModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // State for events
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [draftEvents, setDraftEvents] = useState<Event[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [impactHours, setImpactHours] = useState(0);
  
  // Redirect if not authenticated or not an organization
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== "organization"))) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate, user?.role]);
  
  // Fetch events from Supabase
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEvents();
    }
  }, [isAuthenticated, user]);

  const fetchEvents = async () => {
    try {
      setIsEventsLoading(true);
      setError(null);
      
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (eventsError) {
        throw eventsError;
      }
      
      if (eventsData) {
        const now = new Date();
        
        // Process and format the events
        const processedEvents = eventsData.map(event => ({
          id: event.id,
          title: event.title,
          date: new Date(event.start_time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          status: event.status,
          volunteers: Math.floor(Math.random() * event.max_volunteers), // Simulating volunteer count for now
          maxVolunteers: event.max_volunteers,
          impact: event.status === 'completed' ? {
            hours: Math.floor(Math.random() * 300) + 50,
            trees: event.title.toLowerCase().includes('tree') ? Math.floor(Math.random() * 200) + 100 : undefined,
            waste: event.title.toLowerCase().includes('clean') ? `${Math.floor(Math.random() * 400) + 100}kg` : undefined,
          } : undefined,
        }));
        
        // Categorize events
        const upcoming = processedEvents.filter(event => 
          event.status === 'published' && new Date(event.date) > now
        );
        
        const past = processedEvents.filter(event => 
          event.status === 'completed' || (event.status === 'published' && new Date(event.date) < now)
        );
        
        const drafts = processedEvents.filter(event => 
          event.status === 'draft'
        );
        
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        setDraftEvents(drafts);
        
        // Update stats
        setTotalEvents(processedEvents.length);
        setTotalVolunteers(processedEvents.reduce((sum, event) => sum + event.volunteers, 0));
        setImpactHours(processedEvents.reduce((sum, event) => 
          event.impact?.hours ? sum + event.impact.hours : sum, 0));
      }
    } catch (error: any) {
      console.error("Error fetching events:", error);
      setError(error.message);
      toast.error("Failed to load events");
    } finally {
      setIsEventsLoading(false);
    }
  };
  
  const renderQuickActions = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <Button 
        variant="outline" 
        className="h-auto py-6 flex flex-col items-center gap-2"
        onClick={() => setNewEventModalOpen(true)}
      >
        <PlusCircle className="h-5 w-5" />
        <span>New Event</span>
      </Button>
      <Button 
        variant="outline" 
        className="h-auto py-6 flex flex-col items-center gap-2"
        onClick={() => setQrCheckInModalOpen(true)}
      >
        <QrCode className="h-5 w-5" />
        <span>QR Check-in</span>
      </Button>
      <Button 
        variant="outline" 
        className="h-auto py-6 flex flex-col items-center gap-2"
        onClick={() => setQrScannerModalOpen(true)}
      >
        <QrCode className="h-5 w-5" />
        <span>QR Scanner</span>
      </Button>
      <Button 
        variant="outline" 
        className="h-auto py-6 flex flex-col items-center gap-2"
        onClick={() => setAttendanceModalOpen(true)}
      >
        <ClipboardList className="h-5 w-5" />
        <span>Attendance</span>
      </Button>
      <Button 
        variant="outline" 
        className="h-auto py-6 flex flex-col items-center gap-2"
        onClick={() => setReportsModalOpen(true)}
      >
        <BarChart className="h-5 w-5" />
        <span>Reports</span>
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-seekup-blue" />
      </div>
    );
  }
  
  if (!user) return null;
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Organization Dashboard</h1>
          <p className="text-gray-600">Manage your events and volunteer coordination.</p>
        </div>
        <Button 
          className="bg-seekup-blue hover:bg-seekup-blue/90"
          onClick={() => setNewEventModalOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-500">Total Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-seekup-purple mr-3" />
              <div>
                <p className="text-3xl font-bold">{totalVolunteers}</p>
                <p className="text-sm text-gray-500">Last 30 days: +{Math.floor(totalVolunteers * 0.15)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-500">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-seekup-blue mr-3" />
              <div>
                <p className="text-3xl font-bold">{totalEvents}</p>
                <p className="text-sm text-gray-500">Active events: {upcomingEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-500">Impact Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart2 className="h-8 w-8 text-seekup-green mr-3" />
              <div>
                <p className="text-3xl font-bold">{impactHours}</p>
                <p className="text-sm text-gray-500">Last 30 days: +{Math.floor(impactHours * 0.2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Render updated Quick Actions */}
      {renderQuickActions()}
      
      {/* Events Tabs */}
      <Tabs 
        defaultValue="upcoming" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
        </div>
        
        {isEventsLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-seekup-blue" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-red-500 mb-4">Error loading events: {error}</p>
              <Button 
                onClick={fetchEvents} 
                className="bg-seekup-blue hover:bg-seekup-blue/90"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <TabsContent value="upcoming" className="space-y-4">
              <EventsList events={upcomingEvents} type="upcoming" onEventUpdated={fetchEvents} />
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4">
              <EventsList events={pastEvents} type="past" onEventUpdated={fetchEvents} />
            </TabsContent>
            
            <TabsContent value="drafts" className="space-y-4">
              {draftEvents.length > 0 ? (
                <EventsList events={draftEvents} type="drafts" onEventUpdated={fetchEvents} />
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">No draft events available.</p>
                    <Button 
                      className="mt-4 bg-seekup-blue hover:bg-seekup-blue/90"
                      onClick={() => setNewEventModalOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create New Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
      
      {/* Modals */}
      <NewEventModal 
        open={newEventModalOpen} 
        onClose={() => setNewEventModalOpen(false)} 
        onEventCreated={() => fetchEvents()}
      />
      
      <QrCheckInModal 
        open={qrCheckInModalOpen} 
        onClose={() => setQrCheckInModalOpen(false)} 
      />

      <VolunteerScannerModal
        open={qrScannerModalOpen}
        onClose={() => setQrScannerModalOpen(false)}
      />
      
      <AttendanceModal 
        open={attendanceModalOpen} 
        onClose={() => setAttendanceModalOpen(false)} 
      />
      
      <ReportsModal 
        open={reportsModalOpen} 
        onClose={() => setReportsModalOpen(false)} 
      />
    </DashboardLayout>
  );
};

export default OrganizationDashboard;
