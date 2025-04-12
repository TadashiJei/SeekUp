
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Trophy, Medal, Star } from "lucide-react";
import VolunteerLeaderboard from "./VolunteerLeaderboard";
import BadgeGallery from "./BadgeGallery";
import AchievementTimeline from "./AchievementTimeline";

const VolunteerRecognition = () => {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Award className="mr-2 h-6 w-6 text-seekup-purple" />
          Volunteer Recognition Program
        </h2>
        <p className="text-gray-600 mb-6">
          At SEEKUP, we celebrate the dedication and impact of our volunteers through 
          a comprehensive recognition program designed to acknowledge their contributions 
          to communities across the Philippines.
        </p>
        
        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full md:w-auto mb-2">
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Medal className="h-4 w-4" />
              <span>Achievement Badges</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Achievement Timeline</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="badges">
            <BadgeGallery />
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <VolunteerLeaderboard />
          </TabsContent>
          
          <TabsContent value="timeline">
            <AchievementTimeline />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default VolunteerRecognition;
