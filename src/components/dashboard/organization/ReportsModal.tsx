
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Cell, XAxis, YAxis, Bar, ResponsiveContainer, PieChart, Pie, Legend, Tooltip } from "recharts";
import { Download, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  start_time?: string;
}

interface AttendanceData {
  name: string;
  value: number;
}

interface DemographicsData {
  name: string;
  value: number;
}

interface ImpactData {
  name: string;
  hours: number;
}

interface ReportsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReportsModal({ open, onClose }: ReportsModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [reportType, setReportType] = useState<string>("attendance");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  
  // Data state
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([
    { name: 'Registered', value: 0 },
    { name: 'Checked In', value: 0 },
    { name: 'No Show', value: 0 },
  ]);
  const [demographicsData, setDemographicsData] = useState<DemographicsData[]>([]);
  const [impactData, setImpactData] = useState<ImpactData[]>([]);
  const [totalStats, setTotalStats] = useState({
    registered: 0,
    checkInRate: 0,
    noShowRate: 0,
    totalHours: 0,
    avgHours: 0,
    impactScore: 0,
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Fetch events when the modal opens
  useEffect(() => {
    if (open) {
      fetchEvents();
    }
  }, [open]);
  
  // Fetch event data when an event is selected
  useEffect(() => {
    if (selectedEvent) {
      fetchReportData(selectedEvent, reportType);
    }
  }, [selectedEvent, reportType]);
  
  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_time')
        .order('start_time', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setEvents(data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error.message);
      toast.error("Failed to load events");
    } finally {
      setIsLoadingEvents(false);
    }
  };
  
  const fetchReportData = async (eventId: string, reportType: string) => {
    try {
      setIsLoadingReport(true);
      
      // Simulated data for now - in a real app you would fetch this from your database
      // For example, you could have a registrations or check-ins table
      
      // Generate some realistic random data based on the event id
      const seed = parseInt(eventId.replace(/\D/g, "").slice(0, 5) || "1");
      const random = (min: number, max: number) => Math.floor((Math.sin(seed * 9999) + 1) * (max - min) / 2) + min;
      
      // Randomize between 30-100 registrations
      const registered = random(30, 100);
      const checkedIn = Math.floor(registered * random(50, 90) / 100);
      const noShow = registered - checkedIn;
      
      // Set attendance data
      setAttendanceData([
        { name: 'Registered', value: registered },
        { name: 'Checked In', value: checkedIn },
        { name: 'No Show', value: noShow },
      ]);
      
      // Calculate stats
      const checkInRate = Math.round((checkedIn / registered) * 100);
      const noShowRate = Math.round((noShow / registered) * 100);
      
      // Set demographics data - age distribution
      setDemographicsData([
        { name: '18-24', value: random(5, 30) },
        { name: '25-34', value: random(10, 35) },
        { name: '35-44', value: random(10, 25) },
        { name: '45-54', value: random(5, 20) },
        { name: '55+', value: random(5, 15) },
      ]);
      
      // Set impact data - hours by week
      const totalHours = random(250, 600);
      const weeksData: ImpactData[] = [
        { name: 'Week 1', hours: random(40, 120) },
        { name: 'Week 2', hours: random(60, 140) },
        { name: 'Week 3', hours: random(50, 130) },
        { name: 'Week 4', hours: random(70, 150) },
      ];
      setImpactData(weeksData);
      
      // Update total stats
      setTotalStats({
        registered,
        checkInRate,
        noShowRate,
        totalHours,
        avgHours: Math.round((totalHours / checkedIn) * 10) / 10,
        impactScore: random(70, 98),
      });
    } catch (error: any) {
      console.error("Error fetching report data:", error.message);
      toast.error("Failed to load report data");
    } finally {
      setIsLoadingReport(false);
    }
  };
  
  const handleExport = () => {
    if (!selectedEvent) {
      toast.error("Please select an event first");
      return;
    }
    
    // In a real app, you would generate a CSV or PDF here
    toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report exported successfully`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Event Reports</DialogTitle>
          <DialogDescription>
            Generate and view reports for your events.
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
                              {new Date(event.start_time).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
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
              <Tabs defaultValue="attendance" value={reportType} onValueChange={setReportType}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="demographics">Demographics</TabsTrigger>
                  <TabsTrigger value="impact">Impact</TabsTrigger>
                </TabsList>
                
                {isLoadingReport ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Loading report data...</span>
                  </div>
                ) : (
                  <>
                    <TabsContent value="attendance" className="pt-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Attendance Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={attendanceData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={true}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {attendanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="bg-slate-100 p-4 rounded-lg text-center">
                              <p className="text-sm text-gray-500">Total Registered</p>
                              <p className="text-2xl font-bold">{totalStats.registered}</p>
                            </div>
                            <div className="bg-slate-100 p-4 rounded-lg text-center">
                              <p className="text-sm text-gray-500">Check-in Rate</p>
                              <p className="text-2xl font-bold">{totalStats.checkInRate}%</p>
                            </div>
                            <div className="bg-slate-100 p-4 rounded-lg text-center">
                              <p className="text-sm text-gray-500">No-show Rate</p>
                              <p className="text-2xl font-bold">{totalStats.noShowRate}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="demographics" className="pt-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Volunteer Demographics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={demographicsData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8">
                                  {demographicsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="impact" className="pt-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Impact Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={impactData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="hours" fill="#00C49F" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="bg-slate-100 p-4 rounded-lg text-center">
                              <p className="text-sm text-gray-500">Total Hours</p>
                              <p className="text-2xl font-bold">{totalStats.totalHours}</p>
                            </div>
                            <div className="bg-slate-100 p-4 rounded-lg text-center">
                              <p className="text-sm text-gray-500">Avg. Hours/Volunteer</p>
                              <p className="text-2xl font-bold">{totalStats.avgHours}</p>
                            </div>
                            <div className="bg-slate-100 p-4 rounded-lg text-center">
                              <p className="text-sm text-gray-500">Impact Score</p>
                              <p className="text-2xl font-bold">{totalStats.impactScore}/100</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
                )}
              </Tabs>
              
              <div className="flex justify-end">
                <Button onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" /> Export Report
                </Button>
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
