import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductGrid from '@/components/products/ProductGrid';
import CategoryCard from '@/components/products/CategoryCard';
import { Input } from '@/components/ui/input';
import { Product, Category } from '@shared/schema';
import { getAllDocuments, queryDocuments } from '@/lib/firebase';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured products
        const featuredProductsData = await queryDocuments('products', 'featured', '==', true);
        setFeaturedProducts(featuredProductsData as Product[]);
        
        // Fetch categories
        const categoriesData = await getAllDocuments('categories');
        setCategories(categoriesData as Category[]);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would submit this to your backend
    alert(`Thank you! ${email} has been subscribed to our newsletter.`);
    setEmail('');
  };

  return (
    <main className="flex-grow">
      {/* Hero Banner */}
      <section className="relative bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
            alt="Stylish products arrangement" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">New Season Arrivals</h1>
            <p className="text-lg mb-8">Discover the latest trends with our new collection</p>
            <Button asChild size="lg">
              <Link href="/shop">Shop Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Shop by Category</h2>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="w-full h-40 rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section id="shop" className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
          
          <ProductGrid 
            products={featuredProducts} 
            isLoading={loading} 
            error={error} 
          />
          
          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="max-w-md mx-auto mb-6">Stay updated with our latest products and exclusive offers.</p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-grow rounded-r-none text-slate-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="bg-slate-800 hover:bg-slate-900 rounded-l-none">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Home;
