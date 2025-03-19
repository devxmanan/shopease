import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Search,
  Filter,
  ChevronDown,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Order, OrderItem, Product } from '@shared/schema';
import { formatPrice } from '@/lib/utils';
import {
  getAllDocuments,
  getDocumentById,
  updateDocument,
  queryDocuments
} from '@/lib/firebase';
import { apiRequest } from '@/lib/queryClient';

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
      return <Truck className="h-5 w-5 text-indigo-500" />;
    case 'delivered':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<any>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any>([]);
  const [orderProducts, setOrderProducts] = useState<Map<any, any>>(new Map());
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply search filter (search by order ID or customer info)
    if (searchTerm) {
      result = result.filter(order =>
        order.id.toString().includes(searchTerm) ||
        JSON.stringify(order.shippingAddress).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(result);
  }, [orders, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getAllDocuments('orders');

      // Convert Firebase data to proper Order type
      const convertedOrders: any = ordersData.map((order: any) => ({
        id: order.id,
        userId: order.userId || 0,
        status: order.status || 'pending',
        subtotal: parseFloat(order.subtotal) || 0,
        tax: parseFloat(order.tax) || 0,
        cartItems: order.cartItems || [],
        total: parseFloat(order.total) || 0,
        shippingAddress: order.shippingAddress || {
          fullName: '',
          streetAddress: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          phoneNumber: ''
        },
        createdAt: order.createdAt ? order.createdAt : null
      }));

      setOrders(convertedOrders);
      setFilteredOrders(convertedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (order: any) => {
    setCurrentOrder(order);
    setIsViewModalOpen(true);

    try {

      const convertedOrderItems: any = await currentOrder.cartItems.map((item: any) => ({
        productId: item.productId,
        quantity: (item.quantity),
        price: (item.price)
      }));
      setOrderItems(convertedOrderItems);

      // Fetch product details for each order item
      const productsMap = new Map<number, Product>();

      for (const item of convertedOrderItems) {
        const productData = await getDocumentById('products', item.productId);
        if (productData) {
          const convertedProduct: any = {
            id: productData.id,
            name: productData.name || '',
            description: productData.description || null,
            price: parseFloat(productData.price) || 0,
            originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
            imageUrls: productData.imageUrls || null,
            category: productData.category || '',
            stock: parseInt(productData.stock) || 0,
            rating: productData.rating ? parseFloat(productData.rating) : null,
            reviewCount: productData.reviewCount ? parseInt(productData.reviewCount) : null,
            featured: productData.featured || null,
            isOnSale: productData.isOnSale || null,
            isNew: productData.isNew || null,
            createdAt: productData.createdAt ? productData.createdAt : null
          };
          productsMap.set(item.productId, convertedProduct);
        }
      }

      setOrderProducts(productsMap);
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  const handleStatusChange = (order: any) => {
    setCurrentOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const updateOrderStatus = async () => {
    if (!currentOrder || !newStatus) return;

    try {
      setIsSubmitting(true);
      await updateDocument("orders", currentOrder.id, { ...currentOrder, status: newStatus })
      await fetchOrders();
      setIsStatusModalOpen(false);
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search orders..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              {statusFilter ? `Status: ${statusFilter}` : 'All Statuses'}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('processing')}>
              Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('shipped')}>
              Shipped
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('delivered')}>
              Delivered
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">No orders found</p>
            <Button variant="outline" onClick={() => {
              setStatusFilter(null);
              setSearchTerm('');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {order.shippingAddress.fullName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      {getStatusBadge(order.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(order.subtotal)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => handleStatusChange(order)}
                      >
                        Update Status
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* View Order Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{currentOrder?.id} - {currentOrder && new Date(currentOrder.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {currentOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentOrder.status)}
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(currentOrder.status)}
                </div>
                <Button variant="outline" size="sm" onClick={() => handleStatusChange(currentOrder)}>
                  Update Status
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Customer Information</h3>
                  <div className="bg-slate-50 p-4 rounded-md">
                    <p className="font-medium">{currentOrder.shippingAddress.fullName}</p>
                    <p>{currentOrder.shippingAddress.streetAddress}</p>
                    <p>
                      {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}
                    </p>
                    <p>{currentOrder.shippingAddress.country}</p>
                    <p className="mt-2">{currentOrder.shippingAddress.phoneNumber}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Order Summary</h3>
                  <div className="bg-slate-50 p-4 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Subtotal</span>
                      <span>{formatPrice(currentOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Tax (8%)</span>
                      <span>{formatPrice(currentOrder.subtotal * 0.08)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t border-slate-200 my-2"></div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatPrice(currentOrder.subtotal + currentOrder.subtotal * 0.08)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Order Items</h3>
                <div className="bg-slate-50 p-4 rounded-md">
                  <div className="space-y-4">
                    {orderItems.map((item: any) => {
                      const product = orderProducts.get(item.productId);
                      return (
                        <div key={item.id} className="flex items-center">
                          <div className="h-16 w-16 rounded bg-white overflow-hidden mr-4 flex-shrink-0">
                            <img
                              src={product?.imageUrls?.[0] || 'https://placehold.co/100x100/e2e8f0/a0aec0?text=No+Image'}
                              alt={product?.name || `Product ${item.productId}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium">
                              {product?.name || `Product ID: ${item.productId}`}
                            </h4>
                            <div className="flex justify-between mt-1">
                              <div className="text-sm text-slate-600">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </div>
                              <div className="font-medium">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {orderItems.length === 0 && (
                      <p className="text-center text-slate-500 py-2">No items found for this order</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order #{currentOrder?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Status:</p>
              <div className="flex items-center gap-2">
                {currentOrder && getStatusIcon(currentOrder.status)}
                {currentOrder && getStatusBadge(currentOrder.status)}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">New Status:</p>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={updateOrderStatus}
              disabled={isSubmitting || newStatus === currentOrder?.status}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default OrderManagement;
