import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ShoppingCart, AlertCircle, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import CartItem from '@/components/cart/CartItem';
import { Separator } from '@/components/ui/separator';

const Cart = () => {
  const { 
    cartItems, 
    clearCart, 
    getTotalItems, 
    getSubtotal, 
    getTax, 
    getTotal 
  } = useCart();
  
  const isEmpty = cartItems.length === 0;

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg shadow-sm">
          <ShoppingCart className="h-16 w-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-medium text-slate-700 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            Looks like you haven't added any products to your cart yet. 
            Continue shopping and find something you like!
          </p>
          <Button asChild size="lg">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Cart Items ({getTotalItems()})
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>
              
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(getSubtotal())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax (8%)</span>
                  <span className="font-medium">{formatPrice(getTax())}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/checkout" className="flex items-center justify-center gap-2">
                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-amber-500" />
                  <p>
                    <strong className="font-semibold">Note:</strong> This is a demo store. No real payments will be processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;
