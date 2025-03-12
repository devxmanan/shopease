import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import CartDrawer from '@/components/cart/CartDrawer';

const Navbar = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Get auth context 
  const { currentUser, isAdmin, logout } = useAuth();
  
  const { cartItems, getTotalItems } = useCart();
  const [_, setLocation] = useLocation();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-primary text-2xl font-bold">ShopEase</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/shop" className="font-medium hover:text-primary transition-colors">
                Shop
              </Link>
              <Link href="/categories" className="font-medium hover:text-primary transition-colors">
                Categories
              </Link>
              <Link href="/about" className="font-medium hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="font-medium hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                <Search size={20} />
              </Button>
              
              {/* User Account */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                    <User size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {currentUser ? (
                    <>
                      <DropdownMenuItem className="cursor-default font-semibold">
                        {currentUser.displayName || currentUser.email}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="cursor-pointer w-full">My Account</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="cursor-pointer w-full">Orders</Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer w-full">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        Logout
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => setIsLoginModalOpen(true)} className="cursor-pointer">
                        Login
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsRegisterModalOpen(true)} className="cursor-pointer">
                        Register
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Cart */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:text-primary transition-colors relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden hover:text-primary transition-colors"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-4 space-y-1 bg-white border-t border-gray-100">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-100">
              Home
            </Link>
            <Link href="/shop" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-100">
              Shop
            </Link>
            <Link href="/categories" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-100">
              Categories
            </Link>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-100">
              About
            </Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-100">
              Contact
            </Link>
          </div>
        )}
      </header>

      {/* Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onRegisterClick={() => {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(true);
      }} />
      
      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} onLoginClick={() => {
        setIsRegisterModalOpen(false);
        setIsLoginModalOpen(true);
      }} />
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
