
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  Share2,
  CalendarPlus,
  ArrowLeft,
  CheckCircle,
  Users,
  UserPlus,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock event data based on the EventsPage data
const eventsData = [
  {
    id: "1",
    title: "Coastal Clean-up Drive",
    organization: "Ocean Care PH",
    organizationLogo: "https://i.pravatar.cc/150?img=1",
    date: "April 15, 2025",
    time: "8:00 AM - 12:00 PM",
    location: "Manila Bay, Manila",
    image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f",
    category: "Environment",
    points: 3,
    description: "Join us in cleaning up Manila Bay and preserving our ocean ecosystems. This event aims to collect plastic waste and debris that harm marine life. We'll provide all necessary cleaning tools and safety equipment.",
    longDescription: "Marine pollution is a growing concern in the Philippines, affecting not just marine life but also local communities that rely on the ocean for their livelihood. By participating in this clean-up drive, you'll be directly contributing to the health of our oceans and raising awareness about proper waste disposal.\n\nWhat to bring: Comfortable clothes, hat, sunscreen, and water bottle. We'll provide gloves, trash bags, and other cleaning supplies.\n\nAll participants will receive a certificate and earn 3 SEEKUP points!",
    volunteerCount: 45,
    volunteerLimit: 100,
    requirements: [
      "Minimum age: 16 years old",
      "Must sign waiver form",
      "Bring own water bottle",
      "Wear comfortable clothes and closed shoes"
    ],
    location_details: {
      address: "Roxas Boulevard, Manila",
      meetingPoint: "Near the Baywalk area",
      coordinates: {
        lat: 14.5790,
        lng: 120.9795
      }
    },
    organizer_details: {
      name: "Ocean Care PH",
      description: "A non-profit organization dedicated to marine conservation and coastal protection in the Philippines.",
      founded: 2015,
      website: "https://oceancareph.org",
      phone: "+63 (2) 8123 4567",
      email: "info@oceancareph.org"
    }
  },
  {
    id: "2",
    title: "Book Reading for Kids",
    organization: "Education First Foundation",
    organizationLogo: "https://i.pravatar.cc/150?img=2",
    date: "April 22, 2025",
    time: "2:00 PM - 4:00 PM",
    location: "Public Library, Quezon City",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    category: "Education",
    points: 2,
    description: "Help inspire young minds through reading sessions at our local library.",
    longDescription: "Reading is fundamental to a child's development, and many children in our community don't have regular access to books or reading programs. By volunteering for this event, you'll be helping children develop crucial literacy skills while fostering a love for reading.\n\nVolunteers will be assigned to small groups of children (ages 5-10) and will read age-appropriate books, lead discussions, and help with simple reading-related activities.\n\nNo prior teaching experience is required! We'll provide a brief training session before the event starts. Your enthusiasm and patience are the most important qualities needed.",
    volunteerCount: 12,
    volunteerLimit: 20,
    requirements: [
      "Comfortable with children ages 5-10",
      "Basic English reading skills",
      "Patient and enthusiastic attitude"
    ],
    location_details: {
      address: "Quezon City Public Library, Quezon City",
      meetingPoint: "Main lobby",
      coordinates: {
        lat: 14.6500,
        lng: 121.0500
      }
    },
    organizer_details: {
      name: "Education First Foundation",
      description: "A foundation dedicated to improving access to quality education for all Filipino children.",
      founded: 2012,
      website: "https://educationfirstph.org",
      phone: "+63 (2) 8987 6543",
      email: "contact@educationfirstph.org"
    }
  },
  // Additional events would be here...
];

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Find the event with the matching id
  const event = eventsData.find((e) => e.id === id);
  
  // Handle case where event is not found
  if (!event) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
            <p className="mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Link to="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  const handleRegister = () => {
    setIsRegistered(true);
    toast({
      title: "Registration Successful!",
      description: `You've registered for ${event.title}. Check your email for details.`,
    });
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this volunteer event: ${event.title}`,
        url: window.location.href,
      });
    } else {
      toast({
        title: "Link Copied!",
        description: "Event link copied to clipboard.",
      });
      navigator.clipboard.writeText(window.location.href);
    }
  };
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/events" className="inline-flex items-center text-gray-600 hover:text-seekup-blue mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Events
        </Link>
        
        {/* Event Header */}
        <div className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden mb-8">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6 text-white w-full">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-seekup-blue hover:bg-seekup-blue/90">
                  {event.category}
                </Badge>
                <Badge variant="outline" className="text-white border-white">
                  {event.points} Points
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center">
                <img 
                  src={event.organizationLogo} 
                  alt={event.organization} 
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span>{event.organization}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <p className="text-gray-700 mb-6">{event.description}</p>
              <div className="whitespace-pre-line text-gray-600">
                {event.longDescription}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {event.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">About The Organizer</h2>
              <div className="flex items-center mb-4">
                <img 
                  src={event.organizationLogo} 
                  alt={event.organization} 
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium">{event.organizer_details.name}</h3>
                  <p className="text-sm text-gray-500">Founded in {event.organizer_details.founded}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                {event.organizer_details.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <a 
                  href={event.organizer_details.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-seekup-blue hover:underline"
                >
                  Visit Website
                </a>
                <span>Phone: {event.organizer_details.phone}</span>
                <a 
                  href={`mailto:${event.organizer_details.email}`}
                  className="text-seekup-blue hover:underline"
                >
                  {event.organizer_details.email}
                </a>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-20">
              <div className="flex justify-between mb-6">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                >
                  <CalendarPlus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-seekup-blue mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Date & Time</h3>
                    <p className="text-gray-600 text-sm">{event.date}</p>
                    <p className="text-gray-600 text-sm">{event.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-seekup-blue mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-600 text-sm">{event.location}</p>
                    <p className="text-gray-600 text-sm">{event.location_details.meetingPoint}</p>
                    <p className="text-gray-600 text-sm">{event.location_details.address}</p>
                    <a 
                      href={`https://www.google.com/maps?q=${event.location_details.coordinates.lat},${event.location_details.coordinates.lng}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-seekup-blue hover:underline mt-1 inline-block"
                    >
                      View on map
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Award className="h-5 w-5 text-seekup-blue mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Points</h3>
                    <p className="text-gray-600 text-sm">Earn {event.points} points for participating</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-seekup-blue mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Participants</h3>
                    <p className="text-gray-600 text-sm">
                      {event.volunteerCount} / {event.volunteerLimit} volunteers registered
                    </p>
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-seekup-green" 
                        style={{ width: `${(event.volunteerCount / event.volunteerLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {isRegistered ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center bg-green-50 text-green-600 py-3 rounded-md">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    You're registered!
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsRegistered(false)}
                  >
                    Cancel Registration
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-seekup-blue hover:bg-seekup-blue/90">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register as Volunteer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register for {event.title}</DialogTitle>
                        <DialogDescription>
                          Please confirm your registration for this event.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-amber-500 mr-2" />
                          <div className="text-sm">
                            <p className="font-medium">Important Information</p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1">
                              <li>Please arrive 15 minutes before the start time</li>
                              <li>Bring valid ID for verification</li>
                              <li>Check your email for confirmation details</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" className="w-full sm:w-auto">
                          Cancel
                        </Button>
                        <Button 
                          className="w-full sm:w-auto bg-seekup-blue hover:bg-seekup-blue/90"
                          onClick={handleRegister}
                        >
                          Confirm Registration
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center text-xs text-gray-500">
                          <span className="flex items-center justify-center">
                            <Info className="h-3 w-3 mr-1" />
                            Verified Event
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This event is verified by SEEKUP as legitimate and safe.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default EventDetail;
