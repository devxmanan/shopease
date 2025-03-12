import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Product, insertProductSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCloudinary } from "@/hooks/useCloudinary";
import { Loader2 } from "lucide-react";

interface ProductFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  product?: Product;
}

type FormValues = {
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  category: string;
  stock: number;
  featured: boolean | null;
  isOnSale: boolean | null;
  isNew: boolean | null;
  imageUrls: string[] | null;
};

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Health & Beauty",
  "Automotive",
  "Other"
];

export default function ProductForm({ onSubmit, isSubmitting, product }: ProductFormProps) {
  const { toast } = useToast();
  const { uploadImage, uploading, error } = useCloudinary({
    uploadPreset: "shopease", // Using the hardcoded upload preset name
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      originalPrice: product?.originalPrice || null,
      category: product?.category || "Other",
      stock: product?.stock || 0,
      featured: product?.featured || false,
      isOnSale: product?.isOnSale || false,
      isNew: product?.isNew || false,
      imageUrls: Array.isArray(product?.imageUrls) ? product.imageUrls : []
    }
  });
  
  // Log the product and form values to debug
  useEffect(() => {
    if (product) {
      console.log('Product passed to form:', product);
      console.log('Image URLs in product:', product.imageUrls);
      console.log('Form values:', form.getValues());
    }
  }, [product]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      console.log("Starting image upload for file:", file.name);
      const result = await uploadImage(file);
      
      if (result) {
        console.log("Upload successful, adding URL to form:", result.url);
        const currentUrls = form.getValues("imageUrls") || [];
        form.setValue("imageUrls", [...currentUrls, result.url]);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
          variant: "default"
        });
      } else if (error) {
        console.error("Upload failed with error:", error);
        toast({
          title: "Upload Error",
          description: error,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      toast({
        title: "Error",
        description: "Failed to upload image: " + (err instanceof Error ? err.message : "Unknown error"),
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      await onSubmit(data);
    } catch (err) {
      console.error("Error submitting form:", err);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="originalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    value={field.value || ""} 
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} 
                  />
                </FormControl>
                <FormDescription>
                  Set this if the product is on sale
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured</FormLabel>
                  <FormDescription>
                    Show on homepage
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch 
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isOnSale"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">On Sale</FormLabel>
                  <FormDescription>
                    Mark as discounted
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch 
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isNew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">New</FormLabel>
                  <FormDescription>
                    Mark as new arrival
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch 
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <Label>Images</Label>
          <div className="grid grid-cols-4 gap-4">
            {form.watch("imageUrls")?.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => {
                    const currentUrls = form.getValues("imageUrls") || [];
                    form.setValue("imageUrls", currentUrls.filter((_, i) => i !== index));
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
            <div className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
              <label className="cursor-pointer p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  <>
                    <div className="text-sm font-medium mb-1">Add Image</div>
                    <div className="text-xs text-slate-500">Click to upload</div>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}