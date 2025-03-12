import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem as CartItemType } from '@shared/schema';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { productId, name, price, quantity, imageUrl } = item;

  const handleIncreaseQuantity = () => {
    updateQuantity(productId, quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      updateQuantity(productId, quantity - 1);
    } else {
      removeFromCart(productId);
    }
  };

  return (
    <div className="flex items-center border-b border-slate-200 py-4 last:border-b-0">
      <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="ml-4 flex-grow">
        <h3 className="font-medium">{name}</h3>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={handleDecreaseQuantity}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span className="mx-2 w-8 text-center">{quantity}</span>
            
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={handleIncreaseQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="text-right">
            <span className="font-semibold">{formatPrice(price * quantity)}</span>
          </div>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="ml-2 text-slate-400 hover:text-red-500"
        onClick={() => removeFromCart(productId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CartItem;
