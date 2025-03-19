import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TruckIcon, 
  ShoppingBag 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { Order } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { getAllDocuments } from '@/lib/firebase';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
    case 'processing':
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Processing</Badge>;
    case 'shipped':
      return <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">Shipped</Badge>;
    case 'delivered':
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Delivered</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'processing':
      return <Package className="h-5 w-5 text-blue-500" />;
    case 'shipped':
      return <TruckIcon className="h-5 w-5 text-indigo-500" />;
    case 'delivered':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

const Orders = () => {
  const [orders, setOrders] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be the current user's ID
        const userId = 1;
        
        const data = await getAllDocuments("orders");
        const myData  =  data.filter((d: any)=>d.userId === currentUser.uid )
        setOrders(myData);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load your orders. Please try again later.');
        toast({
          title: "Error",
          description: "There was a problem loading your orders.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentUser, toast]);
  
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">You need to be logged in to view your orders</h1>
        <p className="text-slate-600 mb-8">Please sign in to access your order history.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
          <p className="text-slate-600 mb-6">You haven't placed any orders yet.</p>
          <Button asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableCaption>Your order history</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status || "pending")}
                    {getStatusBadge(order.status || "pending")}
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                {/* <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
};

export default Orders;
