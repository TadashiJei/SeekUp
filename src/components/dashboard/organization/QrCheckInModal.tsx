
import React, { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw, Loader2, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Event {
  id: string;
  title: string;
  start_time?: string;
  location?: string;
}

interface QrCheckInModalProps {
  open: boolean;
  onClose: () => void;
}

export function QrCheckInModal({ open, onClose }: QrCheckInModalProps) {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [qrValue, setQrValue] = useState<string>("");
  const qrRef = useRef<HTMLDivElement>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch events from Supabase when the modal opens
  useEffect(() => {
    if (open && user) {
      fetchEvents();
    }
  }, [open, user]);

  // Fetch events from the database
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      
      // Fetch events from Supabase where the organization_id matches the current user's id
      // or where the status is published (according to our RLS)
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_time, location')
        .order('start_time', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setEvents(data || []);
      
    } catch (error: any) {
      console.error("Error fetching events:", error);
      setFetchError(error.message);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate a JSON object for the selected event
  const generateQrValue = (eventId: string) => {
    // Find the selected event details
    const selectedEventDetails = events.find(event => event.id === eventId);
    
    if (!selectedEventDetails) return "";
    
    // Create a structured JSON object with event information
    const eventData = {
      eventId: selectedEventDetails.id,
      eventName: selectedEventDetails.title,
      timestamp: new Date().toISOString(),
      type: "event-check-in"
    };
    
    // Return the JSON string for the QR code
    return JSON.stringify(eventData);
  };

  // When an event is selected, generate the QR code value
  useEffect(() => {
    if (selectedEvent) {
      const newQrValue = generateQrValue(selectedEvent);
      setQrValue(newQrValue);
    } else {
      setQrValue("");
    }
  }, [selectedEvent]);

  // Refresh the QR code by generating a new unique token
  const handleRefreshQr = () => {
    if (selectedEvent) {
      const newQrValue = generateQrValue(selectedEvent);
      setQrValue(newQrValue);
      toast.info("QR code refreshed");
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Download the QR code as a PNG
  const handleDownload = () => {
    if (!selectedEvent) {
      toast.error("Please select an event first");
      return;
    }

    if (qrRef.current) {
      try {
        // Get the SVG element
        const svgElement = qrRef.current.querySelector("svg");
        if (!svgElement) {
          toast.error("Failed to find QR code element");
          return;
        }

        // Convert SVG to canvas for download
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        
        // Set canvas dimensions (with some padding)
        canvas.width = 300;
        canvas.height = 300;

        img.onload = () => {
          if (ctx) {
            // Fill background
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the QR code in the center
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Create a download link
            const a = document.createElement("a");
            const eventName = events.find(e => e.id === selectedEvent)?.title || "event";
            a.download = `qr-checkin-${eventName.toLowerCase().replace(/\s+/g, "-")}.png`;
            a.href = canvas.toDataURL("image/png");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            toast.success("QR Code downloaded successfully");
          }
        };

        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
      } catch (error) {
        console.error("Download failed:", error);
        toast.error("Failed to download QR code");
      }
    }
  };

  // Retry fetching events if there was an error
  const handleRetry = () => {
    fetchEvents();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Event QR Check-in</DialogTitle>
          <DialogDescription>
            Generate a QR code for volunteer check-in at your event.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-seekup-blue" />
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="text-red-500 mb-4">
                Failed to load events: {fetchError}
              </div>
              <Button onClick={handleRetry}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Select Event</label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        No events found
                      </div>
                    ) : (
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
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedEvent && qrValue && (
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-gray-50">
                  <div className="bg-white p-4 border rounded-lg shadow-sm mb-4" ref={qrRef}>
                    <QRCodeSVG 
                      value={qrValue}
                      size={200}
                      level="H" // High error correction capability
                      includeMargin={true}
                    />
                  </div>
                  
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    Volunteers can scan this QR code using the mobile app to check in to your event.
                  </p>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleRefreshQr}>
                      <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
                    </Button>
                    <Button size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                  </div>
                </div>
              )}
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
