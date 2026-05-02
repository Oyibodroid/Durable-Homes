import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Star,
  MapPin,
  ArrowRight,
  Package,
  Clock,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default async function AccountDashboard() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const [orders, wishlistCount, reviewCount, addressCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          take: 1,
          include: {
            product: {
              include: { images: { where: { isMain: true }, take: 1 } },
            },
          },
        },
      },
    }),
    prisma.wishlistItem.count({ where: { userId: session.user.id } }),
    prisma.review.count({ where: { userId: session.user.id } }),
    prisma.address.count({ where: { userId: session.user.id } }),
  ]);

  const stats = [
    {
      label: "Orders",
      value: orders.length,
      icon: ShoppingBag,
      href: "/account/orders",
    },
    {
      label: "Wishlist",
      value: wishlistCount,
      icon: Heart,
      href: "/account/wishlist",
    },
    {
      label: "Reviews",
      value: reviewCount,
      icon: Star,
      href: "/account/reviews",
    },
    {
      label: "Addresses",
      value: addressCount,
      icon: MapPin,
      href: "/account/addresses",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-gray-100 p-5 transition-all group hover:border-[#C9A84C]/40 hover:-translate-y-0.5"
            /* ✅ The hover:-translate-y-0.5 replaces the manual onMouseEnter logic */
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#C9A84C]/8 flex items-center justify-center group-hover:bg-[#C9A84C]/15 transition-colors">
                <Icon className="h-4 w-4 text-[#C9A84C]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-xs text-[#C9A84C] font-semibold hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No orders yet</p>
            <Link
              href="/shop"
              className="mt-3 inline-block text-xs text-[#C9A84C] font-semibold hover:underline"
            >
              Start shopping →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => {
              const firstItem = order.items[0];
              const img = firstItem?.product?.images?.[0]?.url;
              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-[#faf9f6] flex-shrink-0 overflow-hidden relative border border-gray-100">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 group-hover:text-[#C9A84C] transition-colors">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-gray-900">
                      ₦{Number(order.total).toLocaleString()}
                    </p>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 mt-1 border font-medium ${STATUS_COLORS[order.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
