import { Link } from 'wouter';
import { Category } from '@shared/schema';


const CategoryCard = ({ category }: {category: any}) => {

  return (
    <Link href={`/shop?category=${encodeURIComponent(category)}`}>
      <div className="relative rounded-lg overflow-hidden group cursor-pointer">
        <img 
          src={category.image} 
          alt={category.name} 
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-white font-bold text-lg">{category.name}</h3>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
