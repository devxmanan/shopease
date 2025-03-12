import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Users, Package, ShoppingCart, Truck, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/AdminLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { getAllDocuments } from '@/lib/firebase';
import { Product, Order, User } from '@shared/schema';

// Demo data for charts
const revenueData = [
  { name: 'Jan', value: 2400 },
  { name: 'Feb', value: 1398 },
  { name: 'Mar', value: 9800 },
  { name: 'Apr', value: 3908 },
  { name: 'May', value: 4800 },
  { name: 'Jun', value: 3800 },
  { name: 'Jul', value: 4300 },
];

const salesData = [
  { name: 'Electronics', value: 4000 },
  { name: 'Clothing', value: 3000 },
  { name: 'Footwear', value: 2000 },
  { name: 'Accessories', value: 2780 },
];

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getAllDocuments('products');
        const ordersData = await getAllDocuments('orders');
        const usersData = await getAllDocuments('users');
        
        // Convert Firebase data to proper types
        const convertedProducts: Product[] = productsData.map((doc: any) => ({
          id: parseInt(doc.id),
          name: doc.name || '',
          description: doc.description || null,
          price: doc.price || 0,
          originalPrice: doc.originalPrice || null,
          imageUrls: doc.imageUrls || null,
          category: doc.category || '',
          stock: doc.stock || 0,
          rating: doc.rating || null,
          reviewCount: doc.reviewCount || null,
          featured: doc.featured || null,
          isOnSale: doc.isOnSale || null,
          isNew: doc.isNew || null,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : null
        }));
        
        const convertedOrders: Order[] = ordersData.map((doc: any) => ({
          id: parseInt(doc.id),
          userId: doc.userId || 0,
          status: doc.status || 'pending',
          total: doc.total || 0,
          shippingAddress: doc.shippingAddress || null,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
        }));
        
        const convertedUsers: User[] = usersData.map((doc: any) => ({
          id: parseInt(doc.id),
          email: doc.email || '',
          password: doc.password || null,
          displayName: doc.displayName || null,
          photoURL: doc.photoURL || null,
          role: doc.role || 'user',
          firebaseId: doc.firebaseId || null,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : null,
        }));
        
        setProducts(convertedProducts);
        setOrders(convertedOrders);
        setUsers(convertedUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate metrics
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => product.stock < 10).length;
  
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="space-x-2">
          <Button variant="outline">Export</Button>
          <Button>
            <Link href="/admin/products/new">Add New Product</Link>
          </Button>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">${totalSales.toFixed(2)}</h3>
                <p className="text-xs text-green-500 flex items-center mt-1.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    className="w-3 h-3 mr-1"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  12% from last month
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Orders</p>
                <h3 className="text-2xl font-bold mt-1">{orders.length}</h3>
                <p className="text-xs text-green-500 flex items-center mt-1.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    className="w-3 h-3 mr-1"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  5% from last month
                </p>
              </div>
              <div className="bg-amber-50 p-3 rounded-full">
                <ShoppingCart className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Customers</p>
                <h3 className="text-2xl font-bold mt-1">{users.length}</h3>
                <p className="text-xs text-green-500 flex items-center mt-1.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    className="w-3 h-3 mr-1"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  18% from last month
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Products</p>
                <h3 className="text-2xl font-bold mt-1">{totalProducts}</h3>
                <p className="text-xs text-red-500 flex items-center mt-1.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    className="w-3 h-3 mr-1 rotate-180"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  {lowStockProducts} low stock
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
        {/* Charts */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Sales and revenue analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                </TabsList>
                <select className="bg-transparent text-sm border rounded px-2 py-1">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                  <option>Last year</option>
                </select>
              </div>
              
              <TabsContent value="revenue" className="mt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="sales" className="mt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest orders and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {orders.slice(0, 5).map((order, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-slate-100 rounded-full p-2 mt-0.5">
                    <ShoppingCart className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New order #{order.id}</p>
                    <p className="text-xs text-slate-500">
                      ${order.total.toFixed(2)} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {orders.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{pendingOrders}</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders" className="flex items-center gap-1 text-primary">
                  View <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{lowStockProducts}</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/products" className="flex items-center gap-1 text-primary">
                  View <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Today's Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">$1,243.32</h3>
              <div className="text-green-500 text-sm flex items-center">
                +18% <ArrowUpRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
