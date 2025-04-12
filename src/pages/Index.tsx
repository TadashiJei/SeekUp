
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";
import { 
  HandHeart, 
  Users, 
  TrendingUp, 
  Award, 
  Calendar, 
  SearchCheck, 
  QrCode,
  BarChart2,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

// Mock event data for the featured events section
const featuredEvents = [
  {
    id: "1",
    title: "Coastal Clean-up Drive",
    organization: "Ocean Care PH",
    date: "April 15, 2025",
    location: "Manila Bay, Manila",
    imageUrl: "https://images.unsplash.com/photo-1621451537084-482c73073a0f",
    category: "Environment"
  },
  {
    id: "2",
    title: "Book Reading for Kids",
    organization: "Education First Foundation",
    date: "April 22, 2025",
    location: "Public Library, Quezon City",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    category: "Education"
  },
  {
    id: "3",
    title: "Medical Mission",
    organization: "Health For All",
    date: "May 5, 2025",
    location: "Community Center, Cebu",
    imageUrl: "https://images.unsplash.com/photo-1584744982491-665216d95f8b",
    category: "Healthcare"
  }
];

// Motion variants for animations
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Index = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col space-y-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Filipinos for Filipinos
                <span className="hero-gradient block">Hand in Hand, Anytime, Anywhere</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                SEEKUP connects passionate volunteers with trusted organizations, making meaningful community service accessible to everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-seekup-blue hover:bg-seekup-blue/90">
                    Join SEEKUP
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline">
                    Learn How It Works
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white overflow-hidden">
                      <img 
                        src={`https://i.pravatar.cc/150?img=${i + 10}`} 
                        alt="Volunteer" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">1,200+</span> volunteers already joined
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-[400px] md:h-[450px] lg:h-[500px]"
            >
              <img 
                src="https://images.unsplash.com/photo-1652971876875-05db98fab376?q=80&w=2929&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Volunteers working together" 
                className="rounded-lg shadow-xl object-cover h-full w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 max-w-[200px]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg text-seekup-blue">43K+</span>
                  <TrendingUp className="h-5 w-5 text-seekup-green" />
                </div>
                <p className="text-sm text-gray-600">Volunteer hours completed this year</p>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Curved shape at bottom of the hero */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="fill-white">
            <path d="M0,96L80,85.3C160,75,320,53,480,53.3C640,53,800,75,960,75C1120,75,1280,53,1360,42.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={fadeIn} className="stat-card">
              <HandHeart className="h-12 w-12 text-seekup-purple mb-4" />
              <h3 className="font-bold text-3xl mb-1">120+</h3>
              <p className="text-gray-600">Volunteer Opportunities</p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="stat-card">
              <Users className="h-12 w-12 text-seekup-blue mb-4" />
              <h3 className="font-bold text-3xl mb-1">3,500+</h3>
              <p className="text-gray-600">Registered Volunteers</p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="stat-card">
              <Award className="h-12 w-12 text-seekup-green mb-4" />
              <h3 className="font-bold text-3xl mb-1">75+</h3>
              <p className="text-gray-600">Verified Organizations</p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="stat-card">
              <Calendar className="h-12 w-12 text-seekup-orange mb-4" />
              <h3 className="font-bold text-3xl mb-1">230+</h3>
              <p className="text-gray-600">Completed Events</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How SEEKUP Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes volunteering simple, rewarding, and impactful for everyone involved.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* For Volunteers */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 card-hover">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <SearchCheck className="h-6 w-6 text-seekup-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Volunteers</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Get matched with events based on your interests and skills</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Track your service hours and earn points for each event</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Build a digital portfolio that showcases your impact</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Use QR codes for seamless event check-in</span>
                </li>
              </ul>
              <Link to="/register?type=volunteer" className="inline-flex items-center mt-4 text-seekup-blue hover:text-seekup-purple">
                Sign up as a Volunteer <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* For Organizations */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 card-hover">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-seekup-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Organizations</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Create and manage events in one centralized platform</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Verify volunteer attendance with QR check-in system</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access real-time communication tools for coordination</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Generate detailed impact reports and analytics</span>
                </li>
              </ul>
              <Link to="/register?type=organization" className="inline-flex items-center mt-4 text-seekup-purple hover:text-seekup-blue">
                Register your Organization <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* For Sponsors */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 card-hover">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-seekup-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Sponsors</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Support community initiatives that align with your values</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access real-time impact metrics and data visualization</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Increase visibility through community engagement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-seekup-green mr-2 mt-0.5 flex-shrink-0" />
                  <span>Generate custom reports for CSR initiatives</span>
                </li>
              </ul>
              <Link to="/register?type=sponsor" className="inline-flex items-center mt-4 text-seekup-green hover:text-seekup-blue">
                Become a Sponsor <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <Link to="/events" className="text-seekup-blue hover:text-seekup-purple flex items-center">
              View all events <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <Link to={`/events/${event.id}`} key={event.id} className="group">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full card-hover">
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute top-3 right-3 z-10 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      {event.category}
                    </div>
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-seekup-blue transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {event.organization}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Button 
                        variant="default" 
                        className="w-full bg-seekup-blue hover:bg-seekup-blue/90"
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Community Says</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stories from volunteers and organizations who are making a difference with SEEKUP.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 card-hover">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                  <img 
                    src="https://i.pravatar.cc/150?img=23" 
                    alt="Maria Santos" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">Maria Santos</h4>
                  <p className="text-sm text-gray-500">Volunteer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "SEEKUP helped me find meaningful volunteer opportunities that matched my interests. I love how easy it is to track my hours and connect with organizations that are making a real difference."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 card-hover">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                  <img 
                    src="https://i.pravatar.cc/150?img=32" 
                    alt="Juan Reyes" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">Juan Reyes</h4>
                  <p className="text-sm text-gray-500">Habitat for Hope</p>
                </div>
              </div>
              <p className="text-gray-600">
                "As an NGO, managing volunteers used to be our biggest challenge. SEEKUP streamlined everything from recruitment to check-ins. Now we can focus on our mission instead of administrative tasks."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 card-hover">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                  <img 
                    src="https://i.pravatar.cc/150?img=42" 
                    alt="Angelica Cruz" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">Angelica Cruz</h4>
                  <p className="text-sm text-gray-500">City Mayor's Office</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The analytics tools have been invaluable for our LGU's community programs. We can now demonstrate the impact of our initiatives with real data and engaged more citizens than ever before."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-seekup-blue to-seekup-purple rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-white text-3xl font-bold mb-4">
                  Ready to Make a Difference?
                </h2>
                <p className="text-white/90 mb-6">
                  Join thousands of Filipinos who are using SEEKUP to create positive change in their communities. Whether you're a volunteer, organization, or sponsor, there's a place for you in our movement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button size="lg" variant="secondary">
                      Get Started Now
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000" 
                  alt="Volunteers working together" 
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;

// Missing component definition
const MapPin = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
