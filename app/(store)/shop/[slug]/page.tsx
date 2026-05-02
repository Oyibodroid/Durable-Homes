import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { Badge } from "@/components/ui/Badge";
import { Metadata } from "next";
import {
  Package,
  Ruler,
  Weight,
  Truck,
  Shield,
  Clock,
  Star,
  Heart,
  Share2,
  ChevronRight,
  CheckCircle,
  HardHat,
  FileText,
  Award,
  Droplets,
  Flame,
  Wind,
  Hammer,
  AlertTriangle,
  Scale,
  Gauge,
  Thermometer,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { ReviewForm } from "@/components/product/Reviewform";

interface ProductPageProps {
  params: { slug: string }>;
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        include: {
          parent: true,
        },
      },
      images: {
        orderBy: { position: "asc" },
      },
      variants: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          reviews: true,
          wishlistedBy: true,
        },
      },
    },
  });
  return product;
}

async function getRelatedProducts(
  categoryId: string,
  currentProductId: string,
) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: currentProductId },
      status: "PUBLISHED",
      publishedAt: { not: null },
    },
    include: {
      images: {
        where: { isMain: true },
        take: 1,
      },
      category: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4,
  });
  return products;
}

async function getProductSpecs(productId: string) {
  // In a real app, you'd have a ProductSpecs model
  // For now, generate specs based on product data
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      name: true,
      price: true,
      quantity: true,
      category: {
        select: { name: true },
      },
    },
  });

  if (!product) return [];

  // Generate specs based on category
  const category = product.category?.name || "General";
  const specs = [];

  // Basic specs for all products
  specs.push(
    { label: "Material", value: getMaterialFromCategory(category) },
    { label: "Weight", value: getWeightFromName(product.name) },
    { label: "Dimensions", value: getDimensionsFromName(product.name) },
    { label: "Stock Quantity", value: `${product.quantity} units` },
  );

  // Category-specific specs
  if (category.includes("Cement") || category.includes("Structural")) {
    specs.push(
      { label: "Compressive Strength", value: "42.5R (28 days)" },
      { label: "Setting Time", value: "Initial: 45min, Final: 10hrs" },
      { label: "Grade", value: "42.5R" },
    );
  }

  if (category.includes("Steel") || category.includes("Reinforcement")) {
    specs.push(
      { label: "Tensile Strength", value: "460-620 MPa" },
      { label: "Yield Strength", value: "460 MPa min" },
      { label: "Grade", value: "B500B" },
    );
  }

  if (category.includes("Paint") || category.includes("Coating")) {
    specs.push(
      { label: "Coverage", value: "10-12 m²/L" },
      { label: "Drying Time", value: "2-4 hours" },
      { label: "Finish", value: "Matt/Satin/Gloss" },
    );
  }

  if (category.includes("Tile") || category.includes("Flooring")) {
    specs.push(
      { label: "Wear Rating", value: "PEI 4 (Commercial)" },
      { label: "Water Absorption", value: "<0.5%" },
      { label: "Slip Resistance", value: "R10" },
    );
  }

  return specs;
}

function getMaterialFromCategory(category: string): string {
  const materials: Record<string, string> = {
    Cement: "Portland Limestone",
    Steel: "High-Grade Carbon Steel",
    Paint: "Acrylic/Epoxy",
    Tile: "Porcelain/Ceramic",
    Wood: "Hardwood/Timber",
    Plumbing: "PVC/Copper/Stainless Steel",
    Electrical: "Copper/Aluminum",
    Roofing: "Aluminum/Stone-Coated Steel",
    General: "Industrial Grade",
  };

  for (const [key, value] of Object.entries(materials)) {
    if (category.includes(key)) return value;
  }
  return materials.General;
}

function getWeightFromName(name: string): string {
  const weights: Record<string, string> = {
    cement: "50kg",
    paint: "20kg (20L)",
    tile: "32kg/m²",
    steel: "7850 kg/m³",
    rod: "2.5kg/m (12mm)",
    pipe: '3.5kg/m (4")',
    door: "35kg",
    window: "25kg",
  };

  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(weights)) {
    if (lowerName.includes(key)) return value;
  }
  return "Varies by specification";
}

