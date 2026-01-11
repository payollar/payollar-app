"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { revalidatePath } from "next/cache";

const PLATFORM_FEE_PERCENTAGE = 0.01; // 1% platform fee

/**
 * Create a new digital product
 */
export async function createDigitalProduct(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const creator = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
    });

    if (!creator) {
      throw new Error("Creator not found");
    }

    if (creator.verificationStatus !== "VERIFIED") {
      throw new Error("You must be verified to create products");
    }

    // Get form data
    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const category = formData.get("category");
    const imageUrl = formData.get("imageUrl");
    const fileUrl = formData.get("fileUrl");
    const fileType = formData.get("fileType");
    const status = formData.get("status") || "DRAFT";

    // Validate required fields
    if (!title || !description || !price || !fileUrl) {
      throw new Error("Title, description, price, and file are required");
    }

    const priceFloat = parseFloat(price);
    if (isNaN(priceFloat) || priceFloat <= 0) {
      throw new Error("Price must be a positive number");
    }

    // Create product
    const product = await db.digitalProduct.create({
      data: {
        creatorId: creator.id,
        title: title.trim(),
        description: description.trim(),
        price: priceFloat,
        category: category?.trim() || null,
        imageUrl: imageUrl || null,
        fileUrl: fileUrl.trim(),
        fileType: fileType?.trim() || null,
        status: status,
      },
    });

    revalidatePath("/creator");
    return { success: true, product };
  } catch (error) {
    console.error("Failed to create product:", error);
    throw new Error("Failed to create product: " + error.message);
  }
}

/**
 * Update a digital product
 */
export async function updateDigitalProduct(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const creator = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
      select: {
        id: true,
      },
    });

    if (!creator) {
      throw new Error("Creator not found");
    }

    const productId = formData.get("productId");
    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const category = formData.get("category");
    const imageUrl = formData.get("imageUrl");
    const fileUrl = formData.get("fileUrl");
    const fileType = formData.get("fileType");
    const status = formData.get("status");

    if (!productId) {
      throw new Error("Product ID is required");
    }

    // Verify the product belongs to this creator
    const existingProduct = await db.digitalProduct.findUnique({
      where: {
        id: productId,
        creatorId: creator.id,
      },
    });

    if (!existingProduct) {
      throw new Error("Product not found or unauthorized");
    }

    // Build update data
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (price) {
      const priceFloat = parseFloat(price);
      if (isNaN(priceFloat) || priceFloat <= 0) {
        throw new Error("Price must be a positive number");
      }
      updateData.price = priceFloat;
    }
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (fileUrl) updateData.fileUrl = fileUrl.trim();
    if (fileType !== undefined) updateData.fileType = fileType?.trim() || null;
    if (status) updateData.status = status;

    // Update product
    const updatedProduct = await db.digitalProduct.update({
      where: {
        id: productId,
      },
      data: updateData,
    });

    revalidatePath("/creator");
    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error("Failed to update product:", error);
    throw new Error("Failed to update product: " + error.message);
  }
}

/**
 * Delete a digital product
 */
export async function deleteDigitalProduct(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const creator = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
      select: {
        id: true,
      },
    });

    if (!creator) {
      throw new Error("Creator not found");
    }

    const productId = formData.get("productId");

    if (!productId) {
      throw new Error("Product ID is required");
    }

    // Verify the product belongs to this creator
    const product = await db.digitalProduct.findUnique({
      where: {
        id: productId,
        creatorId: creator.id,
      },
    });

    if (!product) {
      throw new Error("Product not found or unauthorized");
    }

    // Delete product (cascade will handle sales)
    await db.digitalProduct.delete({
      where: {
        id: productId,
      },
    });

    revalidatePath("/creator");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw new Error("Failed to delete product: " + error.message);
  }
}

/**
 * Get all products for the current creator
 */
export async function getCreatorProducts() {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const creator = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
      select: {
        id: true,
      },
    });

    if (!creator) {
      throw new Error("Creator not found");
    }

    const products = await db.digitalProduct.findMany({
      where: {
        creatorId: creator.id,
      },
      include: {
        sales: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add sales stats to each product
    const productsWithStats = products.map((product) => {
      const completedSales = product.sales.filter((s) => s.status === "COMPLETED");
      const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.amount, 0);
      const totalEarnings = completedSales.reduce((sum, sale) => sum + sale.creatorEarnings, 0);

      return {
        ...product,
        salesCount: completedSales.length,
        totalRevenue,
        totalEarnings,
      };
    });

    return { products: productsWithStats };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw new Error("Failed to fetch products: " + error.message);
  }
}

/**
 * Get all active products (for marketplace)
 */
