
import React from "react";
import VolunteerBadge from "./VolunteerBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Heart, Clock, Star, Users, Calendar } from "lucide-react";

// Sample badge data - in a real app, this would come from the database
const badges = [
  {
    id: "1",
    level: "bronze",
    name: "First Timer",
    description: "Completed your first volunteer event"
  },
  {
    id: "2",
    level: "silver",
    name: "Dedicated Helper",
    description: "Volunteered for 5+ events"
  },
  {
    id: "3",
    level: "gold",
    name: "Community Champion",
    description: "Accumulated 100+ volunteer hours"
  },
  {
    id: "4",
    level: "platinum",
    name: "Impact Leader",
    description: "Led at least 3 volunteer initiatives"
  }
];

// Sample top volunteers data
const topVolunteers = [
  {
    id: "1",
    name: "Maria Santos",
    hours: 120,
    avatar: "https://i.pravatar.cc/150?img=29"
  },
  {
    id: "2",
    name: "Juan Reyes",
    hours: 105,
    avatar: "https://i.pravatar.cc/150?img=12"
  },
  {
    id: "3",
    name: "Anna Cruz",
    hours: 98,
    avatar: "https://i.pravatar.cc/150?img=31"
  },
  {
    id: "4",
    name: "Marco Silva",
    hours: 85,
    avatar: "https://i.pravatar.cc/150?img=42"
  }
];

const RecognitionWall = () => {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Award className="mr-2 h-6 w-6 text-seekup-purple" />
          Recognition Badges
        </h2>
        <p className="text-gray-600 mb-6">
          Earn badges by participating in events and contributing to the community.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map(badge => (
            <VolunteerBadge
              key={badge.id}
              level={badge.level as "bronze" | "silver" | "gold" | "platinum"}
              name={badge.name}
              description={badge.description}
            />
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Star className="mr-2 h-6 w-6 text-seekup-gold" />
          Top Volunteers
        </h2>
        <p className="text-gray-600 mb-6">
          Recognizing our most dedicated community members.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topVolunteers.map(volunteer => (
            <Card key={volunteer.id}>
              <CardContent className="p-6 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                  <img 
                    src={volunteer.avatar} 
                    alt={volunteer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg">{volunteer.name}</h3>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {volunteer.hours} hours
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RecognitionWall;
