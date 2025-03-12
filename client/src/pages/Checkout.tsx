import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ShieldCheck, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import CheckoutForm from '@/components/CheckoutForm';
import OrderSummary from '@/components/OrderSummary';
import { CartItem } from '@shared/schema';

const Checkout = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { cartItems, getTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      setLocation('/cart');
    }
  }, [cartItems, orderComplete, setLocation]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser && !orderComplete) {
      setLocation('/');
    }
  }, [currentUser, orderComplete, setLocation]);
  
  const handleCheckout = async (shippingAddress: any) => {
    if (!currentUser) {
      setError('You must be logged in to complete your order');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Map cart items to the format needed for API
      const orderCartItems = cartItems.map((item: CartItem) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Create order through API
      const response = await apiRequest('POST', '/api/orders', {
        userId: 1, // In a real app, this would come from currentUser.id
        shippingAddress,
        cartItems: orderCartItems
      });
      
      const orderData = await response.json();
      
      // Clear cart and show success message
      clearCart();
      setOrderId(orderData.id);
      setOrderComplete(true);
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError('There was a problem processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-slate-600 mb-6">
            Thank you for your purchase. Your order number is #{orderId}.
          </p>
          <p className="text-slate-600 mb-8">
            We've sent a confirmation email with all the details of your order.
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <a href={`/orders`}>View Your Orders</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/shop">Continue Shopping</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* Payment Tabs */}
            <Tabs defaultValue="credit-card">
              <TabsList className="mb-6">
                <TabsTrigger value="credit-card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Credit Card
                </TabsTrigger>
                <TabsTrigger value="paypal" disabled>PayPal</TabsTrigger>
                <TabsTrigger value="bank-transfer" disabled>Bank Transfer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="credit-card">
                <CheckoutForm onSubmit={handleCheckout} isSubmitting={isSubmitting} />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Security Notice */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start space-x-4">
              <ShieldCheck className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium mb-1">Secure Checkout</h3>
                <p className="text-sm text-slate-600">
                  Your information is protected using industry-standard encryption.
                  This is a demo store for demonstration purposes only; no real payments are processed.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            cartItems={cartItems}
            total={getTotal()}
            isSubmitting={isSubmitting}
          />
          
          {/* Shipping Info */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start space-x-4">
              <Truck className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium mb-1">Shipping Information</h3>
                <p className="text-sm text-slate-600 mb-2">
                  Free shipping on all orders! Estimated delivery time is 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
