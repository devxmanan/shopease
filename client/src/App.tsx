import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProductManagement from "./pages/Admin/ProductManagement";
import OrderManagement from "./pages/Admin/OrderManagement";
import AdminRoute from "./components/routing/AdminRoute";
import MyAccount from "./pages/MyAccount";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/orders" component={Orders} />
          <Route path="/categories" component={Categories} />
          <Route path="/about" component={About} />
          <Route path="/account" component={MyAccount} />
          <Route path="/contact" component={Contact} />
          <Route path="/admin">
            {() => <AdminRoute component={AdminDashboard} />}
          </Route>
          <Route path="/admin/products">
            {() => <AdminRoute component={ProductManagement} />}
          </Route>
          <Route path="/admin/orders">
            {() => <AdminRoute component={OrderManagement} />}
          </Route>
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
