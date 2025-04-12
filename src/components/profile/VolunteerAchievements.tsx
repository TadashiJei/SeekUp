
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VolunteerBadge from "@/components/recognition/VolunteerBadge";
import { Trophy, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - in a real app this would come from the database/API
const achievementsData = {
  recentBadges: [
    {
      id: "1",
      level: "gold",
      name: "Community Champion",
      description: "Accumulated 100+ volunteer hours"
    },
    {
      id: "2",
      level: "silver",
      name: "Dedicated Helper",
      description: "Volunteered for 5+ events"
    },
    {
      id: "3",
      level: "bronze",
      name: "Education Supporter",
      description: "Volunteered for an educational program"
    }
  ],
  stats: {
    totalHours: 120,
    eventsCompleted: 15,
    badges: 7,
    rank: 1
  }
};

const VolunteerAchievements = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-seekup-gold" /> 
            Achievement Highlights
          </CardTitle>
          <CardDescription>
            Your volunteer journey achievements and impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-seekup-blue">
                {achievementsData.stats.totalHours}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Events</p>
              <p className="text-2xl font-bold text-seekup-green">
                {achievementsData.stats.eventsCompleted}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Badges</p>
              <p className="text-2xl font-bold text-seekup-purple">
                {achievementsData.stats.badges}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Current Rank</p>
              <p className="text-2xl font-bold text-seekup-red">
                #{achievementsData.stats.rank}
              </p>
            </div>
          </div>
          
          <h3 className="font-medium text-lg mb-3 flex items-center">
            <Award className="h-5 w-5 mr-2 text-seekup-purple" />
            Recent Badges
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {achievementsData.recentBadges.map(badge => (
              <VolunteerBadge 
                key={badge.id}
                level={badge.level as "bronze" | "silver" | "gold" | "platinum"}
                name={badge.name}
                description={badge.description}
              />
            ))}
          </div>
          
          <div className="flex justify-end">
            <Link to="/community?tab=achievements">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                View All Achievements
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteerAchievements;
