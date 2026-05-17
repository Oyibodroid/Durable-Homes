"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCartItems, useCartSubtotal, useCart } from "@/hooks/useCart";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Lock,
  Package,
  Truck,
  CreditCard,
  ArrowLeft,
  MapPin,
  Check,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght=500;600&family=Nunito:wght=300;400;500;600;700&display=swap');
  .font-display{font-family:'Cormorant Garamond',serif;}
  .hex-bg{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E");}
  .field{width:100%;border:1.5px solid #e5e4e0;padding:11px 14px;font-size:14px;font-family:'Nunito',sans-serif;outline:none;transition:border-color 0.2s;background:white;color:#111;}
  .field:focus{border-color:#C9A84C;}
  .field::placeholder{color:#9ca3af;}
`;

type Step = "billing" | "payment";
type PaymentGateway = "paystack" | "flutterwave";

interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
  type?: string;
}

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", 
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", 
  "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT Abuja"
];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const items = useCartItems();
  const subtotal = useCartSubtotal();
  const clearCart = useCart((s) => s.clearCart);
  
  const [step, setStep] = useState<Step>("billing");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway>("paystack");
  
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const [settings, setSettings] = useState({
    shippingFreeThreshold: 100000,
    shippingBaseRate: 5000,
    taxRate: 7.5,
    taxEnabled: true,
  });

  const [billing, setBilling] = useState<BillingData>({
    firstName: "",
    lastName: "",
    email: session?.user?.email ?? "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
  });

  // Fetch baseline configuration metrics
  useEffect(() => {
    setMounted(true);
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  // Sync auth profile updates & fetch address register entries
  useEffect(() => {
    if (session?.user?.email) {
      setBilling((b) => ({ ...b, email: session.user!.email! }));
      
      // Fetch dynamic saved entries for verified sessions
      fetch("/api/account/addresses")
        .then((res) => res.json())
        .then((data: SavedAddress[]) => {
          if (Array.isArray(data)) {
            setSavedAddresses(data);
            // Autofill with default configuration selection if populated
            const defaultAddr = data.find((a) => a.isDefault);
            if (defaultAddr) {
              selectSavedAddress(defaultAddr);
            }
          }
        })
        .catch((err) => console.error("Failed fetching user context addresses:", err));
    }
  }, [session]);

  useEffect(() => {
    if (mounted && items.length === 0) router.push("/cart");
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

  const selectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setBilling({
      firstName: addr.firstName,
      lastName: addr.lastName,
      email: session?.user?.email || billing.email,
      phone: addr.phone || "",
      address: addr.addressLine2 ? `${addr.addressLine1}, ${addr.addressLine2}` : addr.addressLine1,
      city: addr.city,
      state: NIGERIAN_STATES.includes(addr.state) ? addr.state : "",
      country: addr.country || "Nigeria",
    });
  };

  const shipping = subtotal >= settings.shippingFreeThreshold ? 0 : settings.shippingBaseRate;
  const tax = settings.taxEnabled ? subtotal * (settings.taxRate / 100) : 0;
  const total = subtotal + shipping + tax;

  const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCheckoutPayment = async () => {
    setLoading(true);
    try {
      // 1. Create Order inside DB
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            price: Number(i.product.price),
          })),
          subtotal,
          shipping,
          tax,
          total,
          shippingAddress: {
            firstName: billing.firstName,
            lastName: billing.lastName,
            email: billing.email,
            phone: billing.phone,
            address: billing.address,
            city: billing.city,
            state: billing.state,
            country: billing.country,
          },
          paymentMethod,
          guestEmail: session ? undefined : billing.email,
        }),
      });

      const data = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(data.error || "Order generation failed");
      }

      const { id: orderId } = data;

      // 2. Route payload to respective processing gateway initializer API
      const initEndpoint = paymentMethod === "paystack" 
        ? "/api/payments/initialize" 
        : "/api/payments/flutterwave-initialize";

      const payRes = await fetch(initEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          email: billing.email,
          amount: total,
          phone: billing.phone,
          name: `${billing.firstName} ${billing.lastName}`
        }),
      });

      const paymentData = await payRes.json();
      const redirectUrl = paymentData.authorization_url || paymentData.data?.link || paymentData.redirectUrl;

      if (!redirectUrl) {
        throw new Error("Could not extract a valid checkout route link from payment endpoint.");
      }

      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error("Execution Checkout Exception:", err);
      toast.error(err.message || "An unexpected system error occurred during checkout processing.");
      setLoading(false);
    }
  };

  const STEPS = [
    { key: "billing", label: "Billing", icon: Package },
    { key: "payment", label: "Payment", icon: CreditCard },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="min-h-screen bg-[#faf9f6]" style={{ fontFamily: "'Nunito',sans-serif", paddingTop: "80px" }}>
        {/* Header */}
        <div className="bg-[#111008] hex-bg py-10">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <Link href="/cart" className="hover:text-[#C9A84C] transition-colors">Cart</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#C9A84C]">Checkout</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-px bg-[#C9A84C]" />
                  <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">Secure Checkout</span>
                </div>
                <h1 className="font-display text-4xl text-white font-medium">Complete Your Order</h1>
              </div>
              <Lock className="h-5 w-5 text-gray-600 hidden sm:block" />
            </div>

            {/* Steps Progress */}
            <div className="flex items-center gap-3 mt-6">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 text-xs font-semibold ${step === s.key ? "text-[#C9A84C]" : "text-gray-500"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === s.key ? "bg-[#C9A84C] text-[#111008]" : "bg-white/10 text-gray-400"}`}>
                      {i + 1}
                    </div>
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-8 h-px bg-white/10" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Content Area */}
            <div className="lg:col-span-2">
              {/* Billing View Block */}
              {step === "billing" && (
                <div className="space-y-6">
                  {/* Saved Address Injection Segment */}
                  {session && savedAddresses.length > 0 && (
                    <div className="bg-white border border-gray-100 p-6">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#C9A84C]" /> Ship to a Saved Destination
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => selectSavedAddress(addr)}
                            className={`p-4 border cursor-pointer relative transition-all flex flex-col justify-between ${
                              selectedAddressId === addr.id
                                ? "border-[#C9A84C] bg-[#C9A84C]/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {addr.firstName} {addr.lastName}
                                </p>
                                {selectedAddressId === addr.id && (
                                  <Check className="h-4 w-4 text-[#C9A84C]" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{addr.addressLine1}</p>
                              <p className="text-xs text-gray-400">{addr.city}, {addr.state}</p>
                            </div>
                            {addr.isDefault && (
                              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded self-start mt-2">
                                Default
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-gray-100 p-7">
                    <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#C9A84C]" /> Delivery Contact & Location
                    </h2>
                    <form onSubmit={handleBillingSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name *</label>
                          <input className="field" placeholder="John" required value={billing.firstName} onChange={(e) => setBilling(b => ({ ...b, firstName: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name *</label>
                          <input className="field" placeholder="Doe" required value={billing.lastName} onChange={(e) => setBilling(b => ({ ...b, lastName: e.target.value }))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email *</label>
                          <input className="field" type="email" placeholder="you@example.com" required value={billing.email} onChange={(e) => setBilling(b => ({ ...b, email: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone *</label>
                          <input className="field" type="tel" placeholder="+234 000 000 0000" required value={billing.phone} onChange={(e) => setBilling(b => ({ ...b, phone: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Address *</label>
                        <input className="field" placeholder="Street address" required value={billing.address} onChange={(e) => setBilling(b => ({ ...b, address: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City *</label>
                          <input className="field" placeholder="Lagos" required value={billing.city} onChange={(e) => setBilling(b => ({ ...b, city: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State *</label>
                          <select className="field" required value={billing.state} onChange={(e) => setBilling(b => ({ ...b, state: e.target.value }))}>
                            <option value="">Select state</option>
                            {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-[#111008] hover:bg-[#C9A84C] text-white hover:text-[#111008] font-bold py-4 transition-all duration-300 flex items-center justify-center gap-3 mt-2">
                        Continue to Payment <ChevronRight className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Payment Processing Gateway Options Block */}
              {step === "payment" && (
                <div className="space-y-4">
                  <button onClick={() => setStep("billing")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#C9A84C] transition-colors mb-2">
                    <ArrowLeft className="h-4 w-4" /> Edit delivery details
                  </button>

                  <div className="bg-white border border-gray-100 p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Delivering to</p>
                    <p className="text-sm font-semibold text-gray-900">{billing.firstName} {billing.lastName}</p>
                    <p className="text-sm text-gray-500">{billing.address}, {billing.city}, {billing.state}</p>
                    <p className="text-sm text-gray-500">{billing.phone}</p>
                  </div>

                  <div className="bg-white border border-gray-100 p-7">
                    <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#C9A84C]" /> Select Payment Method
                    </h2>

                    {/* Paystack Card Selector */}
                    <div 
                      onClick={() => setPaymentMethod("paystack")}
                      className={`border-2 p-5 mb-4 cursor-pointer transition-all ${paymentMethod === "paystack" ? "border-[#C9A84C] bg-[#C9A84C]/5" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Image src="/images/Paystack_Logo.png" alt="Paystack" width={100} height={100} className="object-contain" />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${paymentMethod === "paystack" ? "border-[#C9A84C]" : "border-gray-400"}`}>
                          {paymentMethod === "paystack" && <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Pay with Paystack</p>
                          <p className="text-xs text-gray-500">Card, Bank Transfer, USSD, Quickteller</p>
                        </div>
                      </div>
                    </div>

                    {/* Flutterwave Card Selector */}
                    <div 
                      onClick={() => setPaymentMethod("flutterwave")}
                      className={`border-2 p-5 mb-6 cursor-pointer transition-all ${paymentMethod === "flutterwave" ? "border-[#C9A84C] bg-[#C9A84C]/5" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Image src="/images/Flutterwave_Logo.png" alt="Flutterwave" width={100} height={100} className="object-contain" />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${paymentMethod === "flutterwave" ? "border-[#C9A84C]" : "border-gray-400"}`}>
                          {paymentMethod === "flutterwave" && <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Pay with Flutterwave</p>
                          <p className="text-xs text-gray-500">Local & International Cards, Barter, Mobile Money</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                      <Lock className="h-3.5 w-3.5" /> Your transaction info is encrypted securely via payment token parameters.
                    </div>

                    <button
                      onClick={handleCheckoutPayment}
                      disabled={loading}
                      className="w-full bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-bold py-4 transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#111008]/30 border-t-[#111008] rounded-full animate-spin" />
                          Processing Order Route...
                        </>
                      ) : (
                        <>
                          Pay ₦{total.toLocaleString(undefined, { minimumFractionDigits: 0 })} <Lock className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Summary Block */}
            <div>
              <div className="bg-white border border-gray-100 sticky top-24">
                <div className="bg-[#111008] px-5 py-4">
                  <p className="text-white font-semibold text-sm flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#C9A84C]" /> Order Summary
                  </p>
                </div>
                <div className="p-5">
                  <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                    {items.map((item) => {
                      const firstImage = item.product.images?.[0];
                      const img = typeof firstImage === "object" && firstImage !== null && "url" in firstImage
                        ? (firstImage as { url: string }).url
                        : typeof firstImage === "string" ? firstImage : null;

                      return (
                        <div key={item.product.id} className="flex gap-3 items-center">
                          <div className="w-12 h-12 bg-[#faf9f6] border border-gray-100 flex-shrink-0 overflow-hidden relative flex items-center justify-center">
                            {img ? (
                              <Image src={img} alt={item.product.name} fill className="object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-xs font-bold text-gray-900 flex-shrink-0">
                            ₦{(Number(item.product.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `₦${shipping.toLocaleString()}`}
                      </span>
                    </div>
                    {settings.taxEnabled && (
                      <div className="flex justify-between text-gray-600">
                        <span>VAT ({settings.taxRate}%)</span>
                        <span>₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t border-gray-100">
                      <span>Total</span>
                      <span className="text-[#C9A84C]">₦{total.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                    </div>
                  </div>

                  {shipping > 0 && (
                    <p className="text-xs text-gray-400 mt-3">
                      Add ₦{(settings.shippingFreeThreshold - subtotal).toLocaleString()} more for free shipping
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-gray-400">
                    <Truck className="h-4 w-4" /> <span className="text-xs">Nationwide delivery</span>
                    <Lock className="h-4 w-4" /> <span className="text-xs">Secure payment</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}