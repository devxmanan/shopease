import { useState } from 'react';
import { Link } from 'wouter';
import { Eye, Heart, ShoppingCart, Star, StarHalf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { Product } from '@shared/schema';
import { cn, formatPrice } from '@/lib/utils';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const { addToCart } = useCart();
  
  const { 
    id, 
    name, 
    price, 
    originalPrice, 
    imageUrls, 
    rating, 
    reviewCount,
    isOnSale,
    isNew
  } = product;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      productId: id,
      name,
      price,
      quantity: 1,
      imageUrl: imageUrls && imageUrls.length > 0 ? imageUrls[0] : '',
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  // Render stars based on rating
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center text-yellow-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`star-${i}`} className="w-4 h-4 fill-current" />
        ))}
        
        {hasHalfStar && <StarHalf className="w-4 h-4 fill-current" />}
        
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-star-${i}`} className="w-4 h-4 text-slate-300" />
        ))}
        
        <span className="text-slate-500 text-xs ml-1">({reviewCount})</span>
      </div>
    );
  };

  return (
    <>
      <Card className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group">
        {isOnSale && (
          <Badge variant="default" className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-500 z-10">
            SALE
          </Badge>
        )}
        
        {isNew && (
          <Badge variant="default" className="absolute top-2 left-2 bg-emerald-600 hover:bg-emerald-600 z-10">
            NEW
          </Badge>
        )}
        
        <Link href={`/product/${id}`}>
          <div className="relative aspect-square">
            <img 
              src={imageUrls && imageUrls.length > 0 ? imageUrls[0] : 'https://placehold.co/500x500/e2e8f0/a0aec0?text=No+Image'} 
              alt={name} 
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="icon"
                className="bg-white text-primary p-2 rounded-full mx-1 hover:bg-primary hover:text-white transition-colors"
                onClick={handleQuickView}
                title="Quick view"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {/* <Button
                variant="secondary"
                size="icon"
                className="bg-white text-primary p-2 rounded-full mx-1 hover:bg-primary hover:text-white transition-colors"
                title="Add to wishlist"
              >
                <Heart className="h-4 w-4" />
              </Button> */}
            </div>
          </div>
          
          <CardContent className="p-4">
            <h3 className="font-semibold mb-1 text-lg">{name}</h3>
            <div className="flex items-center mb-2">
              {renderStars()}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-primary font-semibold">{formatPrice(price)}</span>
                {originalPrice && originalPrice > price && (
                  <span className="text-slate-400 line-through text-sm ml-2">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              <Button
                variant="default"
                size="icon"
                className="rounded-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Link>
      </Card>
      
      {showQuickView && (
        <QuickViewModal 
          product={product} 
          isOpen={showQuickView} 
          onClose={() => setShowQuickView(false)} 
        />
      )}
    </>
  );
};

export default ProductCard;
