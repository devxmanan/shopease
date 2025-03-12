import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const About = () => {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About ShopEase</h1>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
          <div className="aspect-video relative">
            <img 
              src="https://images.unsplash.com/photo-1541943181603-d8fe267a5dcf?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=1312&h=500"
              alt="Our store"
              className="object-cover w-full h-full"
            />
          </div>
          
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="mb-4 text-slate-600">
              Founded in 2023, ShopEase was created with a simple mission: to make online shopping easy, enjoyable, and accessible to everyone. 
              We believe that shopping should be a seamless experience, from browsing products to checkout and delivery.
            </p>
            <p className="mb-6 text-slate-600">
              Our team of dedicated professionals works tirelessly to curate the best products across various categories, 
              ensuring that our customers have access to high-quality items at competitive prices. We partner with trusted 
              suppliers and brands to bring you an exceptional shopping experience.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-primary">Quality</h3>
                <p className="text-slate-600">
                  We're committed to offering only the best products that meet our rigorous standards for excellence.
                </p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-primary">Transparency</h3>
                <p className="text-slate-600">
                  We believe in honest communication with our customers, from clear pricing to detailed product information.
                </p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-primary">Customer Focus</h3>
                <p className="text-slate-600">
                  Our customers are at the heart of everything we do, driving our innovations and improvements.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Meet the Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="rounded-full overflow-hidden w-24 h-24 mx-auto mb-4">
                  <img 
                    src="https://randomuser.me/api/portraits/women/42.jpg" 
                    alt="Sarah Johnson"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold">Sarah Johnson</h3>
                <p className="text-sm text-slate-500">CEO & Founder</p>
              </div>
              
              <div className="text-center">
                <div className="rounded-full overflow-hidden w-24 h-24 mx-auto mb-4">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="David Chen"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold">David Chen</h3>
                <p className="text-sm text-slate-500">CTO</p>
              </div>
              
              <div className="text-center">
                <div className="rounded-full overflow-hidden w-24 h-24 mx-auto mb-4">
                  <img 
                    src="https://randomuser.me/api/portraits/women/22.jpg" 
                    alt="Emily Rodriguez"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold">Emily Rodriguez</h3>
                <p className="text-sm text-slate-500">Design Director</p>
              </div>
              
              <div className="text-center">
                <div className="rounded-full overflow-hidden w-24 h-24 mx-auto mb-4">
                  <img 
                    src="https://randomuser.me/api/portraits/men/22.jpg" 
                    alt="Michael Thompson"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold">Michael Thompson</h3>
                <p className="text-sm text-slate-500">Customer Relations</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button asChild size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default About;
