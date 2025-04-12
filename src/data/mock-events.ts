
import { EventData } from "@/types/event";

// Mock event data
export const events: EventData[] = [
  {
    id: "1",
    title: "Coastal Clean-up Drive",
    organization: "Ocean Care PH",
    date: "April 15, 2025",
    time: "8:00 AM - 12:00 PM",
    location: "Manila Bay, Manila",
    image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=300",
    category: "Environment",
    points: 3,
    description: "Join us in cleaning up Manila Bay and preserving our ocean ecosystems."
  },
  {
    id: "2",
    title: "Book Reading for Kids",
    organization: "Education First Foundation",
    date: "April 22, 2025",
    time: "2:00 PM - 4:00 PM",
    location: "Public Library, Quezon City",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=300",
    category: "Education",
    points: 2,
    description: "Help inspire young minds through reading sessions at our local library."
  },
  {
    id: "3",
    title: "Tree Planting Activity",
    organization: "Green Earth PH",
    date: "May 5, 2025",
    time: "7:00 AM - 11:00 AM",
    location: "La Mesa Watershed, Quezon City",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=300",
    category: "Environment",
    points: 4,
    description: "Help us reforest La Mesa Watershed and protect our water resources for future generations."
  },
  {
    id: "4",
    title: "Food Distribution Drive",
    organization: "Feed the Hungry",
    date: "May 12, 2025",
    time: "9:00 AM - 1:00 PM",
    location: "Tondo, Manila",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=300",
    category: "Community Service",
    points: 3,
    description: "Distribute food packages to families in need in Tondo, Manila."
  },
  {
    id: "5",
    title: "Health Check-up Camp",
    organization: "Health For All",
    date: "May 20, 2025",
    time: "8:00 AM - 4:00 PM",
    location: "Community Center, Makati",
    image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?q=80&w=300",
    category: "Healthcare",
    points: 5,
    description: "Provide basic health check-ups for underserved communities in Makati."
  },
  {
    id: "6",
    title: "Disaster Preparedness Workshop",
    organization: "Ready Philippines",
    date: "June 3, 2025",
    time: "1:00 PM - 5:00 PM",
    location: "City Hall, Pasig",
    image: "https://images.unsplash.com/photo-1569705460033-a45a9f65a0f6?q=80&w=300",
    category: "Education",
    points: 3,
    description: "Learn essential disaster preparedness skills and help educate communities."
  },
];

// Categories for filtering
export const categories = [
  "All Categories",
  "Environment",
  "Education",
  "Community Service",
  "Healthcare",
  "Arts & Culture",
  "Animal Welfare",
  "Youth Development",
];

// Locations for filtering
export const locations = [
  "All Locations",
  "Manila",
  "Quezon City",
  "Makati",
  "Pasig",
  "Taguig",
  "Cebu",
  "Davao",
];