function getDimensionsFromName(name: string): string {
  const dimensions: Record<string, string> = {
    tile: "300x300mm / 400x400mm",
    rod: "12m length",
    pipe: "3m / 6m length",
    sheet: "2.4m x 1.2m",
    door: "2100mm x 900mm",
    window: "1200mm x 1200mm",
    cement: "50kg bag",
    paint: "20L / 4L / 1L",
  };

  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(dimensions)) {
    if (lowerName.includes(key)) return value;
  }
  return "Standard industrial dimensions";
}

async function getIndustrialFeatures(category: string) {
  const features = [];

  // Base features for all products
  features.push(
    { icon: Shield, text: "Heavy-Duty Construction", available: true },
    { icon: Award, text: "Certified Quality (ISO/SON)", available: true },
  );

  // Category-specific features
  if (category.includes("Cement") || category.includes("Structural")) {
    features.push(
      { icon: Flame, text: "Fire Resistant", available: true },
      { icon: Droplets, text: "Water Resistant", available: true },
      { icon: Gauge, text: "High Compressive Strength", available: true },
    );
  }

  if (category.includes("Steel")) {
    features.push(
      { icon: Hammer, text: "Impact Resistant", available: true },
      { icon: Thermometer, text: "Heat Treated", available: true },
      { icon: Scale, text: "High Tensile Strength", available: true },
    );
  }

  if (category.includes("Paint")) {
    features.push(
      { icon: Droplets, text: "Waterproof", available: true },
      { icon: Wind, text: "Weather Resistant", available: true },
      { icon: Zap, text: "Anti-Static", available: Math.random() > 0.5 },
    );
  }

  if (category.includes("Tile")) {
    features.push(
      { icon: Droplets, text: "Waterproof", available: true },
      { icon: Hammer, text: "Scratch Resistant", available: true },
      { icon: Flame, text: "Fire Resistant", available: true },
    );
  }

  if (category.includes("Roofing")) {
    features.push(
      { icon: Wind, text: "Wind Resistant", available: true },
      { icon: Droplets, text: "Leak Proof", available: true },
      { icon: Flame, text: "Fire Retardant", available: true },
    );
  }

  return features;
}

function getDeliveryOptions() {
  return [
    {
      icon: Truck,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      title: "Standard Delivery",
      description: "3-5 business days",
      price: "₦5,000",
      condition: "Free on orders over ₦100,000",
    },
    {
      icon: Zap,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Express Delivery",
      description: "1-2 business days",
      price: "₦15,000",
      condition: "Available in Lagos & Abuja",
    },
    {
      icon: Package,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Site Delivery",
      description: "With crane/lifter",
      price: "₦25,000",
      condition: "For bulk orders > 500kg",
    },
  ];
}

function getBulkPricing(price: number) {
  return [
    {
      quantity: "10-50 units",
      discount: "5%",
      price: `₦${Math.round(price * 0.95).toLocaleString()}/unit`,
    },
    {
      quantity: "51-100 units",
      discount: "10%",
      price: `₦${Math.round(price * 0.9).toLocaleString()}/unit`,
    },
    {
      quantity: "100+ units",
      discount: "15%",
      price: `₦${Math.round(price * 0.85).toLocaleString()}/unit`,
    },
  ];
}

