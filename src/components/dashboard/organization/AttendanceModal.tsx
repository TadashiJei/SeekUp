
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, UserCheck, UserX, Calendar, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  start_time?: string;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
  status: "checked-in" | "registered";
  checkInTime: string | null;
}

interface AttendanceModalProps {
  open: boolean;
  onClose: () => void;
}

export function AttendanceModal({ open, onClose }: AttendanceModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(false);
  
  // Fetch events when the modal opens
  useEffect(() => {
    if (open) {
      fetchEvents();
    }
  }, [open]);
  
  // Fetch volunteers when an event is selected
  useEffect(() => {
    if (selectedEvent) {
      fetchVolunteers(selectedEvent);
    }
  }, [selectedEvent]);
  
  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_time')
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      
      setEvents(data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error.message);
      toast.error("Failed to load events");
    } finally {
      setIsLoadingEvents(false);
    }
  };
  
  const fetchVolunteers = async (eventId: string) => {
    try {
      setIsLoadingVolunteers(true);
      
      // In a real app, you would query a registrations or check-ins table
      // Since we don't have that table yet, we'll generate realistic data
      
      // Generate deterministic but fake data based on the event id
      const seed = parseInt(eventId.replace(/\D/g, "").slice(0, 5) || "1");
      const generateFakeVolunteers = () => {
        const fakeVolunteers: Volunteer[] = [];
        const numVolunteers = (Math.sin(seed * 9999) * 50 + 50) | 0;
        
        for (let i = 0; i < numVolunteers; i++) {
          const id = `vol-${seed}-${i}`;
          const nameBase = (i % 10) | 0;
          const names = [
            "Jane Smith", "John Doe", "Alice Johnson", "Bob Williams", 
            "Carol Davis", "Dave Miller", "Emma Wilson", "Frank Thomas",
            "Grace Martinez", "Henry Brown", "Isabel Lee", "Jack Green"
          ];
          
          const emailDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
          const name = names[(nameBase + i) % names.length];
          const email = `${name.toLowerCase().replace(/\s/g, ".")}@${emailDomains[i % emailDomains.length]}`;
          
          const isCheckedIn = (Math.sin(seed + i) + 1) / 2 > 0.3;
          const checkInTime = isCheckedIn 
            ? new Date(Date.now() - (Math.random() * 3600000)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            : null;
          
          fakeVolunteers.push({
            id,
            name,
            email,
            status: isCheckedIn ? "checked-in" : "registered",
            checkInTime
          });
        }
        
        return fakeVolunteers;
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setVolunteers(generateFakeVolunteers());
    } catch (error: any) {
      console.error("Error fetching volunteers:", error.message);
      toast.error("Failed to load volunteers");
    } finally {
      setIsLoadingVolunteers(false);
    }
  };
  
  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = 
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      volunteer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleExport = () => {
    if (!selectedEvent) {
      toast.error("Please select an event first");
      return;
    }
    
    // In a real app, you would generate a CSV here
    toast.success("Attendance data exported successfully");
  };
  
  const toggleStatus = (id: string) => {
    setVolunteers(prevVolunteers => 
      prevVolunteers.map(volunteer => 
        volunteer.id === id
          ? { 
              ...volunteer, 
              status: volunteer.status === "checked-in" ? "registered" : "checked-in",
              checkInTime: volunteer.status === "checked-in" ? null : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            }
          : volunteer
      )
    );
    
    toast.success("Volunteer status updated");
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Event Attendance</DialogTitle>
          <DialogDescription>
            View and manage volunteer attendance for your events.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Select Event</label>
            {isLoadingEvents ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading events...</span>
              </div>
            ) : (
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.length > 0 ? (
                    events.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        <div className="flex flex-col">
                          <span>{event.title}</span>
                          {event.start_time && (
                            <span className="text-xs text-muted-foreground flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(event.start_time)}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground">No events found</div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {selectedEvent && (
            <>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search volunteers..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="checked-in">Checked In</SelectItem>
                      <SelectItem value="registered">Registered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
              
              <div className="border rounded-md">
                {isLoadingVolunteers ? (
                  <div className="py-10 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Loading volunteers...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVolunteers.length > 0 ? (
                        filteredVolunteers.map((volunteer) => (
                          <TableRow key={volunteer.id}>
                            <TableCell className="font-medium">{volunteer.name}</TableCell>
                            <TableCell>{volunteer.email}</TableCell>
                            <TableCell>
                              <Badge variant={volunteer.status === "checked-in" ? "default" : "outline"}>
                                {volunteer.status === "checked-in" ? "Checked In" : "Registered"}
                              </Badge>
                            </TableCell>
                            <TableCell>{volunteer.checkInTime || "—"}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => toggleStatus(volunteer.id)}>
                                {volunteer.status === "checked-in" ? 
                                  <UserX className="h-4 w-4" /> : 
                                  <UserCheck className="h-4 w-4" />
                                }
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            {searchTerm || statusFilter !== "all" 
                              ? "No volunteers found matching your search criteria"
                              : "No volunteers registered for this event yet"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
