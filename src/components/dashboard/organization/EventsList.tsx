
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Users, ArrowUpRight, Check, AlertTriangle, CalendarX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

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

interface EventsListProps {
  events: Event[];
  type: "upcoming" | "past" | "drafts";
  onEventUpdated: () => void;
}

export function EventsList({ events, type, onEventUpdated }: EventsListProps) {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [isManaging, setIsManaging] = useState<string | null>(null);
  const [showVolunteers, setShowVolunteers] = useState<string | null>(null);
  const [volunteersData, setVolunteersData] = useState<any[]>([]);
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(false);

  const handleManageEvent = (eventId: string) => {
    setIsManaging(eventId);
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/events/${eventId}/edit`);
    // This would normally navigate to the event edit page
    // For now we'll just close the dialog and log
    console.log(`Editing event: ${eventId}`);
    setIsManaging(null);
  };

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
    // This would normally navigate to the event view page
    // For now we'll just close the dialog and log
    console.log(`Viewing event: ${eventId}`);
    setIsManaging(null);
  };

  const handleCancelEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', eventId);

      if (error) {
        throw error;
      }

      toast.success("Event cancelled successfully");
      setIsManaging(null);
      onEventUpdated();
    } catch (error: any) {
      console.error("Error cancelling event:", error);
      toast.error(`Failed to cancel event: ${error.message}`);
    }
  };

  const handleViewVolunteers = async (eventId: string) => {
    setIsLoadingVolunteers(true);
    setShowVolunteers(eventId);
    
    try {
      // This would normally fetch volunteer data from the backend
      // For now we're using mock data
      // In a real app, you would query a volunteers or registrations table
      const mockVolunteers = [
        { id: "1", name: "John Doe", email: "john@example.com", hours: 4, status: "Confirmed" },
        { id: "2", name: "Jane Smith", email: "jane@example.com", hours: 5, status: "Confirmed" },
        { id: "3", name: "Bob Johnson", email: "bob@example.com", hours: 0, status: "Pending" },
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setVolunteersData(mockVolunteers);
        setIsLoadingVolunteers(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      toast.error("Failed to load volunteer data");
      setIsLoadingVolunteers(false);
    }
  };

  const handleViewReport = (eventId: string) => {
    console.log(`Viewing report for event: ${eventId}`);
    // In a real app, navigate to event report page
  };

  const handleDuplicateEvent = async (eventId: string) => {
    try {
      // First get the event to duplicate
      const { data: eventToDuplicate, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!eventToDuplicate) {
        throw new Error("Event not found");
      }

      // Create a new event based on the duplicate
      const { data: newEvent, error: insertError } = await supabase
        .from('events')
        .insert({
          title: `Copy of ${eventToDuplicate.title}`,
          description: eventToDuplicate.description,
          location: eventToDuplicate.location,
          start_time: eventToDuplicate.start_time,
          end_time: eventToDuplicate.end_time,
          organization_id: eventToDuplicate.organization_id,
          image_url: eventToDuplicate.image_url,
          max_volunteers: eventToDuplicate.max_volunteers,
          status: 'draft'
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast.success("Event duplicated successfully");
      onEventUpdated();
    } catch (error: any) {
      console.error("Error duplicating event:", error);
      toast.error(`Failed to duplicate event: ${error.message}`);
    }
  };

  const handlePublishEvent = async (eventId: string) => {
    setIsPublishing(eventId);
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'published' })
        .eq('id', eventId);
        
      if (error) {
        throw error;
      }
      
      toast.success("Event published successfully");
      setIsPublishing(null);
      onEventUpdated();
    } catch (error: any) {
      console.error("Error publishing event:", error);
      toast.error(`Failed to publish event: ${error.message}`);
      setIsPublishing(null);
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            {type === "upcoming" ? "No upcoming events available." : 
             type === "past" ? "No past events available." : 
             "No draft events available."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                </div>
                {type === "upcoming" ? (
                  <Badge>Upcoming</Badge>
                ) : type === "past" ? (
                  <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> 
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="outline">Draft</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {type === "upcoming" && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Registration Progress</span>
                      <span className="font-medium">{event.volunteers}/{event.maxVolunteers}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-seekup-blue" 
                        style={{ width: `${(event.volunteers / event.maxVolunteers) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {type === "past" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Volunteers</p>
                      <p className="text-lg font-medium">{event.volunteers}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Impact Hours</p>
                      <p className="text-lg font-medium">{event.impact?.hours}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  {type === "upcoming" && (
                    <>
                      <Button 
                        className="flex-1 bg-seekup-blue hover:bg-seekup-blue/90"
                        onClick={() => handleManageEvent(event.id)}
                      >
                        Manage
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewVolunteers(event.id)}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Volunteers
                      </Button>
                    </>
                  )}
                  
                  {type === "past" && (
                    <>
                      <Button 
                        className="flex-1 bg-seekup-green hover:bg-seekup-green/90"
                        onClick={() => handleViewReport(event.id)}
                      >
                        View Report
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleDuplicateEvent(event.id)}
                      >
                        Duplicate
                      </Button>
                    </>
                  )}
                  
                  {type === "drafts" && (
                    <>
                      <Button 
                        className="flex-1 bg-seekup-blue hover:bg-seekup-blue/90"
                        onClick={() => handleEditEvent(event.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handlePublishEvent(event.id)}
                        disabled={isPublishing === event.id}
                      >
                        {isPublishing === event.id ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span> 
                            Publishing...
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Publish
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Event Management Dialog */}
      <Dialog open={!!isManaging} onOpenChange={() => setIsManaging(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Event</DialogTitle>
            <DialogDescription>
              What would you like to do with this event?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              className="w-full bg-seekup-blue hover:bg-seekup-blue/90"
              onClick={() => isManaging && handleEditEvent(isManaging)}
            >
              Edit Event Details
            </Button>
            <Button
              className="w-full"
              onClick={() => isManaging && handleViewEvent(isManaging)}
              variant="outline"
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              View Event Page
            </Button>
            <Button
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => isManaging && handleCancelEvent(isManaging)}
              variant="destructive"
            >
              <CalendarX className="mr-2 h-4 w-4" />
              Cancel Event
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsManaging(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Volunteers Dialog */}
      <Dialog open={!!showVolunteers} onOpenChange={() => setShowVolunteers(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Event Volunteers</DialogTitle>
            <DialogDescription>
              Manage volunteers for this event
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingVolunteers ? (
            <div className="flex justify-center items-center py-10">
              <span className="animate-spin mr-2">⟳</span>
              <span>Loading volunteer data...</span>
            </div>
          ) : (
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteersData.length > 0 ? (
                    volunteersData.map((volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell>{volunteer.name}</TableCell>
                        <TableCell>{volunteer.email}</TableCell>
                        <TableCell>
                          {volunteer.status === "Confirmed" ? (
                            <Badge className="bg-green-100 text-green-700">
                              <Check className="mr-1 h-3 w-3" /> 
                              Confirmed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <AlertTriangle className="mr-1 h-3 w-3" /> 
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{volunteer.hours}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No volunteers have registered for this event yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setShowVolunteers(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
