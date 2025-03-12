import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProductGrid from '@/components/products/ProductGrid';
import FilterSidebar, { FilterOptions } from '@/components/products/FilterSidebar';
import { Product, Category } from '@shared/schema';
import { getAllDocuments, queryDocuments, queryDocumentsWithOrder } from '@/lib/firebase';

const Shop = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  
  // Parse query parameters
  const params = new URLSearchParams(location.split('?')[1] || '');
  const categoryParam = params.get('category');
  const sortParam = params.get('sort') || 'featured';
  const filterParam = params.get('filter');
  
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000],
    categories: categoryParam ? [categoryParam] : [],
    rating: null,
    sort: sortParam,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all products
        let productsData: Product[] = [];
        
        if (filterParam === 'featured') {
          productsData = await queryDocuments('products', 'featured', '==', true) as Product[];
        } else if (filterParam === 'new') {
          productsData = await queryDocuments('products', 'isNew', '==', true) as Product[];
        } else if (filterParam === 'sale') {
          productsData = await queryDocuments('products', 'isOnSale', '==', true) as Product[];
        } else {
          productsData = await getAllDocuments('products') as Product[];
        }
        
        setProducts(productsData);
        
        // Fetch categories
        const categoriesData = await getAllDocuments('categories');
        setCategories(categoriesData as Category[]);
        
        // Set filtered products based on URL params
        applyFilters(productsData, {
          ...filters,
          categories: categoryParam ? [categoryParam] : [],
          sort: sortParam,
        });
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [categoryParam, sortParam, filterParam]);

  const applyFilters = (productsToFilter: Product[], currentFilters: FilterOptions) => {
    let result = [...productsToFilter];
    
    // Filter by price range
    result = result.filter(
      product => product.price >= currentFilters.priceRange[0] && product.price <= currentFilters.priceRange[1]
    );
    
    // Filter by categories
    if (currentFilters.categories.length > 0) {
      result = result.filter(product => 
        currentFilters.categories.includes(product.category)
      );
    }
    
    // Filter by rating
    if (currentFilters.rating !== null) {
      result = result.filter(product => product.rating >= currentFilters.rating!);
    }
    
    // Sort products
    switch (currentFilters.sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      // 'featured' is default, no sorting needed
    }
    
    setFilteredProducts(result);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };
  
  const handleApplyFilters = () => {
    applyFilters(products, filters);
    
    // Update URL with filters
    const newParams = new URLSearchParams();
    
    if (filters.categories.length > 0) {
      newParams.set('category', filters.categories[0]);
    }
    
    if (filters.sort !== 'featured') {
      newParams.set('sort', filters.sort);
    }
    
    const newQueryString = newParams.toString();
    const newLocation = newQueryString ? `/shop?${newQueryString}` : '/shop';
    setLocation(newLocation);
  };
  
  const handleSortChange = (sort: string) => {
    const newFilters = { ...filters, sort };
    setFilters(newFilters);
    applyFilters(products, newFilters);
    
    // Update URL with sort parameter
    const newParams = new URLSearchParams(location.split('?')[1] || '');
    newParams.set('sort', sort);
    setLocation(`/shop?${newParams.toString()}`);
  };

  return (
    <main className="py-12 bg-slate-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            className="md:hidden flex items-center justify-center gap-2 mb-4"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Menu size={18} />
            <span>Filters</span>
          </Button>
          
          {/* Desktop Filter Sidebar */}
          <div className={`md:w-64 ${isFilterOpen ? 'block' : 'hidden'} md:block`}>
            <FilterSidebar
              categories={categories}
              initialFilters={filters}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              loading={loading}
            />
          </div>
          
          {/* Products Container */}
          <div className="flex-1">
            {/* Sort Dropdown */}
            <div className="flex justify-end mb-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <span>Sort by: {filters.sort.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSortChange('featured')}>
                    Featured
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('price-low')}>
                    Price: Low to High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('price-high')}>
                    Price: High to Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('rating')}>
                    Highest Rated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('newest')}>
                    Newest Arrivals
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Products Grid */}
            <ProductGrid
              products={filteredProducts}
              isLoading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Shop;
