import { getActiveProducts } from "@/actions/products";
import { StoreClient } from "./store-client";

export default async function StorePage() {
  // Add timeout and better error handling
  let productsData = { products: [] };
  
  try {
    productsData = await Promise.race([
      getActiveProducts(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 8000)
      ),
    ]).catch((error) => {
      console.error("Error fetching products:", error);
      return { products: [] };
    });
  } catch (error) {
    console.error("Failed to load products:", error);
  }

  return <StoreClient initialProducts={productsData.products || []} />;
}