export async function getActiveProducts() {
  try {
    // Use a more efficient query - count completed sales in database
    const products = await db.digitalProduct.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            specialty: true,
          },
        },
        _count: {
          select: {
            sales: {
              where: {
                status: "COMPLETED",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map products with purchase count from _count
    const productsWithStats = products.map((product) => {
      const { _count, ...productWithoutCount } = product;
      return {
        ...productWithoutCount,
        purchaseCount: _count?.sales || 0,
      };
    });

    return { products: productsWithStats };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    // Return empty array on error instead of throwing to prevent page crash
    if (error.code === "P2024" || error.message?.includes("connection pool")) {
      console.error("Database connection pool exhausted, returning empty result");
      return { products: [] };
    }
    throw new Error("Failed to fetch products: " + error.message);
  }
}

/**
 * Purchase a digital product
 */
export async function purchaseDigitalProduct(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const buyer = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CLIENT",
      },
    });

    if (!buyer) {
      throw new Error("Buyer not found. Only clients can purchase products.");
    }

    const productId = formData.get("productId");
    const paymentMethodId = formData.get("paymentMethodId"); // For future payment integration

    if (!productId) {
      throw new Error("Product ID is required");
    }

    // Get the product
    const product = await db.digitalProduct.findUnique({
      where: {
        id: productId,
        status: "ACTIVE",
      },
      include: {
        creator: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found or not available");
    }

    // Check if buyer already purchased this product
    const existingPurchase = await db.digitalProductSale.findFirst({
      where: {
        productId: product.id,
        buyerId: buyer.id,
        status: "COMPLETED",
      },
    });

    if (existingPurchase) {
      throw new Error("You have already purchased this product");
    }

    // Prevent creators from buying their own products
    if (product.creatorId === buyer.id) {
      throw new Error("You cannot purchase your own product");
    }

    // Calculate fees and earnings
    const platformFee = product.price * PLATFORM_FEE_PERCENTAGE;
    const creatorEarnings = product.price - platformFee;

    // Create download URL that expires in 7 days
    const downloadExpiresAt = new Date();
    downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 7);

    // Create the sale record
    const sale = await db.digitalProductSale.create({
      data: {
        productId: product.id,
        buyerId: buyer.id,
        sellerId: product.creator.id,
        amount: product.price,
        platformFee,
        creatorEarnings,
        status: "COMPLETED", // For now, auto-complete. In production, wait for payment confirmation
        downloadUrl: product.fileUrl,
        downloadExpiresAt,
      },
    });

    // Increment download count
    await db.digitalProduct.update({
      where: {
        id: product.id,
      },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    revalidatePath("/creator");
    revalidatePath("/store");
    return { success: true, sale };
  } catch (error) {
    console.error("Failed to purchase product:", error);
    throw new Error("Failed to purchase product: " + error.message);
  }
}

/**
 * Get creator's product sales statistics
 */
export async function getCreatorProductEarnings() {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const creator = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
      select: {
        id: true,
      },
    });

    if (!creator) {
      throw new Error("Creator not found");
    }

    // Get all completed sales for this creator
    const allSales = await db.digitalProductSale.findMany({
      where: {
        sellerId: creator.id,
        status: "COMPLETED",
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const thisMonthSales = allSales.filter(
      (sale) => new Date(sale.createdAt) >= currentMonth
    );

    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalEarnings = allSales.reduce((sum, sale) => sum + sale.creatorEarnings, 0);
    const totalPlatformFees = allSales.reduce((sum, sale) => sum + sale.platformFee, 0);

    const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.amount, 0);
    const thisMonthEarnings = thisMonthSales.reduce((sum, sale) => sum + sale.creatorEarnings, 0);

    // Calculate average per month
    const monthsSinceFirstSale = allSales.length > 0
      ? Math.max(1, Math.floor((new Date().getTime() - new Date(allSales[allSales.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 1;
    const averageEarningsPerMonth = totalEarnings / monthsSinceFirstSale;

    // Available for payout (all earnings from completed sales)
    const availableForPayout = totalEarnings;

    return {
      earnings: {
        totalRevenue,
        totalEarnings,
        totalPlatformFees,
        thisMonthRevenue,
        thisMonthEarnings,
        averageEarningsPerMonth,
        totalSales: allSales.length,
        thisMonthSales: thisMonthSales.length,
        availableForPayout,
      },
      recentSales: allSales.slice(0, 10),
    };
  } catch (error) {
    console.error("Failed to fetch product earnings:", error);
    throw new Error("Failed to fetch product earnings: " + error.message);
  }
}

/**
 * Update creator's bank account information
 */
export async function updateBankAccount(formData) {
  const authResult = await getAuthUserId();

  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }

  try {
    const creator = await db.user.findUnique({
      where: {
        id: authResult.userId,
        role: "CREATOR",
      },
    });

    if (!creator) {
      throw new Error("Creator not found");
    }

    const bankAccountName = formData.get("bankAccountName");
    const bankAccountNumber = formData.get("bankAccountNumber");
    const bankName = formData.get("bankName");
    const bankRoutingNumber = formData.get("bankRoutingNumber");
    const bankCountry = formData.get("bankCountry");

    // Validate required fields
    if (!bankAccountName || !bankAccountNumber || !bankName || !bankRoutingNumber || !bankCountry) {
      throw new Error("All bank account fields are required");
    }

    // Update bank account info
    const updatedCreator = await db.user.update({
      where: {
        id: creator.id,
      },
      data: {
        bankAccountName: bankAccountName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankName: bankName.trim(),
        bankRoutingNumber: bankRoutingNumber.trim(),
        bankCountry: bankCountry.trim(),
      },
    });

    revalidatePath("/creator");
    return { success: true, creator: updatedCreator };
  } catch (error) {
    console.error("Failed to update bank account:", error);
    throw new Error("Failed to update bank account: " + error.message);
  }
}

