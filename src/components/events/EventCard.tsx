
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { EventData } from "@/types/event";

interface EventCardProps {
  event: EventData;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link to={`/events/${event.id}`} className="group">
      <Card className="overflow-hidden h-full card-hover">
        <div className="h-48 overflow-hidden relative">
          <div className="absolute top-3 right-3 z-10 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
            {event.category}
          </div>
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-seekup-blue transition-colors">
              {event.title}
            </h3>
            <Badge variant="outline" className="ml-2">
              {event.points} pts
            </Badge>
          </div>
          <p className="text-gray-600 mb-3 text-sm">
            {event.organization}
          </p>
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              {event.date}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              {event.time}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              {event.location}
            </div>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">
            {event.description}
          </p>
        </CardContent>
        <CardFooter className="pt-0 pb-5 px-5">
          <Button className="w-full bg-seekup-blue hover:bg-seekup-blue/90">
            View Event
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default EventCard;
