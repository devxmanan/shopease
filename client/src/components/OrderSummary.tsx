import { CartItem } from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderSummaryProps {
  cartItems: CartItem[];
  total: number;
  isSubmitting?: boolean;
}

export default function OrderSummary({ cartItems, total, isSubmitting }: OrderSummaryProps) {
  const subtotal = total;
  const shipping = 0; // Free shipping
  const tax = total * 0.1; // 10% tax rate
  const finalTotal = subtotal + shipping + tax;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-48 mb-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex justify-between items-start py-2">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-md overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            {isSubmitting ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span>{formatPrice(subtotal)}</span>
            )}
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            {isSubmitting ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span>Free</span>
            )}
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (10%)</span>
            {isSubmitting ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span>{formatPrice(tax)}</span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="w-full flex justify-between items-center">
          <span className="font-semibold">Total</span>
          {isSubmitting ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <span className="text-xl font-bold">{formatPrice(finalTotal)}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}