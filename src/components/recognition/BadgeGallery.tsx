
import React, { useState } from "react";
import VolunteerBadge from "./VolunteerBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Trophy, Medal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample expanded badge data - in a real app, this would come from the database
const badgesData = [
  {
    id: "1",
    level: "bronze",
    name: "First Timer",
    description: "Completed your first volunteer event",
    category: "participation",
    dateEarned: "2025-01-15"
  },
  {
    id: "2",
    level: "silver",
    name: "Dedicated Helper",
    description: "Volunteered for 5+ events",
    category: "participation",
    dateEarned: "2025-02-10"
  },
  {
    id: "3",
    level: "gold",
    name: "Community Champion",
    description: "Accumulated 100+ volunteer hours",
    category: "hours",
    dateEarned: "2025-03-05"
  },
  {
    id: "4",
    level: "platinum",
    name: "Impact Leader",
    description: "Led at least 3 volunteer initiatives",
    category: "leadership",
    dateEarned: "2025-03-20"
  },
  {
    id: "5",
    level: "bronze",
    name: "Green Thumb",
    description: "Participated in an environmental conservation event",
    category: "environment",
    dateEarned: null
  },
  {
    id: "6",
    level: "silver",
    name: "Environmental Guardian",
    description: "Participated in 5+ environmental conservation events",
    category: "environment",
    dateEarned: null
  },
  {
    id: "7",
    level: "bronze",
    name: "Education Supporter",
    description: "Volunteered for an educational program",
    category: "education",
    dateEarned: "2025-02-05"
  },
  {
    id: "8",
    level: "silver",
    name: "Knowledge Sharer",
    description: "Volunteered for 5+ educational programs",
    category: "education",
    dateEarned: null
  }
];

type BadgeCategory = "all" | "participation" | "hours" | "leadership" | "environment" | "education";

const BadgeGallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory>("all");
  
  const filteredBadges = badgesData.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || badge.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  const earnedBadges = filteredBadges.filter(badge => badge.dateEarned);
  const availableBadges = filteredBadges.filter(badge => !badge.dateEarned);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search badges..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-64">
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as BadgeCategory)}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="participation">Participation</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
              <SelectItem value="education">Education</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-seekup-gold" />
              Your Earned Badges
            </CardTitle>
            <CardDescription>
              Badges you've earned through your volunteer activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {earnedBadges.map(badge => (
                <VolunteerBadge
                  key={badge.id}
                  level={badge.level as "bronze" | "silver" | "gold" | "platinum"}
                  name={badge.name}
                  description={badge.description}
                  className="h-full"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {availableBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-seekup-purple" />
              Available Badges
            </CardTitle>
            <CardDescription>
              Badges you can earn through continued volunteer work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {availableBadges.map(badge => (
                <div key={badge.id} className="relative">
                  <div className="opacity-50">
                    <VolunteerBadge
                      level={badge.level as "bronze" | "silver" | "gold" | "platinum"}
                      name={badge.name}
                      description={badge.description}
                      className="h-full"
                    />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-gray-500">Locked</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {filteredBadges.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No badges found matching your search criteria.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BadgeGallery;
