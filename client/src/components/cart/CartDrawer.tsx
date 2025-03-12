import { useEffect } from 'react';
import { Link } from 'wouter';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import CartItem from './CartItem';
import { formatPrice } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const { 
    cartItems, 
    getSubtotal, 
    getTax, 
    getTotal, 
    clearCart 
  } = useCart();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-800/50 z-50 flex justify-end"
      onClick={handleBackdropClick}
    >
      <div className="h-full w-full max-w-md bg-white shadow-lg flex flex-col animate-in slide-in-from-right">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold">Your Cart ({cartItems.length})</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <svg className="h-16 w-16 text-slate-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-700 mb-2">Your cart is empty</h3>
              <p className="text-slate-500 mb-4">Looks like you haven't added any products to your cart yet.</p>
              <Button onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>
        
        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-200 p-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(getSubtotal())}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span className="font-semibold">Free</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Tax</span>
              <span className="font-semibold">{formatPrice(getTax())}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            
            <div className="space-y-2">
              <Button asChild className="w-full" onClick={onClose}>
                <Link href="/checkout">
                  Checkout
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onClose}
              >
                Continue Shopping
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50" 
                onClick={() => {
                  clearCart();
                  onClose();
                }}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
