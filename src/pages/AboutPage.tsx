
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Users, Shield, Target } from "lucide-react";
import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h1>
            <p className="text-xl text-gray-700 mb-8">
              SEEKUP connects volunteers with trusted organizations, enabling smarter, more meaningful community engagement across the Philippines.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-seekup-blue hover:bg-seekup-blue/90">
                  Join Our Movement
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline">
                  Learn How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                SEEKUP was born from our desire to bridge the gap between willing volunteers and the organizations that need them. In a country with a strong Bayanihan spirit, we saw a need for better tools to connect, engage, and empower communities.
              </p>
              <p className="text-lg text-gray-600">
                Founded in 2023, our team of passionate community leaders, tech specialists, and social entrepreneurs set out to create a platform that makes volunteerism accessible, rewarding, and impactful for all Filipinos.
              </p>
            </div>
            <div className="order-first md:order-last">
              <img
                src="https://images.unsplash.com/photo-1560252829-804f1aedf1be?q=80&w=1000"
                alt="Team working together"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              At the heart of SEEKUP are core values that guide everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Heart className="text-seekup-blue h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compassion</h3>
              <p className="text-gray-600">
                We believe in the power of kindness and empathy to transform communities and create meaningful change.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="text-seekup-purple h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                We celebrate the Filipino spirit of Bayanihan and work to strengthen connections between people.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="text-seekup-green h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trust</h3>
              <p className="text-gray-600">
                We build a safe environment where verified organizations and volunteers can connect with confidence.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Target className="text-seekup-orange h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Impact</h3>
              <p className="text-gray-600">
                We're committed to creating measurable positive change in communities across the Philippines.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're a diverse group of passionate individuals committed to making a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Java Jay Bartolome",
                role: "Founder & CEO",
                image: "/seekup-uploads/276bf4f7-afd0-467b-844a-cfe6e277d7be.png",
                bio: "Former NGO director with 10+ years of experience in community development."
              },
              {
                name: "Randy Carlo C. Lorenzo",
                role: "CTO",
                image: "/seekup-uploads/47a00396-f031-4131-af36-656006d82458.png",
                bio: "Tech entrepreneur with a passion for using technology for social good."
              },
              {
                name: "John Raynel B. Morales",
                role: "Community Director",
                image: "/seekup-uploads/e9f8064f-3d6f-40a7-a110-a7d7b1cfa11a.png",
                bio: "Community organizer with extensive experience in volunteer management."
              },
              {
                name: "Jathnielle Ibloguen",
                role: "Partnerships Lead",
                image: "/seekup-uploads/1391443b-343d-4f5a-acc2-c7c350ca1e9e.png",
                bio: "Former corporate CSR manager focused on creating strategic partnerships."
              }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 relative mx-auto w-40 h-40 rounded-full overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-seekup-blue mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Partners</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're proud to work with organizations committed to making a positive impact.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <div key={index} className="flex items-center justify-center py-4">
                <div className="h-16 w-36 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 font-semibold">
                  Partner Logo
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-seekup-blue to-seekup-purple rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Whether you're a volunteer, organization, or sponsor, there's a place for you in our community. Together, we can create lasting positive change.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="mr-4">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default AboutPage;
