import { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertOrderItemSchema, insertCategorySchema, addressSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiRouter = (path: string) => `/api${path}`;

  // Users routes
  app.get(apiRouter('/users'), async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch users", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.get(apiRouter('/users/:id'), async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch user", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post(apiRouter('/users'), async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          error: fromZodError(error).message 
        });
      }
      res.status(500).json({ 
        message: "Failed to create user", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Products routes
  app.get(apiRouter('/products'), async (req: Request, res: Response) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch products", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.get(apiRouter('/products/:id'), async (req: Request, res: Response) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch product", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post(apiRouter('/products'), async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          error: fromZodError(error).message 
        });
      }
      res.status(500).json({ 
        message: "Failed to create product", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.put(apiRouter('/products/:id'), async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(parseInt(req.params.id), productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          error: fromZodError(error).message 
        });
      }
      res.status(500).json({ 
        message: "Failed to update product", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.delete(apiRouter('/products/:id'), async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteProduct(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to delete product", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Categories routes
  app.get(apiRouter('/categories'), async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch categories", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post(apiRouter('/categories'), async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid category data", 
          error: fromZodError(error).message 
        });
      }
      res.status(500).json({ 
        message: "Failed to create category", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Orders routes
  app.get(apiRouter('/orders'), async (req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch orders", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.get(apiRouter('/users/:userId/orders'), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch user orders", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.get(apiRouter('/orders/:id'), async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(order.id);
      
      res.json({ ...order, items: orderItems });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch order", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post(apiRouter('/orders'), async (req: Request, res: Response) => {
    try {
      // Validate address
      const orderSchema = z.object({
        shippingAddress: z.object({
          fullName: z.string(),
          streetAddress: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
          country: z.string(),
          phoneNumber: z.string()
        }),
        userId: z.string(),
        cartItems: z.array(z.object({
          productId: z.string(),
          quantity: z.number(),
          price: z.number()
        }))
      });
      
      const { shippingAddress, userId, cartItems } = orderSchema.parse(req.body);
      
      // Calculate total
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create order
      const order = await storage.createOrder({
        userId,
        total,
        shippingAddress,
        status: "pending"
      });
      
      // Create order items
      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
        
        // Update product stock
        const product = await storage.getProduct(item.productId);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await storage.updateProduct(item.productId, { ...product, stock: newStock });
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid order data", 
          error: fromZodError(error).message 
        });
      }
      res.status(500).json({ 
        message: "Failed to create order", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.put(apiRouter('/orders/:id/status'), async (req: Request, res: Response) => {
    try {
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const order = await storage.updateOrderStatus(parseInt(req.params.id), status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid status", 
          error: fromZodError(error).message 
        });
      }
      res.status(500).json({ 
        message: "Failed to update order status", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}