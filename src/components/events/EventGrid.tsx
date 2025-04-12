
import React from "react";
import { Button } from "@/components/ui/button";
import { EventData } from "@/types/event";
import EventCard from "./EventCard";

interface EventGridProps {
  events: EventData[];
  onResetFilters: () => void;
}

const EventGrid = ({ events, onResetFilters }: EventGridProps) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No events found</h3>
        <p className="text-gray-500 mb-6">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <Button 
          variant="outline" 
          onClick={onResetFilters}
        >
          Reset Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventGrid;
