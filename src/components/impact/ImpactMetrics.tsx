
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import * as RechartsPrimitive from "recharts";
import {
  Users,
  Clock,
  MapPin,
  Calendar,
  TreePine,
  Trash2,
  School,
  Heart
} from "lucide-react";

// Sample metrics data - in a real app, this would come from the database
const impactData = {
  totalVolunteers: 3580,
  totalHours: 43760,
  communitiesServed: 78,
  eventsCompleted: 235,
  categoriesData: [
    { name: "Environment", value: 35 },
    { name: "Education", value: 25 },
    { name: "Health", value: 20 },
    { name: "Disaster Relief", value: 10 },
    { name: "Community Dev", value: 10 }
  ],
  monthlyHours: [
    { name: "Jan", hours: 2800 },
    { name: "Feb", hours: 3200 },
    { name: "Mar", hours: 3800 },
    { name: "Apr", hours: 4200 },
    { name: "May", hours: 3900 },
    { name: "Jun", hours: 4500 }
  ],
  impactByRegion: [
    { name: "Metro Manila", hours: 12500 },
    { name: "Cebu", hours: 8700 },
    { name: "Davao", hours: 7300 },
    { name: "Iloilo", hours: 6200 },
    { name: "Baguio", hours: 5400 }
  ],
  specificImpacts: {
    trees: 12500,
    waste: "23.5 tons",
    students: 4800,
    families: 1250
  }
};

const ImpactMetrics = () => {
  return (
    <div className="space-y-8">
      {/* Overview stats */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Community Impact Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Users className="h-8 w-8 text-seekup-blue mb-2" />
              <p className="text-3xl font-bold">{impactData.totalVolunteers.toLocaleString()}</p>
              <p className="text-gray-600 text-sm">Total Volunteers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Clock className="h-8 w-8 text-seekup-purple mb-2" />
              <p className="text-3xl font-bold">{impactData.totalHours.toLocaleString()}</p>
              <p className="text-gray-600 text-sm">Volunteer Hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <MapPin className="h-8 w-8 text-seekup-green mb-2" />
              <p className="text-3xl font-bold">{impactData.communitiesServed}</p>
              <p className="text-gray-600 text-sm">Communities Served</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Calendar className="h-8 w-8 text-seekup-red mb-2" />
              <p className="text-3xl font-bold">{impactData.eventsCompleted}</p>
              <p className="text-gray-600 text-sm">Events Completed</p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Hours by Month</CardTitle>
            <CardDescription>
              Total volunteer hours contributed over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{hours: {color: "blue"}}} className="h-72">
              <RechartsPrimitive.LineChart data={impactData.monthlyHours}>
                <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                <RechartsPrimitive.XAxis dataKey="name" />
                <RechartsPrimitive.YAxis />
                <RechartsPrimitive.Tooltip formatter={(value) => [`${value.toLocaleString()} hrs`, 'Hours']} />
                <RechartsPrimitive.Line type="monotone" dataKey="hours" stroke="#8884d8" />
              </RechartsPrimitive.LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Event Categories</CardTitle>
            <CardDescription>
              Distribution of volunteer events by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{value: {color: "purple"}}} className="h-72">
              <RechartsPrimitive.PieChart>
                <RechartsPrimitive.Pie 
                  data={impactData.categoriesData} 
                  nameKey="name" 
                  dataKey="value" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  fill="#8884d8"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {impactData.categoriesData.map((entry, index) => (
                    <RechartsPrimitive.Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                  ))}
                </RechartsPrimitive.Pie>
                <RechartsPrimitive.Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </RechartsPrimitive.PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>
      
      {/* Regional impact */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Impact by Region</CardTitle>
            <CardDescription>
              Distribution of volunteer hours across different regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{hours: {color: "purple"}}} className="h-80">
              <RechartsPrimitive.BarChart data={impactData.impactByRegion}>
                <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                <RechartsPrimitive.XAxis dataKey="name" />
                <RechartsPrimitive.YAxis />
                <RechartsPrimitive.Tooltip formatter={(value) => [`${value.toLocaleString()} hrs`, 'Hours']} />
                <RechartsPrimitive.Bar dataKey="hours" fill="#8884d8" />
              </RechartsPrimitive.BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>
      
      {/* Specific impact metrics */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Specific Impact Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <TreePine className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-3xl font-bold">{impactData.specificImpacts.trees.toLocaleString()}</p>
              <p className="text-gray-600 text-sm">Trees Planted</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Trash2 className="h-8 w-8 text-orange-600 mb-2" />
              <p className="text-3xl font-bold">{impactData.specificImpacts.waste}</p>
              <p className="text-gray-600 text-sm">Waste Collected</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <School className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-3xl font-bold">{impactData.specificImpacts.students.toLocaleString()}</p>
              <p className="text-gray-600 text-sm">Students Educated</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Heart className="h-8 w-8 text-red-600 mb-2" />
              <p className="text-3xl font-bold">{impactData.specificImpacts.families.toLocaleString()}</p>
              <p className="text-gray-600 text-sm">Families Supported</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ImpactMetrics;
