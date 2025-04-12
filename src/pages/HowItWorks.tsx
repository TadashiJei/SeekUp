
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  SearchCheck, 
  Clock, 
  Award, 
  QrCode, 
  Users, 
  BarChart2,
  Calendar,
  MessageCircle,
  ArrowRight,
  Check,
  Briefcase
} from "lucide-react";

const HowItWorks = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">How SEEKUP Works</h1>
            <p className="text-xl text-gray-700 mb-8">
              SEEKUP makes volunteering simple, transparent, and rewarding for everyone involved.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register?type=volunteer">
                <Button size="lg" className="bg-seekup-blue hover:bg-seekup-blue/90">
                  Join as Volunteer
                </Button>
              </Link>
              <Link to="/register?type=organization">
                <Button size="lg" variant="outline">
                  Register Organization
                </Button>
              </Link>
              <Link to="/register?type=sponsor">
                <Button size="lg" variant="outline">
                  Become a Sponsor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For Volunteers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">For Volunteers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              SEEKUP helps you find meaningful volunteer opportunities and track your impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl font-semibold mb-6">Find Meaningful Opportunities</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <SearchCheck className="h-5 w-5 text-seekup-blue" />
                  </div>
                  <div>
                    <h4 className="font-medium">Smart Matching</h4>
                    <p className="text-gray-600">
                      Get matched with events that fit your interests, skills, and schedule.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Calendar className="h-5 w-5 text-seekup-blue" />
                  </div>
                  <div>
                    <h4 className="font-medium">Flexible Scheduling</h4>
                    <p className="text-gray-600">
                      Find opportunities that work with your availability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Check className="h-5 w-5 text-seekup-blue" />
                  </div>
                  <div>
                    <h4 className="font-medium">Verified Events</h4>
                    <p className="text-gray-600">
                      All events and organizations are verified for your safety and peace of mind.
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/events">
                <Button className="mt-6 bg-seekup-blue hover:bg-seekup-blue/90">
                  Browse Events
                </Button>
              </Link>
            </div>

            <div className="order-1 md:order-2">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000"
                alt="Volunteers working together"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000"
                alt="Volunteer tracking impact"
                className="rounded-lg shadow-lg"
              />
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6">Track Your Impact</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <Award className="h-5 w-5 text-seekup-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium">Point System</h4>
                    <p className="text-gray-600">
                      Earn points for every hour you volunteer, building your service record.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <Clock className="h-5 w-5 text-seekup-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium">Hour Tracking</h4>
                    <p className="text-gray-600">
                      Automatically log your volunteer hours through QR check-ins.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <QrCode className="h-5 w-5 text-seekup-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium">Digital Portfolio</h4>
                    <p className="text-gray-600">
                      Build a verified record of your service for school, work, or personal growth.
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/register?type=volunteer">
                <Button className="mt-6 bg-seekup-purple hover:bg-seekup-purple/90">
                  Sign Up as Volunteer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For Organizations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">For Organizations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              SEEKUP provides tools to streamline volunteer management and maximize your impact.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-seekup-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Volunteer Management</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-seekup-green mr-2 mt-1" />
                  <span>Create and manage events in one place</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-seekup-green mr-2 mt-1" />
                  <span>Track volunteer attendance and participation</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-seekup-green mr-2 mt-1" />
                  <span>Build a database of skills and availability</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-seekup-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Simplified Check-ins</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-seekup-green mr-2 mt-1" />
                  <span>QR code-based attendance system</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-seekup-green mr-2 mt-1" />
                  <span>Automatic hour tracking and verification</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-seekup-green mr-2 mt-1" />
                  <span>Real-time attendance monitoring</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-seekup-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Impact Reporting</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-seekup-green mr-2 mt-1" />
                  <span>Generate detailed impact reports</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-seekup-green mr-2 mt-1" />
                  <span>Track metrics and outcomes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-seekup-green mr-2 mt-1" />
                  <span>Share results with stakeholders</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/register?type=organization">
              <Button className="bg-seekup-blue hover:bg-seekup-blue/90">
                Register Your Organization
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Sponsors */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">For Sponsors</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Support community initiatives while gaining visibility and measuring your impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Support With Purpose</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <Briefcase className="h-5 w-5 text-seekup-green" />
                  </div>
                  <div>
                    <h4 className="font-medium">Strategic CSR</h4>
                    <p className="text-gray-600">
                      Align your support with your company's values and social responsibility goals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <BarChart2 className="h-5 w-5 text-seekup-green" />
                  </div>
                  <div>
                    <h4 className="font-medium">Measurable Impact</h4>
                    <p className="text-gray-600">
                      Access real-time data on how your sponsorship is making a difference.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <MessageCircle className="h-5 w-5 text-seekup-green" />
                  </div>
                  <div>
                    <h4 className="font-medium">Community Engagement</h4>
                    <p className="text-gray-600">
                      Connect with communities and build meaningful relationships.
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/register?type=sponsor">
                <Button className="mt-6 bg-seekup-green hover:bg-seekup-green/90">
                  Become a Sponsor
                </Button>
              </Link>
            </div>

            <div>
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000"
                alt="Corporate sponsorship"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Getting Started is Easy</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join the SEEKUP community in just a few simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-seekup-blue text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Create an Account</h3>
              <p className="text-gray-600 mb-4">
                Sign up as a volunteer, organization, or sponsor with just a few clicks.
              </p>
              <Link to="/register" className="text-seekup-blue hover:underline flex items-center">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-seekup-purple text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Complete Your Profile</h3>
              <p className="text-gray-600 mb-4">
                Tell us about your skills, interests, or organization to find the perfect match.
              </p>
              <span className="text-seekup-purple hover:underline flex items-center">
                Set Up Profile <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-seekup-green text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Start Making an Impact</h3>
              <p className="text-gray-600 mb-4">
                Find events, manage volunteers, or sponsor initiatives - start making a difference today.
              </p>
              <span className="text-seekup-green hover:underline flex items-center">
                Browse Opportunities <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-seekup-blue to-seekup-purple rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join the SEEKUP community and be part of the movement to create positive change across the Philippines.
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
              <Link to="/register?type=sponsor">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                  Become a Sponsor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default HowItWorks;
