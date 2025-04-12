
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Calendar, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample leaderboard data - in a real app, this would come from the database
const leaderboardData = [
  {
    id: "1",
    rank: 1,
    name: "Maria Santos",
    hours: 120,
    events: 15,
    avatar: "https://i.pravatar.cc/150?img=29",
    location: "Metro Manila",
    badges: ["gold", "silver", "silver", "bronze"]
  },
  {
    id: "2",
    rank: 2,
    name: "Juan Reyes",
    hours: 105,
    events: 12,
    avatar: "https://i.pravatar.cc/150?img=12",
    location: "Cebu",
    badges: ["silver", "silver", "bronze"]
  },
  {
    id: "3",
    rank: 3,
    name: "Anna Cruz",
    hours: 98,
    events: 14,
    avatar: "https://i.pravatar.cc/150?img=31",
    location: "Metro Manila",
    badges: ["silver", "bronze", "bronze"]
  },
  {
    id: "4",
    rank: 4,
    name: "Marco Silva",
    hours: 85,
    events: 10,
    avatar: "https://i.pravatar.cc/150?img=42",
    location: "Davao",
    badges: ["silver", "bronze"]
  },
  {
    id: "5",
    rank: 5,
    name: "Elena Lim",
    hours: 78,
    events: 9,
    avatar: "https://i.pravatar.cc/150?img=32",
    location: "Iloilo",
    badges: ["silver", "bronze"]
  },
  {
    id: "6",
    rank: 6,
    name: "Miguel Torres",
    hours: 72,
    events: 8,
    avatar: "https://i.pravatar.cc/150?img=18",
    location: "Baguio",
    badges: ["bronze", "bronze"]
  },
  {
    id: "7",
    rank: 7,
    name: "Sofia Garcia",
    hours: 65,
    events: 7,
    avatar: "https://i.pravatar.cc/150?img=25",
    location: "Metro Manila",
    badges: ["bronze"]
  },
  {
    id: "8",
    rank: 8,
    name: "Luis Mendoza",
    hours: 60,
    events: 6,
    avatar: "https://i.pravatar.cc/150?img=61",
    location: "Cebu",
    badges: ["bronze"]
  },
  {
    id: "9",
    rank: 9,
    name: "Carmen Reyes",
    hours: 55,
    events: 6,
    avatar: "https://i.pravatar.cc/150?img=23",
    location: "Davao",
    badges: ["bronze"]
  },
  {
    id: "10",
    rank: 10,
    name: "Antonio Diaz",
    hours: 52,
    events: 5,
    avatar: "https://i.pravatar.cc/150?img=53",
    location: "Metro Manila",
    badges: ["bronze"]
  }
];

type TimeFrame = "all" | "month" | "quarter" | "year";
type Region = "all" | "Metro Manila" | "Cebu" | "Davao" | "Iloilo" | "Baguio";

const VolunteerLeaderboard = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("all");
  const [region, setRegion] = useState<Region>("all");
  
  // In a real app, these filters would be applied to a database query
  // Here we're just simulating it by filtering the static data
  const filteredLeaderboard = leaderboardData.filter(volunteer => {
    const matchesRegion = region === "all" || volunteer.location === region;
    return matchesRegion;
  });
  
  const getBadgeColor = (level: string) => {
    switch (level) {
      case "gold":
        return "bg-yellow-400";
      case "silver":
        return "bg-slate-400";
      case "bronze":
        return "bg-amber-600";
      default:
        return "bg-gray-300";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48">
            <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <SelectValue placeholder="Time period" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-48">
            <Select value={region} onValueChange={(value) => setRegion(value as Region)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <SelectValue placeholder="Region" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Metro Manila">Metro Manila</SelectItem>
                <SelectItem value="Cebu">Cebu</SelectItem>
                <SelectItem value="Davao">Davao</SelectItem>
                <SelectItem value="Iloilo">Iloilo</SelectItem>
                <SelectItem value="Baguio">Baguio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button variant="outline">
          View Full Leaderboard
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Volunteers Leaderboard</CardTitle>
          <CardDescription>
            Recognizing our most dedicated community members
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Volunteer</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Hours</th>
                  <th className="text-left py-3 px-4">Events</th>
                  <th className="text-left py-3 px-4">Badges</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.map((volunteer) => (
                  <tr key={volunteer.id} className="border-t border-gray-200 hover:bg-muted/30">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {volunteer.rank <= 3 ? (
                          <Trophy className={`h-5 w-5 mr-2 ${
                            volunteer.rank === 1 ? "text-yellow-500" : 
                            volunteer.rank === 2 ? "text-slate-400" :
                            "text-amber-600"
                          }`} />
                        ) : (
                          <span className="text-gray-400 w-7 text-center">{volunteer.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={volunteer.avatar} />
                          <AvatarFallback>
                            {volunteer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{volunteer.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {volunteer.location}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-gray-700">
                        <Clock className="h-4 w-4 mr-2 text-seekup-blue" />
                        {volunteer.hours}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {volunteer.events}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1">
                        {volunteer.badges.map((badge, index) => (
                          <div 
                            key={index}
                            className={`h-4 w-4 rounded-full ${getBadgeColor(badge)}`}
                            title={`${badge.charAt(0).toUpperCase() + badge.slice(1)} Badge`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteerLeaderboard;