// Technical Specifications Component
async function TechnicalSpecs({
  productId,
  category,
}: {
  productId: string;
  category: string;
}) {
  const specs = await getProductSpecs(productId);

  return (
    <div className="bg-white border border-gray-200 p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-gray-600" />
        Technical Specifications
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specs.map((spec, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-100"
          >
            <span className="text-sm text-gray-600">{spec.label}:</span>
            <span className="text-sm font-medium text-gray-900">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Industrial Features Component
async function IndustrialFeatures({ category }: { category: string }) {
  const features = await getIndustrialFeatures(category);

  return (
    <div className="bg-gray-50 border border-gray-200 p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <HardHat className="h-5 w-5 text-gray-600" />
        Industrial Features
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Icon
                className={`h-4 w-4 ${feature.available ? "text-green-600" : "text-gray-400"}`}
              />
              <span
                className={
                  feature.available
                    ? "text-gray-700"
                    : "text-gray-400 line-through"
                }
              >
                {feature.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Delivery Options Component
function DeliveryOptions() {
  const options = getDeliveryOptions();

  return (
    <div className="bg-white border border-gray-200 p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Truck className="h-5 w-5 text-gray-600" />
        Delivery Options
      </h3>
      <div className="space-y-3">
        {options.map((option, index) => {
          const Icon = option.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className={`${option.bgColor} p-1 rounded mt-0.5`}>
                <Icon className={`h-4 w-4 ${option.iconColor}`} />
              </div>
              <div>
                <p className="font-medium text-sm">{option.title}</p>
                <p className="text-xs text-gray-500">{option.description}</p>
                <p className="text-xs text-gray-700 mt-1">{option.price}</p>
                <p className="text-xs text-gray-500">{option.condition}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Bulk Pricing Component
function BulkPricing({ price }: { price: number }) {
  const bulkPrices = getBulkPricing(price);

  return (
    <div className="bg-gray-900 text-white p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Package className="h-5 w-5 text-yellow-400" />
        Bulk Pricing
      </h3>
      <div className="space-y-3">
        {bulkPrices.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0"
          >
            <div>
              <p className="font-medium">{item.quantity}</p>
              <p className="text-xs text-yellow-400">
                {item.discount} discount
              </p>
            </div>
            <p className="font-bold text-yellow-400">{item.price}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Contact our sales team for custom quotes on large projects
      </p>
    </div>
  );
}

// Reviews Component
function Reviews({
  reviews,
  totalReviews,
  averageRating,
}: {
  reviews: any[];
  totalReviews: number;
  averageRating: number;
}) {
  const ratingDistribution = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[review.rating - 1]++;
    }
  });

  return (
    <div className="bg-white border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          Customer Reviews ({totalReviews})
        </h3>
        <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
          Write a Review
        </button>
      </div>

      {/* Rating Summary */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50">
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </p>
          <p className="text-sm text-gray-500">out of 5</p>
        </div>
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star - 1] || 0;
            const percentage =
              totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-xs w-10">{star} stars</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-10">
                  {Math.round(percentage)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name || ""}
                        width={32}
                        height={32}
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-700">
                        {review.user.name?.charAt(0) || "C"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {review.user.name || "Customer"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.title && (
                <p className="font-medium text-sm mb-1">{review.title}</p>
              )}
              {review.content && (
                <p className="text-sm text-gray-600">{review.content}</p>
              )}
              {review.isVerified && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified Purchase
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
}

// Related Products Component
async function RelatedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId: string;
  currentProductId: string;
}) {
  const relatedProducts = await getRelatedProducts(
    categoryId,
    currentProductId,
  );

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.slug}`}
            className="group bg-white border border-gray-200 p-4 hover:border-yellow-500 hover:shadow-lg transition-all"
          >
            <div className="aspect-square bg-gray-100 mb-3 overflow-hidden relative">
              {product.images[0] ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-yellow-600">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              {product.category?.name}
            </p>
            <p className="font-bold text-sm">
              ₦{product.price.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const discount = calculateDiscount(product.price, product.compareAtPrice);
  const averageRating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    (product.reviews.length || 1);
  const features = await getIndustrialFeatures(
    product.category?.name || "General",
  );
  const deliveryOptions = getDeliveryOptions();
  const bulkPrices = getBulkPricing(product.price);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <Link href="/shop" className="text-gray-500 hover:text-gray-700">
              Shop
            </Link>
            <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
            {product.category?.parent && (
              <>
                <Link
                  href={`/shop?category=${product.category.parent.id}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {product.category.parent.name}
                </Link>
                <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
              </>
            )}
            {product.category && (
              <Link
                href={`/shop?category=${product.category.id}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {product.category.name}
              </Link>
            )}
            <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-xs">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Gallery */}
          <div>
            <ProductGallery
              images={product.images.map((img) => img.url)}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div>
            {/* Category & Status */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {product.category && (
                <Link
                  href={`/shop?category=${product.category.id}`}
                  className="text-xs uppercase tracking-wider text-gray-500 hover:text-yellow-600 border border-gray-200 px-3 py-1"
                >
                  {product.category.name}
                </Link>
              )}
              <span
                className={`px-3 py-1 text-xs font-medium ${
                  product.quantity > 10
                    ? "bg-green-100 text-green-800"
                    : product.quantity > 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {product.quantity > 10
                  ? "In Stock"
                  : product.quantity > 0
                    ? `Low Stock (${product.quantity} left)`
                    : "Out of Stock"}
              </span>
              {discount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1">
                  -{discount}% OFF
                </span>
              )}
              {product.featured && (
                <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1">
                  FEATURED
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                Based on {product._count.reviews} reviews
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₦{product.compareAtPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      Save ₦
                      {(
                        product.compareAtPrice - product.price
                      ).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Excluding VAT and delivery
              </p>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <div className="bg-gray-100 p-4 mb-6">
                <p className="text-gray-700">{product.shortDescription}</p>
              </div>
            )}

            {/* Industrial Specs Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-white border border-gray-200">
                <Package className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-500">Weight</p>
                <p className="text-sm font-medium">
                  {getWeightFromName(product.name)}
                </p>
              </div>
              <div className="text-center p-3 bg-white border border-gray-200">
                <Ruler className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-500">Dimensions</p>
                <p className="text-sm font-medium">
                  {getDimensionsFromName(product.name)}
                </p>
              </div>
              <div className="text-center p-3 bg-white border border-gray-200">
                <Shield className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-500">Warranty</p>
                <p className="text-sm font-medium">5 Years</p>
              </div>
              <div className="text-center p-3 bg-white border border-gray-200">
                <Award className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-500">Certified</p>
                <p className="text-sm font-medium">ISO, SON</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <AddToCartButton
                  product={product}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-none py-3"
                />
              </div>
              <WishlistButton
                productId={product.id}
                className="p-3 border border-gray-300 hover:border-yellow-500 transition-colors"
                iconClassName="h-5 w-5"
              />
              <button className="p-3 border border-gray-300 hover:border-yellow-500 transition-colors">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Full Description */}
            <div className="prose max-w-none mb-6">
              <h3 className="font-bold text-lg mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {features.slice(0, 4).map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Stock Info */}
            <div className="bg-gray-100 p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium">
                  {product.quantity > 0 ? (
                    <>Ready to ship in 24-48 hours</>
                  ) : (
                    <>Out of stock - Expected in 7-14 days</>
                  )}
                </p>
                <p className="text-xs text-gray-600">
                  {product.quantity} units available for immediate dispatch
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
          <div className="lg:col-span-2 space-y-6">
            <TechnicalSpecs
              productId={product.id}
              category={product.category?.name || "General"}
            />
            <IndustrialFeatures
              category={product.category?.name || "General"}
            />
            <Reviews
              reviews={product.reviews}
              totalReviews={product._count.reviews}
              averageRating={averageRating}
            />
            <ReviewForm productId={product.id} productName={product.name} />
          </div>
          <div className="space-y-6">
            <DeliveryOptions />
            <BulkPricing price={product.price} />

            {/* Safety Info */}
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600" />
                Safety Information
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Wear appropriate safety gear during installation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Follow manufacturer installation guidelines</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Professional installation recommended</span>
                </li>
                {product.category?.name?.includes("Electrical") && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <span>Qualified electrician required for installation</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Support */}
            <div className="bg-gray-900 text-white p-6">
              <h3 className="font-bold text-lg mb-4">Need Assistance?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Our technical team is available to help with specifications,
                installation, and bulk orders.
              </p>
              <div className="space-y-2">
                <a
                  href="/contact"
                  className="block w-full py-2 bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors font-medium text-center"
                >
                  Contact Technical Support
                </a>
                <a
                  href="/contact?quote=true"
                  className="block w-full py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-center"
                >
                  Request Quote
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product.categoryId && (
          <RelatedProducts
            categoryId={product.categoryId}
            currentProductId={product.id}
          />
        )}
      </div>
    </div>
  );
}
