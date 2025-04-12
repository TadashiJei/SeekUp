
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecognitionWall from "@/components/recognition/RecognitionWall";
import VolunteerRecognition from "@/components/recognition/VolunteerRecognition";
import ImpactMetrics from "@/components/impact/ImpactMetrics";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, BarChart2, ChevronRight, Medal } from "lucide-react";

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState("recognition");
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Our Community</h1>
          <p className="text-gray-600 max-w-3xl">
            SEEKUP brings together volunteers, organizations, and sponsors to create positive 
            change in communities across the Philippines. Explore our volunteer recognition 
            and impact achievements.
          </p>
        </div>
        
        {/* Breadcrumb navigation */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-seekup-blue">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Community</span>
        </div>
        
        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full md:w-auto mb-2">
            <TabsTrigger value="recognition" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Volunteer Recognition</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Medal className="h-4 w-4" />
              <span>Your Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="impact" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Impact Metrics</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recognition">
            <RecognitionWall />
          </TabsContent>
          
          <TabsContent value="achievements">
            <VolunteerRecognition />
          </TabsContent>
          
          <TabsContent value="impact">
            <ImpactMetrics />
          </TabsContent>
        </Tabs>
        
        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-seekup-blue to-seekup-purple rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Join Our Community</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Be part of the SEEKUP community and contribute to creating positive change. 
            Register today and start your volunteer journey with us.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Register as Volunteer
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" size="lg" className="bg-transparent border-white hover:bg-white/20">
                Browse Events
              </Button>
            </Link>
            <Link to="/success-stories">
              <Button variant="outline" size="lg" className="bg-transparent border-white hover:bg-white/20">
                View Success Stories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CommunityPage;
