import CategoryCard from '@/components/products/CategoryCard';
import { categories } from '@/lib/data';

const Categories = () => {
  console.log(categories)

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category: any, index) => {
          return (
            <CategoryCard key={index} category={category} />
          )
        }
        )}
      </div>
    </main>
  );
};

export default Categories;
