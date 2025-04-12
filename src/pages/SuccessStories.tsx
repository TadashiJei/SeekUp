
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Quote,
  Users,
  Heart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SuccessStories = () => {
  // Sample success stories data
  const featuredStories = [
    {
      id: "1",
      title: "Coastal Conservation Initiative",
      organization: "Ocean Care PH",
      location: "Manila Bay, Manila",
      date: "March 2025",
      image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1000",
      category: "Environment",
      summary: "Over 500 volunteers came together to clean Manila Bay, removing over 2 tons of waste and implementing sustainable conservation practices.",
      impact: {
        volunteers: 500,
        hours: 2000,
        waste: "2 tons",
        area: "5 km coastline"
      },
      testimonial: {
        quote: "Seeing so many people come together for our oceans gave me hope for the future. SEEKUP made it easy to join and track our collective impact.",
        author: "Maria Reyes",
        role: "Volunteer"
      }
    },
    {
      id: "2",
      title: "Rebuilding After Typhoon Resilience",
      organization: "Relief Philippines",
      location: "Leyte Province",
      date: "January 2025",
      image: "https://images.unsplash.com/photo-1603915402169-98e32d99502b?q=80&w=1000",
      category: "Disaster Relief",
      summary: "When Typhoon Resilience hit Leyte Province, 300+ volunteers mobilized through SEEKUP to deliver aid and help rebuild communities.",
      impact: {
        volunteers: 320,
        hours: 3840,
        families: "150 families",
        homes: "45 homes repaired"
      },
      testimonial: {
        quote: "The efficiency of volunteer coordination through SEEKUP allowed us to respond faster and more effectively than ever before.",
        author: "Antonio Santos",
        role: "Relief Philippines Director"
      }
    }
  ];

  const regularStories = [
    {
      id: "3",
      title: "Literacy Campaign for Rural Schools",
      organization: "Education First Foundation",
      location: "Batangas Province",
      date: "February 2025",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=700",
      category: "Education",
      summary: "A network of volunteers brought books and reading programs to 15 rural schools, reaching over 1,200 children."
    },
    {
      id: "4",
      title: "Community Garden Initiative",
      organization: "Green Earth PH",
      location: "Quezon City",
      date: "April 2025",
      image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=700",
      category: "Environment",
      summary: "Urban gardens developed in previously unused spaces now provide fresh produce for local community kitchens."
    },
    {
      id: "5",
      title: "Tech Skills for Youth",
      organization: "Digital Future Foundation",
      location: "Cebu City",
      date: "March 2025",
      image: "https://images.unsplash.com/photo-1616587894289-86480e533129?q=80&w=700",
      category: "Education",
      summary: "Volunteer tech professionals taught coding skills to over 200 underprivileged youth, opening doors to new career opportunities."
    },
    {
      id: "6",
      title: "Mobile Health Clinic",
      organization: "Health For All",
      location: "Visayas Region",
      date: "January 2025",
      image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?q=80&w=700",
      category: "Healthcare",
      summary: "Healthcare volunteers provided medical services to 12 remote villages, serving over 3,000 residents with limited healthcare access."
    }
  ];

  const testimonials = [
    {
      id: "1",
      quote: "SEEKUP has transformed how we manage volunteers. The QR check-in system alone has saved us countless administrative hours.",
      author: "Elena Cruz",
      role: "Volunteer Coordinator",
      organization: "Green Earth PH"
    },
    {
      id: "2",
      quote: "As a corporate sponsor, we can now see exactly how our contributions make an impact. The data and reporting tools are invaluable.",
      author: "Miguel Santos",
      role: "CSR Director",
      organization: "Pacific Banking Group"
    },
    {
      id: "3",
      quote: "Building my volunteer portfolio through SEEKUP helped me land my dream job. Employers were impressed by my verified service record.",
      author: "Diego Reyes",
      role: "Former Volunteer"
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Success Stories</h1>
            <p className="text-xl text-gray-700 mb-8">
              Real impact, real communities. See how SEEKUP is helping create positive change across the Philippines.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-seekup-blue hover:bg-seekup-blue/90">
                Be Part of Our Next Success Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Impact Stories</h2>
          
          <div className="space-y-12">
            {featuredStories.map((story, index) => (
              <div key={story.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="md:flex">
                  <div className="md:w-2/5">
                    <img 
                      src={story.image} 
                      alt={story.title} 
                      className="h-64 md:h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-3/5">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="bg-seekup-blue hover:bg-seekup-blue/90">
                        {story.category}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{story.title}</h3>
                    <p className="text-gray-600 mb-4">
                      {story.organization}
                    </p>
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {story.date}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {story.location}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-6">
                      {story.summary}
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Volunteers</p>
                        <p className="text-lg font-medium">{story.impact.volunteers}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Hours</p>
                        <p className="text-lg font-medium">{story.impact.hours}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">
                          {story.impact.waste ? 'Waste Collected' : 'Families Helped'}
                        </p>
                        <p className="text-lg font-medium">
                          {story.impact.waste || story.impact.families}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">
                          {story.impact.area ? 'Area Covered' : 'Homes Repaired'}
                        </p>
                        <p className="text-lg font-medium">
                          {story.impact.area || story.impact.homes}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex items-start">
                        <Quote className="h-8 w-8 text-seekup-purple opacity-40 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-gray-700 italic">
                            "{story.testimonial.quote}"
                          </p>
                          <p className="text-gray-600 mt-2 font-medium">
                            — {story.testimonial.author}, {story.testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button className="bg-seekup-blue hover:bg-seekup-blue/90">
                      Read Full Story <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Success Stories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">More Success Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {regularStories.map((story) => (
              <div key={story.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={story.image} 
                    alt={story.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <Badge className="bg-seekup-blue hover:bg-seekup-blue/90">
                      {story.category}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-xl mb-2">{story.title}</h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    {story.organization}
                  </p>
                  <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {story.date}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {story.location}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    {story.summary}
                  </p>
                  <Button variant="outline">
                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Community Says</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from volunteers, organizations, and sponsors who are part of the SEEKUP community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <Quote className="h-8 w-8 text-seekup-purple opacity-40 mb-4" />
                <p className="text-gray-700 italic mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={`https://i.pravatar.cc/150?img=${parseInt(testimonial.id) + 20}`} 
                      alt={testimonial.author} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">
                      {testimonial.role}
                      {testimonial.organization && `, ${testimonial.organization}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Collective Impact</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Together, we're creating meaningful change across the Philippines.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Users className="h-10 w-10 text-seekup-blue mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">3,500+</p>
              <p className="text-gray-600">Volunteers</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Calendar className="h-10 w-10 text-seekup-purple mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">230+</p>
              <p className="text-gray-600">Events Completed</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <MapPin className="h-10 w-10 text-seekup-green mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">75+</p>
              <p className="text-gray-600">Communities Served</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Heart className="h-10 w-10 text-seekup-red mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">43,000+</p>
              <p className="text-gray-600">Volunteer Hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-seekup-blue to-seekup-purple rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Add Your Story to Our Collection</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join the SEEKUP community and be part of the next success story. Together, we can create lasting positive change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?type=volunteer">
                <Button size="lg" variant="secondary">
                  Join as Volunteer
                </Button>
              </Link>
              <Link to="/register?type=organization">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                  Register Organization
                </Button>
              </Link>
              <Link to="/events">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default SuccessStories;
