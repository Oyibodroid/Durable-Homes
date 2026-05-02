"use client";

import { useCartItems, useCartSubtotal, useCart } from "@/hooks/useCart";
import { CartSummary } from "@/components/cart/CartSummary";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Package,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function CartPage() {
  const items = useCartItems();
  const subtotal = useCartSubtotal();
  const { removeItem, updateQuantity, clearCart } = useCart();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Prevent hydration mismatch
  if (!mounted) return <div className="min-h-screen bg-[#faf9f6]" />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;500;600;700&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
      `}</style>

      <div
        className="min-h-screen bg-[#faf9f6]"
        style={{ fontFamily: "'Nunito',sans-serif", paddingTop: "80px" }}
      >
        <div className="bg-[#111008] hex-bg py-12">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-7 h-px bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">
                Your Cart
              </span>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl text-white font-medium">
              {items.length > 0
                ? `${items.length} Item${items.length > 1 ? "s" : ""}`
                : "Your Cart"}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 py-10">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-white border border-gray-200 flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-gray-300" />
              </div>
              <h2 className="font-display text-3xl text-gray-800 mb-3">
                Your cart is empty
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                Add products from our shop to get started.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 bg-[#111008] hover:bg-[#C9A84C] text-white hover:text-[#111008] font-bold px-8 py-4 transition-all"
              >
                Browse Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  // FIX: Safely access product properties.
                  // Adjust item.product or item based on your Zustand store structure
                  const product = item.product || item;
                  const price = Number(product.price) || 0;
                  const itemQuantity = item.quantity || 1;

                  const firstImage = product.images?.[0];

                  const img =
                    typeof firstImage === "string"
                      ? firstImage
                      : (firstImage?.url ?? null);
                  return (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-100 p-4 flex gap-4 hover:border-[#C9A84C]/30 transition-colors group"
                    >
                      <Link
                        href={`/shop/${product.slug}`}
                        className="w-24 h-24 bg-[#faf9f6] flex-shrink-0 overflow-hidden relative border border-gray-50"
                      >
                        {img ? (
                          <Image
                            src={img}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-7 w-7 text-gray-300" />
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] text-[#C9A84C] uppercase tracking-widest font-bold mb-1">
                              {product.category?.name || "Building Material"}
                            </p>
                            <Link
                              href={`/shop/${product.slug}`}
                              className="font-semibold text-sm text-gray-900 hover:text-[#C9A84C] transition-colors line-clamp-2"
                            >
                              {product.name}
                            </Link>
                          </div>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-gray-200 rounded-sm">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  product.id,
                                  Math.max(1, itemQuantity - 1),
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-10 text-center text-xs font-bold">
                              {itemQuantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(product.id, itemQuantity + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="font-bold text-gray-900 text-sm">
                            {/* FIX: Multiply by itemQuantity, not product.quantity */}
                            ₦{(price * itemQuantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <Link
                    href="/shop"
                    className="text-xs font-bold text-gray-500 hover:text-[#111008] uppercase tracking-widest"
                  >
                    ← Continue Shopping
                  </Link>
                  <button
                    onClick={() => clearCart()}
                    className="text-xs font-bold text-gray-400 hover:text-red-600 uppercase tracking-widest"
                  >
                    Clear cart
                  </button>
                </div>
              </div>

              <div className="lg:sticky lg:top-24">
                <CartSummary />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
