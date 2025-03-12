import { useState } from 'react';
import { Star, StarHalf, X, Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@shared/schema';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  const { 
    id, 
    name, 
    description, 
    price, 
    originalPrice, 
    imageUrls, 
    rating, 
    reviewCount,
    isOnSale
  } = product;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addToCart({
      productId: id,
      name,
      price,
      quantity,
      imageUrl: imageUrls && imageUrls.length > 0 ? imageUrls[0] : '',
    });
    onClose();
  };

  // Render stars based on rating
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center text-yellow-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`star-${i}`} className="w-5 h-5 fill-current" />
        ))}
        
        {hasHalfStar && <StarHalf className="w-5 h-5 fill-current" />}
        
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-star-${i}`} className="w-5 h-5 text-slate-300" />
        ))}
      </div>
    );
  };

  const discount = originalPrice && price < originalPrice 
    ? Math.round((1 - price / originalPrice) * 100) 
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-2">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* Product Images */}
            <div>
              <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-slate-100">
                <img 
                  src={imageUrls && imageUrls.length > 0 
                    ? imageUrls[selectedImage] 
                    : 'https://placehold.co/800x800/e2e8f0/a0aec0?text=No+Image'} 
                  alt={name} 
                  className="w-full h-full object-cover"
                />
                
                {isOnSale && (
                  <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-500">
                    SALE
                  </Badge>
                )}
              </div>
              
              {imageUrls && imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {imageUrls.map((imageUrl, index) => (
                    <div 
                      key={index}
                      className={`aspect-square rounded-md overflow-hidden border-2 cursor-pointer ${
                        selectedImage === index ? 'border-primary' : 'border-slate-200'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`${name} - image ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div>
              <h2 className="text-2xl font-bold mb-2">{name}</h2>
              
              <div className="flex items-center mb-4 gap-2">
                {renderStars()}
                <span className="text-slate-500">({reviewCount} Reviews)</span>
              </div>
              
              <div className="mb-4 flex items-center">
                <span className="text-2xl font-bold text-primary">{formatPrice(price)}</span>
                
                {originalPrice && originalPrice > price && (
                  <>
                    <span className="text-slate-400 line-through ml-2">{formatPrice(originalPrice)}</span>
                    {discount && (
                      <Badge className="ml-2 bg-amber-500 hover:bg-amber-500">
                        Save {discount}%
                      </Badge>
                    )}
                  </>
                )}
              </div>
              
              <p className="text-slate-600 mb-6">{description}</p>
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Quantity</h3>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-r-none"
                    onClick={handleDecrease}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-16 h-10 flex items-center justify-center border-y border-slate-300">
                    {quantity}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-l-none"
                    onClick={handleIncrease}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  className="flex-grow"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
