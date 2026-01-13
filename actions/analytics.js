"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";

/**
 * Get comprehensive analytics for creator dashboard
 */
export async function getCreatorAnalytics() {
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

    // Get all appointments (all statuses)
    const allAppointments = await db.appointment.findMany({
      where: {
        creatorId: creator.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    // Get all product sales
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
            category: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all products
    const allProducts = await db.digitalProduct.findMany({
      where: {
        creatorId: creator.id,
      },
      include: {
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
    });

    // Calculate appointment statistics
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const appointmentsThisMonth = allAppointments.filter(
      (apt) => new Date(apt.startTime) >= currentMonth
    );
    const appointmentsLastMonth = allAppointments.filter(
      (apt) => {
        const aptDate = new Date(apt.startTime);
        return aptDate >= lastMonth && aptDate <= lastMonthEnd;
      }
    );

    const completedAppointments = allAppointments.filter(
      (apt) => apt.status === "COMPLETED"
    );
    const scheduledAppointments = allAppointments.filter(
      (apt) => apt.status === "SCHEDULED"
    );
    const cancelledAppointments = allAppointments.filter(
      (apt) => apt.status === "CANCELLED"
    );

    // Calculate product sales statistics
    const salesThisMonth = allSales.filter(
      (sale) => new Date(sale.createdAt) >= currentMonth
    );
    const salesLastMonth = allSales.filter(
      (sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= lastMonth && saleDate <= lastMonthEnd;
      }
    );

    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalEarnings = allSales.reduce((sum, sale) => sum + sale.creatorEarnings, 0);
    const totalPlatformFees = allSales.reduce((sum, sale) => sum + sale.platformFee, 0);

    const thisMonthRevenue = salesThisMonth.reduce((sum, sale) => sum + sale.amount, 0);
    const thisMonthEarnings = salesThisMonth.reduce((sum, sale) => sum + sale.creatorEarnings, 0);
    const lastMonthRevenue = salesLastMonth.reduce((sum, sale) => sum + sale.amount, 0);
    const lastMonthEarnings = salesLastMonth.reduce((sum, sale) => sum + sale.creatorEarnings, 0);

    // Calculate trends
    const revenueTrend = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;
    const earningsTrend = lastMonthEarnings > 0 
      ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
      : 0;
    const appointmentsTrend = appointmentsLastMonth.length > 0
      ? ((appointmentsThisMonth.length - appointmentsLastMonth.length) / appointmentsLastMonth.length) * 100
      : 0;

    // Generate monthly chart data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthSales = allSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= monthDate && saleDate <= monthEnd;
      });
      
      const monthAppointments = allAppointments.filter((apt) => {
        const aptDate = new Date(apt.startTime);
        return aptDate >= monthDate && aptDate <= monthEnd;
      });

      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        earnings: monthSales.reduce((sum, sale) => sum + sale.creatorEarnings, 0),
        revenue: monthSales.reduce((sum, sale) => sum + sale.amount, 0),
        sales: monthSales.length,
        bookings: monthAppointments.filter(apt => apt.status === "COMPLETED" || apt.status === "SCHEDULED").length,
      });
    }

    // Top performing products
    const topProducts = allProducts
      .map((product) => {
        const productSales = allSales.filter((sale) => sale.productId === product.id);
        const revenue = productSales.reduce((sum, sale) => sum + sale.amount, 0);
        const earnings = productSales.reduce((sum, sale) => sum + sale.creatorEarnings, 0);
        
        return {
          id: product.id,
          title: product.title,
          category: product.category,
          salesCount: productSales.length,
          revenue,
          earnings,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Product categories breakdown
    const categoryStats = {};
    allSales.forEach((sale) => {
      const category = sale.product?.category || "Uncategorized";
      if (!categoryStats[category]) {
        categoryStats[category] = {
          category,
          sales: 0,
          revenue: 0,
          earnings: 0,
        };
      }
      categoryStats[category].sales += 1;
      categoryStats[category].revenue += sale.amount;
      categoryStats[category].earnings += sale.creatorEarnings;
    });

    const categoryBreakdown = Object.values(categoryStats).sort(
      (a, b) => b.revenue - a.revenue
    );

    return {
      // Product Sales Stats
      productSales: {
        totalRevenue,
        totalEarnings,
        totalPlatformFees,
        totalSales: allSales.length,
        thisMonthRevenue,
        thisMonthEarnings,
        thisMonthSales: salesThisMonth.length,
        lastMonthRevenue,
        lastMonthEarnings,
        revenueTrend,
        earningsTrend,
        availableForPayout: totalEarnings,
      },
      // Appointment Stats
      appointments: {
        total: allAppointments.length,
        completed: completedAppointments.length,
        scheduled: scheduledAppointments.length,
        cancelled: cancelledAppointments.length,
        thisMonth: appointmentsThisMonth.length,
        lastMonth: appointmentsLastMonth.length,
        trend: appointmentsTrend,
      },
      // Chart Data
      monthlyData,
      // Top Products
      topProducts,
      // Category Breakdown
      categoryBreakdown,
      // Recent Activity
      recentSales: allSales.slice(0, 10),
      recentAppointments: allAppointments.slice(0, 10),
    };
  } catch (error) {
    console.error("Failed to fetch creator analytics:", error);
    throw new Error("Failed to fetch analytics: " + error.message);
  }
}
