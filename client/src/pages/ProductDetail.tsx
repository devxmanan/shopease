import { useState, useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, StarHalf, Minus, Plus, ShoppingCart, Heart, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@shared/schema';
import { getDocumentById, queryDocuments } from '@/lib/firebase';
import { formatPrice } from '@/lib/utils';
import ProductGrid from '@/components/products/ProductGrid';

const ProductDetail = () => {
  const [match, params] = useRoute('/product/:id');
  const productId = params?.id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const productData = await getDocumentById('products', productId);
        
        if (!productData) {
          setError('Product not found');
          return;
        }
        
        setProduct(productData as Product);
        
        // Fetch related products in the same category
        if (productData.category) {
          const relatedProductsData = await queryDocuments(
            'products', 
            'category', 
            '==', 
            productData.category
          );
          
          // Filter out the current product
          const filtered = relatedProductsData.filter(
            (item: any) => item.id !== productId
          );
          
          setRelatedProducts(filtered.slice(0, 4) as Product[]);
        }
        
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);
  
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '',
    });
  };
  
  // Render stars based on rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center text-yellow-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`star-${i}`} className="w-5 h-5 fill-current" />
        ))}
        
        {hasHalfStar && <StarHalf className="w-5 h-5 fill-current" />}
        
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-star-${i}`} className="w-5 h-5 text-slate-300" />
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="w-full aspect-square rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">
          {error || 'Product not found'}
        </h1>
        <p className="mb-6">The product you're looking for might have been removed or is temporarily unavailable.</p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }
  
  const discount = product.originalPrice && product.price < product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : null;
  
  return (
    <main className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/shop">Shop</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/shop?category=${encodeURIComponent(product.category)}`}>
                {product.category}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem className="text-slate-500 font-medium">
            {product.name}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div>
          <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-slate-100">
            <img 
              src={product.imageUrls && product.imageUrls.length > 0 
                ? product.imageUrls[selectedImage] 
                : 'https://placehold.co/800x800/e2e8f0/a0aec0?text=No+Image'} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            
            {product.isOnSale && (
              <Badge className="absolute top-4 left-4 bg-amber-500 hover:bg-amber-500">
                SALE
              </Badge>
            )}
            
            {product.isNew && (
              <Badge className="absolute top-4 left-4 bg-emerald-600 hover:bg-emerald-600">
                NEW
              </Badge>
            )}
          </div>
          
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.imageUrls.map((imageUrl, index) => (
                <div 
                  key={index}
                  className={`aspect-square rounded-md overflow-hidden border-2 cursor-pointer ${
                    selectedImage === index ? 'border-primary' : 'border-slate-200'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={imageUrl} 
                    alt={`${product.name} - image ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4 gap-2">
            {renderStars(product.rating)}
            <span className="text-slate-500">({product.reviewCount} Reviews)</span>
          </div>
          
          <div className="mb-6 flex items-center">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-slate-400 line-through ml-3 text-xl">
                  {formatPrice(product.originalPrice)}
                </span>
                {discount && (
                  <Badge className="ml-2 bg-amber-500 hover:bg-amber-500">
                    Save {discount}%
                  </Badge>
                )}
              </>
            )}
          </div>
          
          <p className="text-slate-600 mb-8">{product.description}</p>
          
          {/* Stock status */}
          <div className="mb-6">
            <div className="flex items-center">
              <span className="font-medium mr-2">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-emerald-600 font-medium">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-red-500 font-medium">Out of Stock</span>
              )}
            </div>
          </div>
          
          {/* Quantity Selector */}
          <div className="mb-8">
            <h3 className="font-medium mb-2">Quantity</h3>
            <div className="flex items-center mb-6">
              <Button
                variant="outline"
                size="icon"
                className="rounded-r-none"
                onClick={handleDecrease}
                disabled={product.stock === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="w-16 h-10 flex items-center justify-center border-y border-slate-300">
                {quantity}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="rounded-l-none"
                onClick={handleIncrease}
                disabled={product.stock === 0 || quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <Button
              className="flex-grow"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" /> 
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator />
          
          {/* Product Meta */}
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex items-center">
              <span className="font-medium w-24">SKU:</span>
              <span className="text-slate-600">PROD-{product.id}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-24">Category:</span>
              <Link 
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-primary hover:underline"
              >
                {product.category}
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Tabs */}
      <Tabs defaultValue="description" className="mb-16">
        <TabsList className="mb-6">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="p-6 bg-white rounded-lg border border-slate-200">
          <div className="prose max-w-none">
            <p>{product.description}</p>
            
            {/* Add more detailed description here */}
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. 
              Vivamus vel eros vel eros ultrices tincidunt. Sed at odio sit amet erat 
              hendrerit rhoncus. Morbi volutpat, magna et rutrum varius, lectus 
              nunc eleifend magna, id fermentum enim velit vel nisl.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="specifications" className="p-6 bg-white rounded-lg border border-slate-200">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded">
                <h4 className="font-medium mb-2">Dimensions</h4>
                <p className="text-slate-600">12 x 8 x 2 inches</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded">
                <h4 className="font-medium mb-2">Weight</h4>
                <p className="text-slate-600">0.5 kg</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded">
                <h4 className="font-medium mb-2">Materials</h4>
                <p className="text-slate-600">Premium quality materials</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded">
                <h4 className="font-medium mb-2">Warranty</h4>
                <p className="text-slate-600">1 year limited warranty</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="reviews" className="p-6 bg-white rounded-lg border border-slate-200">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Customer Reviews</h3>
              <Button>Write a Review</Button>
            </div>
            
            {/* Sample reviews */}
            {product.reviewCount > 0 ? (
              <div className="space-y-6">
                <div className="border-b pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">John Doe</h4>
                    <span className="text-sm text-slate-500">2 days ago</span>
                  </div>
                  <div className="flex items-center mb-2">
                    {renderStars(5)}
                  </div>
                  <p className="text-slate-600">
                    Great product! Exactly as described. The quality is excellent 
                    and it arrived sooner than expected.
                  </p>
                </div>
                
                <div className="border-b pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Jane Smith</h4>
                    <span className="text-sm text-slate-500">1 week ago</span>
                  </div>
                  <div className="flex items-center mb-2">
                    {renderStars(4)}
                  </div>
                  <p className="text-slate-600">
                    I'm quite satisfied with my purchase. The item is good quality, 
                    though shipping took a bit longer than expected.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                No reviews yet. Be the first to leave a review!
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </main>
  );
};

export default ProductDetail;
