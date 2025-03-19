import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";
import { categories } from "@/lib/data";

export interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  rating: number | null;
  sort: string;
}

interface FilterSidebarProps {
  initialFilters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
  loading?: boolean;
  products: any
}

const FilterSidebar = ({
  initialFilters,
  onFilterChange,
  onApplyFilters,
  loading = false,
  products
}: FilterSidebarProps) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [priceLabel, setPriceLabel] = useState<string>(`${initialFilters.priceRange[0]}Rs - ${initialFilters.priceRange[1]}Rs`);

  // Update filters when initialFilters prop changes
  useEffect(() => {
    setFilters(initialFilters);
    setPriceLabel(`${initialFilters.priceRange[0]}Rs - ${initialFilters.priceRange[1]}Rs`);
  }, [initialFilters]);

  const handlePriceChange = (values: number[]) => {
    if (values.length >= 2) {
      const newRange: [number, number] = [values[0], values[1]];
      const updatedFilters = {
        ...filters,
        priceRange: newRange,
      };

      setFilters(updatedFilters);
      setPriceLabel(`${newRange[0]}Rs - ${newRange[1]}Rs`);

      // Notify parent component of changes
      onFilterChange(updatedFilters);
    }
  };

  var category: string = "";
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    category = urlParams.get('category') || "";
    setTimeout(() => {
      if (category)
        console.log(category);
        handleCategoryChange(category, true);
    }, 300)

  }, [category])
  const handleCategoryChange = (category: string, checked: boolean) => {
    let newCategories = [...filters.categories];

    if (checked) {
      // Add category if it doesn't already exist
      if (!newCategories.includes(category)) {
        newCategories.push(category);
      }
    } else {
      // Remove category
      newCategories = newCategories.filter((cat) => cat !== category);
    }

    const updatedFilters = {
      ...filters,
      categories: newCategories,
    };

    setFilters(updatedFilters);

    // Notify parent component of changes
    onFilterChange(updatedFilters);
  };

  const handleRatingChange = (rating: number) => {
    const updatedFilters = {
      ...filters,
      rating: filters.rating === rating ? null : rating,
    };

    setFilters(updatedFilters);

    // Notify parent component of changes
    onFilterChange(updatedFilters);
  };

  const handleClearCategories = () => {
    const updatedFilters = {
      ...filters,
      categories: [],
    };

    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Function to handle Apply Filters button click
  const handleApply = () => {
    // Pass current filters to parent
    onApplyFilters();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Filters</h3>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Price Range</h4>
        <Slider
          defaultValue={[filters.priceRange[0], filters.priceRange[1]]}
          value={[filters.priceRange[0], filters.priceRange[1]]}
          max={1000}
          step={10}
          onValueChange={handlePriceChange}
          className="mb-2"
          disabled={loading}
        />
        <div className="flex justify-between text-sm text-slate-600">
          <span>0Rs</span>
          <span className="font-medium">{priceLabel}</span>
          <span>1000Rs</span>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Categories</h4>
          {filters.categories.length > 0 && (
            <button
              className="text-xs text-blue-600 hover:underline"
              onClick={handleClearCategories}
              disabled={loading}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Selected Categories */}
        {filters.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {filters.categories.map(category => (
              <span key={`selected-${category}`} className="inline-flex items-center text-xs bg-slate-100 px-2 py-1 rounded">
                {category}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.name}`}
                checked={filters.categories.includes(category.name)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category.name, checked === true)
                }
                disabled={loading}
              />
              <Label htmlFor={`category-${category.name}`} className="text-sm cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings
      <div className="mb-6">
        <h4 className="font-medium mb-2">Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) => 
                  checked && handleRatingChange(rating)
                }
                disabled={loading}
              />
              <Label 
                htmlFor={`rating-${rating}`} 
                className="flex items-center cursor-pointer"
              >
                {Array.from({ length: rating }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-4 w-4 text-yellow-500 fill-current" 
                  />
                ))}
                {Array.from({ length: 5 - rating }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-4 w-4 text-slate-300" 
                  />
                ))}
                <span className="ml-1 text-sm">& Up</span>
              </Label>
            </div>
          ))}
        </div>
      </div> */}

      {/* <Button 
        className="w-full"
        onClick={handleApply}
        disabled={loading}
      >
        {loading ? "Applying..." : "Apply Filters"}
      </Button> */}
    </div>
  );
};

export default FilterSidebar;