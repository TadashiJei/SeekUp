
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, Trophy } from "lucide-react";

// Sample timeline data - in a real app, this would come from the database
const timelineData = [
  {
    id: "1",
    date: "Apr 10, 2025",
    type: "badge",
    title: "Community Champion",
    description: "You earned the Community Champion badge for accumulating 100+ volunteer hours.",
    level: "gold",
    icon: <Award className="h-5 w-5 text-yellow-500" />
  },
  {
    id: "2",
    date: "Mar 25, 2025",
    type: "event",
    title: "Coastal Cleanup Project",
    description: "You contributed 8 hours to the coastal cleanup event in Manila Bay.",
    icon: <Calendar className="h-5 w-5 text-blue-500" />
  },
  {
    id: "3",
    date: "Mar 15, 2025",
    type: "milestone",
    title: "100 Hours Milestone",
    description: "You've reached a total of 100 volunteer hours. Congratulations on this significant achievement!",
    icon: <Trophy className="h-5 w-5 text-purple-500" />
  },
  {
    id: "4",
    date: "Feb 28, 2025",
    type: "badge",
    title: "Education Supporter",
    description: "You earned the Education Supporter badge for volunteering in an educational program.",
    level: "bronze",
    icon: <Award className="h-5 w-5 text-amber-600" />
  },
  {
    id: "5",
    date: "Feb 10, 2025",
    type: "badge",
    title: "Dedicated Helper",
    description: "You earned the Dedicated Helper badge for volunteering in 5+ events.",
    level: "silver",
    icon: <Award className="h-5 w-5 text-slate-400" />
  },
  {
    id: "6",
    date: "Jan 20, 2025",
    type: "event",
    title: "School Library Renovation",
    description: "You contributed 6 hours to renovating a school library in Quezon City.",
    icon: <Calendar className="h-5 w-5 text-blue-500" />
  },
  {
    id: "7",
    date: "Jan 15, 2025",
    type: "badge",
    title: "First Timer",
    description: "You earned the First Timer badge for completing your first volunteer event.",
    level: "bronze",
    icon: <Award className="h-5 w-5 text-amber-600" />
  }
];

const AchievementTimeline = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-seekup-purple" />
            Your Volunteer Journey
          </CardTitle>
          <CardDescription>
            A chronological timeline of your achievements and contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-8">
            {/* Vertical timeline line */}
            <div className="absolute left-5 top-1 bottom-0 w-0.5 bg-gray-200" />
            
            {timelineData.map((item, index) => (
              <div key={item.id} className="relative flex gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 z-10">
                  {item.icon}
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <h3 className="text-lg font-medium">
                      {item.title}
                      {item.type === "badge" && item.level && (
                        <Badge className={`ml-2 ${
                          item.level === "gold" ? "bg-yellow-400 text-yellow-800" : 
                          item.level === "silver" ? "bg-slate-400 text-slate-800" :
                          "bg-amber-600 text-amber-900"
                        }`}>
                          {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                        </Badge>
                      )}
                    </h3>
                    <time className="text-xs text-gray-500 sm:text-sm">{item.date}</time>
                  </div>
                  <p className="mt-1 text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementTimeline;
