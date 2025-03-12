import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Plus, Search, Filter, Edit, Trash2, Star, 
  ArrowUp, ArrowDown, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminLayout from '@/components/AdminLayout';
import ProductForm from '@/components/ProductForm';
import { Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { 
  getAllDocuments, 
  getDocumentById, 
  createDocument, 
  updateDocument, 
  deleteDocument 
} from '@/lib/firebase';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getAllDocuments('products');
      
      // Convert Firebase data to Product type
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
      
      setProducts(convertedProducts);
      setFilteredProducts(convertedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    const sorted = [...filteredProducts].sort((a: any, b: any) => {
      if (a[field] === b[field]) return 0;
      
      if (sortDirection === 'asc') {
        if (a[field] === null) return 1;
        if (b[field] === null) return -1;
        return a[field] < b[field] ? -1 : 1;
      } else {
        if (a[field] === null) return 1;
        if (b[field] === null) return -1;
        return a[field] > b[field] ? -1 : 1;
      }
    });
    
    setFilteredProducts(sorted);
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredProducts.map(product => product.id));
      setSelectedProducts(allIds);
    } else {
      setSelectedProducts(new Set());
    }
  };
  
  const handleSelectProduct = (productId: number, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };
  
  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentProduct) return;
    
    try {
      setIsSubmitting(true);
      await deleteDocument('products', currentProduct.id.toString());
      
      toast({
        title: 'Success',
        description: 'Product has been deleted',
      });
      
      // Refresh product list
      fetchProducts();
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBulkDelete = async () => {
    try {
      setIsSubmitting(true);
      
      const deletePromises = Array.from(selectedProducts).map(id => 
        deleteDocument('products', id.toString())
      );
      
      await Promise.all(deletePromises);
      
      toast({
        title: 'Success',
        description: `${selectedProducts.size} products have been deleted`,
      });
      
      // Refresh product list
      fetchProducts();
      setSelectedProducts(new Set());
    } catch (err) {
      console.error('Error deleting products:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete products',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleProductSubmit = async (productData: any) => {
    try {
      setIsSubmitting(true);
      
      console.log("Product data received for submission:", productData);
      
      // Format product data for Firebase
      const formattedData = {
        name: productData.name || '',
        description: productData.description || null,
        price: parseFloat(productData.price) || 0,
        originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
        imageUrls: Array.isArray(productData.imageUrls) ? productData.imageUrls : [],
        category: productData.category || '',
        stock: parseInt(productData.stock) || 0,
        rating: productData.rating ? parseFloat(productData.rating) : null,
        reviewCount: productData.reviewCount ? parseInt(productData.reviewCount) : null,
        featured: productData.featured || null,
        isOnSale: productData.isOnSale || null,
        isNew: productData.isNew || null,
        createdAt: currentProduct ? currentProduct.createdAt : new Date().toISOString()
      };
      
      console.log("Formatted data to save:", formattedData);
      
      if (currentProduct) {
        // Update existing product
        await updateDocument('products', currentProduct.id.toString(), formattedData);
        toast({
          title: 'Success',
          description: 'Product has been updated',
        });
      } else {
        // Create new product
        await createDocument('products', formattedData);
        toast({
          title: 'Success',
          description: 'Product has been created',
        });
      }
      
      // Refresh product list
      fetchProducts();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => {
          setCurrentProduct(null);
          setIsAddModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Low Stock</DropdownMenuItem>
              <DropdownMenuItem>Featured</DropdownMenuItem>
              <DropdownMenuItem>On Sale</DropdownMenuItem>
              <DropdownMenuItem>New Arrivals</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {selectedProducts.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 size={16} className="mr-2" />
              )}
              Delete ({selectedProducts.size})
            </Button>
          )}
        </div>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">No products found</p>
            <Button onClick={() => {
              setCurrentProduct(null);
              setIsAddModalOpen(true);
            }}>
              Add Your First Product
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selectedProducts.size === filteredProducts.length}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name {renderSortIndicator('name')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category {renderSortIndicator('category')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-right"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end">
                    Price {renderSortIndicator('price')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-right"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center justify-end">
                    Stock {renderSortIndicator('stock')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center">
                    Rating {renderSortIndicator('rating')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                      aria-label={`Select ${product.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden">
                      <img 
                        src={product.imageUrls && product.imageUrls.length > 0 
                          ? product.imageUrls[0] 
                          : 'https://placehold.co/100x100/e2e8f0/a0aec0?text=No+Image'
                        } 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                  <TableCell className="text-right">
                    <span className={product.stock < 10 ? 'text-red-500 font-medium' : ''}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="mr-1">{product.rating?.toFixed(1) || '0.0'}</span>
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-slate-500 ml-1">({product.reviewCount || 0})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {product.isNew && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          New
                        </Badge>
                      )}
                      {product.isOnSale && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Sale
                        </Badge>
                      )}
                      {product.featured && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details for your new product.
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm 
            onSubmit={handleProductSubmit} 
            isSubmitting={isSubmitting} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for this product.
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm 
            product={currentProduct}
            onSubmit={handleProductSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentProduct && (
            <div className="flex items-center space-x-4 py-4">
              <div className="w-16 h-16 rounded bg-slate-100 overflow-hidden">
                <img 
                  src={currentProduct.imageUrls && currentProduct.imageUrls.length > 0 
                    ? currentProduct.imageUrls[0] 
                    : 'https://placehold.co/100x100/e2e8f0/a0aec0?text=No+Image'
                  } 
                  alt={currentProduct.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{currentProduct.name}</h3>
                <p className="text-sm text-slate-500">
                  {formatPrice(currentProduct.price)} • {currentProduct.category}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ProductManagement;
