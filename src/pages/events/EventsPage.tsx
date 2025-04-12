
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { events, categories, locations } from "@/data/mock-events";
import EventFilters from "@/components/events/EventFilters";
import EventGrid from "@/components/events/EventGrid";

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter events based on search term, category, and location
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All Categories" || 
                           event.category === selectedCategory;
    
    const matchesLocation = selectedLocation === "All Locations" ||
                           event.location.includes(selectedLocation);
    
    return matchesSearch && matchesCategory && matchesLocation;
  });
  
  const clearFilters = () => {
    setSelectedCategory("All Categories");
    setSelectedLocation("All Locations");
    setSearchTerm("");
  };
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Discover Volunteer Events</h1>
          <p className="text-gray-600 mt-2">
            Find and join upcoming volunteer opportunities in your community.
          </p>
        </div>
        
        {/* Search and Filters */}
        <EventFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          categories={categories}
          locations={locations}
          onClearFilters={clearFilters}
        />
        
        {/* Events Grid */}
        <EventGrid 
          events={filteredEvents}
          onResetFilters={clearFilters}
        />
      </div>
    </PageLayout>
  );
};

export default EventsPage;
