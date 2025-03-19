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
import { getAllDocuments, queryDocuments } from '@/lib/firebase';

const Shop = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useLocation();

  // Parse query parameters
  const params = new URLSearchParams(location.split('?')[1] || '');

  // Handle both 'categories' (plural) and 'category' (singular) parameters
  const categoriesParam = params.get('categories');
  const categoryParam = params.get('category');
  const sortParam = params.get('sort') || 'all';
  const filterParam = params.get('filter');

  // Parse categories from URL (format: category1,category2,category3)
  const getCategoriesFromUrl = () => {
    const categories: string[] = [];

    // Add from 'categories' parameter (comma-separated)
    if (categoriesParam) {
      categories.push(...categoriesParam.split(',').filter(Boolean));
    }

    // Add from 'category' parameter (single value)
    if (categoryParam && !categories.includes(categoryParam)) {
      categories.push(categoryParam);
    }

    return categories;
  };

  // Initialize filters state
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000],
    categories: getCategoriesFromUrl(),
    rating: null,
    sort: sortParam,
  });

  // Apply filters to products
  const applyFilters = (productsToFilter: any[], currentFilters: FilterOptions) => {
    let result = [...productsToFilter];

    // Filter by categories - product matches if it's in ANY of the selected categories
    if (currentFilters.categories && currentFilters.categories.length > 0) {
      result = result.filter(product =>
        currentFilters.categories.includes(product.category)
      );
    }

    // Filter by price range
    if (currentFilters.priceRange && currentFilters.priceRange.length === 2) {
      result = result.filter(
        product => product.price >= currentFilters.priceRange[0] && product.price <= currentFilters.priceRange[1]
      );
    }

    // Filter by rating
    if (currentFilters.rating !== null) {
      result = result.filter(product => product.rating && product.rating >= currentFilters.rating!);
    }

    // Sort products
    if (currentFilters.sort && currentFilters.sort !== 'all') {
      switch (currentFilters.sort) {
        case 'price-low':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => {
            const aRating = a.rating || 0;
            const bRating = b.rating || 0;
            return bRating - aRating;
          });
          break;
        case 'newest':
          result.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          break;
        case 'featured':
          result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
        // 'all' is default, no sorting needed
      }
    }

    setFilteredProducts(result);
  };

  // Update filters when URL changes
  useEffect(() => {
    const categoriesFromUrl = getCategoriesFromUrl();

    setFilters(prevFilters => ({
      ...prevFilters,
      categories: categoriesFromUrl,
      sort: sortParam || 'all',
    }));
  }, [location, categoriesParam, categoryParam, sortParam]);

  // Fetch products and apply filters when component mounts or URL parameters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products based on filter parameter
        let productsData: any[] = [];

        if (filterParam === 'featured') {
          productsData = await queryDocuments('products', 'featured', '==', true);
        } else if (filterParam === 'new') {
          productsData = await queryDocuments('products', 'isNew', '==', true);
        } else if (filterParam === 'sale') {
          productsData = await queryDocuments('products', 'isOnSale', '==', true);
        } else {
          productsData = await getAllDocuments('products');
        }

        setProducts(productsData);

        // Apply current filters to the products
        applyFilters(productsData, filters);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, filterParam]);

  // Handle filter changes from FilterSidebar
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    // Don't immediately apply filters - wait for Apply button
  };

  // Apply filters and update URL
  const handleApplyFilters = () => {
    // Apply all filters including price range
    applyFilters(products, filters);

    // Update URL with filters
    const newParams = new URLSearchParams();

    // Add multiple categories to URL as comma-separated values
    if (filters.categories && filters.categories.length > 0) {
      newParams.set('categories', filters.categories.join(','));
    }

    if (filters.sort && filters.sort !== 'all') {
      newParams.set('sort', filters.sort);
    }

    if (filterParam) {
      newParams.set('filter', filterParam);
    }

    const newQueryString = newParams.toString();
    const newLocation = newQueryString ? `/shop?${newQueryString}` : '/shop';
    setLocation(newLocation);
  };

  // Handle sort change from dropdown
  const handleSortChange = (sort: string) => {
    const newFilters = { ...filters, sort };
    setFilters(newFilters);
    applyFilters(products, newFilters);

    // Update URL with sort parameter
    const newParams = new URLSearchParams(location.split('?')[1] || '');

    if (sort === 'all') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', sort);
    }

    // Preserve category parameters
    if (filters.categories && filters.categories.length > 0) {
      newParams.set('categories', filters.categories.join(','));
    }

    const newQueryString = newParams.toString();
    const newLocation = newQueryString ? `/shop?${newQueryString}` : '/shop';
    setLocation(newLocation);
  };

  // Format sort display name
  const getSortDisplayName = (sort: string) => {
    switch (sort) {
      case 'price-low': return 'Price: Low to High';
      case 'price-high': return 'Price: High to Low';
      case 'rating': return 'Highest Rated';
      case 'newest': return 'Newest Arrivals';
      case 'featured': return 'Featured';
      default: return 'All Products';
    }
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
              products={products}
              initialFilters={filters}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              loading={loading}
            />
          </div>

          {/* Products Container */}
          <div className="flex-1">
            {/* Sort Dropdown */}
            <div className="flex justify-between items-center mb-6">
              {/* Selected Categories Pills */}
              <div className="flex flex-wrap gap-2">
                {filters.categories.length > 0 && (
                  <div className="text-sm text-slate-600">
                    Categories: {filters.categories.join(', ')}
                  </div>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <span>Sort by: {getSortDisplayName(filters.sort)}</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSortChange('all')}>
                    All Products
                  </DropdownMenuItem>
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