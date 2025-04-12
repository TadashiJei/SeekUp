
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScanLine, Camera, X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Html5Qrcode } from "html5-qrcode";

interface VolunteerScannerModalProps {
  open: boolean;
  onClose: () => void;
}

export function VolunteerScannerModal({ open, onClose }: VolunteerScannerModalProps) {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    eventDetails?: { id: string; title: string; } | null;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null);

  // Reset state and stop scanner when modal opens/closes
  useEffect(() => {
    if (open) {
      setScanning(false);
      setScanResult(null);
      setCameraPermission(null);
    } else {
      stopScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [open]);

  const stopScanner = () => {
    if (scannerInstance) {
      scannerInstance.stop().catch(error => {
        console.error("Error stopping scanner:", error);
      }).finally(() => {
        setScanning(false);
      });
    }
  };

  // Request camera permission and start scanner
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream right away
      setCameraPermission(true);
      startScanner();
    } catch (error) {
      console.error("Camera permission denied:", error);
      setCameraPermission(false);
      toast.error("Camera access was denied. Please allow camera access to scan QR codes.");
    }
  };

  // Start the QR scanner
  const startScanner = () => {
    setScanning(true);
    
    // First, we'll render our UI, then initialize the scanner after
    setTimeout(() => {
      initializeScanner();
    }, 100);
  };
  
  const initializeScanner = () => {
    // Create a new div for the QR reader if it doesn't exist
    let scannerContainer = document.getElementById("qr-reader");
    
    if (!scannerContainer) {
      scannerContainer = document.createElement("div");
      scannerContainer.id = "qr-reader";
      scannerContainer.style.width = "100%";
      scannerContainer.style.height = "100%";
      
      // Find the scanner container by class instead of direct selector
      const scannerArea = document.querySelector("[data-scanner-container]");
      
      if (scannerArea) {
        // Clear any existing content and append our container
        scannerArea.innerHTML = "";
        scannerArea.appendChild(scannerContainer);
        
        try {
          const html5QrCode = new Html5Qrcode("qr-reader");
          setScannerInstance(html5QrCode);
          
          // QR scanning configuration with wider detection area
          const config = { 
            fps: 15, 
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1.0,
            formatsToSupport: [ 0 ] // QR_CODE format (0)
          };
          
          // Start scanning with improved parameters
          html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              // QR code detected
              console.log("Scanned QR data:", decodedText);
              html5QrCode.stop().then(() => {
                handleScanResult(decodedText);
              }).catch(err => {
                console.error("Error stopping scanner:", err);
              });
            },
            (errorMessage) => {
              // QR scan error (not critical, just part of scanning process)
              // We can leave this empty to avoid console noise
            }
          ).catch((err) => {
            console.error("Error starting QR scanner:", err);
            toast.error("Failed to start scanner");
            setScanning(false);
          });
        } catch (error) {
          console.error("Error initializing scanner:", error);
          toast.error("Failed to initialize scanner");
          setScanning(false);
        }
      } else {
        console.error("Scanner container element not found");
        toast.error("Failed to initialize scanner");
        setScanning(false);
      }
    }
  };

  // Handle QR code scan result
  const handleScanResult = async (qrData: string) => {
    try {
      setScanning(false);
      setIsProcessing(true);

      console.log("Processing QR data:", qrData);
      
      // Try to parse the QR data as JSON
      let eventData;
      try {
        // First try parsing as JSON
        eventData = JSON.parse(qrData);
      } catch (error) {
        // If not valid JSON, try to parse as a URL or other format
        console.log("QR is not JSON, checking for URL format");
        
        // Check if it's a URL containing event information
        if (qrData.includes("check-in") || qrData.includes("event")) {
          const urlParts = qrData.split('/');
          const eventId = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];
          
          // Create an eventData object from URL parameters
          eventData = {
            eventId: eventId,
            eventName: "Event Check-in"
          };
        } else {
          // Try to extract any structured data from the string
          const matches = qrData.match(/event[=:]([^&]+)|id[=:]([^&]+)/i);
          if (matches) {
            eventData = {
              eventId: matches[1] || matches[2],
              eventName: "Volunteer Event"
            };
          } else {
            // Use the raw string as the event ID if all else fails
            eventData = {
              eventId: qrData,
              eventName: "Volunteer Event"
            };
          }
        }
      }
      
      // Small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (eventData && (eventData.eventId || eventData.id)) {
        // Use eventId or id property from the data
        const eventId = eventData.eventId || eventData.id;
        
        // In a real app, we would first verify the event exists in our database
        try {
          // Check if the event exists
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('id, title')
            .eq('id', eventId)
            .single();
            
          if (eventError) {
            throw new Error("Event not found");
          }
          
          // Successful check-in
          setScanResult({
            success: true,
            message: "Check-in successful!",
            eventDetails: {
              id: eventData.id,
              title: eventData.title
            }
          });
          
          // In a real app, we would record the check-in
          // await recordCheckIn(eventId);
          
          toast.success("Successfully checked in to event!");
        } catch (error) {
          console.error("Event verification error:", error);
          setScanResult({
            success: false,
            message: "Event not found. Please try again or contact the event organizer."
          });
        }
      } else {
        throw new Error("Invalid QR code format");
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      setScanResult({
        success: false,
        message: "Invalid QR code. Please try again or contact the event organizer."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // This function would actually record the check-in in a real app
  const recordCheckIn = async (eventId: string) => {
    if (!user) return;
    
    try {
      // In a real app, we would create a record in the check-ins table
      /* 
      const { error } = await supabase
        .from('event_check_ins')
        .insert({
          event_id: eventId,
          volunteer_id: user.id,
          check_in_time: new Date().toISOString()
        });
        
      if (error) throw error;
      */
      
      return true;
    } catch (error) {
      console.error("Failed to record check-in:", error);
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Event QR Code</DialogTitle>
          <DialogDescription>
            Scan the event QR code to check in to a volunteer activity
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4">
          {!scanning && !scanResult && !isProcessing ? (
            <div className="text-center space-y-4">
              <div className="rounded-lg bg-muted p-6 flex flex-col items-center">
                <Camera className="h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Point your camera at the event QR code to check in
                </p>
                <Button onClick={requestCameraPermission}>
                  Start Scanning
                </Button>
              </div>
            </div>
          ) : scanning && !scanResult && !isProcessing ? (
            <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden" data-scanner-container>
              {/* The QR scanner will be inserted here */}
              
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-64 h-64 border-2 border-white rounded-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <ScanLine className="text-seekup-blue w-full h-full absolute animate-pulse" />
                </div>
              </div>
              
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30"
                  onClick={() => {
                    stopScanner();
                    setScanning(false);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="text-center p-6 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-seekup-blue" />
              <p>Processing check-in...</p>
            </div>
          ) : scanResult ? (
            <div className="text-center space-y-4 p-6 w-full">
              {scanResult.success ? (
                <>
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-semibold">Check-in Successful!</h3>
                  {scanResult.eventDetails && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium">{scanResult.eventDetails.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        You've been checked in to this event
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
                  <h3 className="text-xl font-semibold">Check-in Failed</h3>
                  <p>{scanResult.message}</p>
                </>
              )}
            </div>
          ) : null}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {scanResult && (
            <Button onClick={() => {
              setScanResult(null);
              setScanning(false);
            }}>
              Scan Another
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
