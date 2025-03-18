import { Link } from 'wouter';
import { Category } from '@shared/schema';


const CategoryCard = ({ category }: {category: string}) => {
  const defaultImage = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
  
  return (
    <Link href={`/shop?category=${encodeURIComponent(category)}`}>
      <div className="relative rounded-lg overflow-hidden group cursor-pointer">
        <img 
          src={category || defaultImage} 
          alt={category} 
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-white font-bold text-lg">{category}</h3>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
