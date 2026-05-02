import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product/ProductCard";
import { Fragment } from "react";
import Link from "next/link";
import { Package, SlidersHorizontal, ChevronRight, Search } from "lucide-react";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const {
    category,
    search,
    sort,
    page: pageParam,
    minPrice,
    maxPrice,
  } = await searchParams;
  const page = Number(pageParam) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: any = { status: "PUBLISHED", publishedAt: { not: null } };
  if (category) where.categoryId = category;
  if (search)
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  const orderBy: any =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "newest"
          ? { createdAt: "desc" }
          : sort === "popular"
            ? { createdAt: "desc" }
            : { featured: "desc" };

  const [products, total, categories, activeCategory] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: { where: { isMain: true }, take: 1 },
        category: { select: { name: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    category ? prisma.category.findUnique({ where: { id: category } }) : null,
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;500;600;700&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
        .card-lift { transition:transform 0.28s ease,box-shadow 0.28s ease; }
        .card-lift:hover { transform:translateY(-4px); box-shadow:0 16px 36px rgba(201,168,76,0.12); }
      `}</style>

      <div
        className="min-h-screen bg-[#faf9f6]"
        style={{ fontFamily: "'Nunito', sans-serif", paddingTop: "80px" }}
      >
        {/* Page header */}
        <div className="bg-[#111008] hex-bg pt-14 pb-12">
          <div className="container mx-auto px-6 lg:px-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
              <Link href="/" className="hover:text-[#C9A84C] transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#C9A84C]">Shop</span>
              {activeCategory && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-white">{activeCategory.name}</span>
                </>
              )}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-7 h-px bg-[#C9A84C] inline-block" />
                  <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">
                    {total} Products
                  </span>
                </div>
                <h1 className="font-display text-4xl lg:text-5xl font-medium text-white">
                  {activeCategory
                    ? activeCategory.name
                    : search
                      ? `"${search}"`
                      : "All Products"}
                </h1>
              </div>

              {/* Search */}
              <form className="flex items-center bg-white/5 border border-white/10 hover:border-[#C9A84C]/30 transition-colors lg:w-80">
                <Search className="h-4 w-4 text-gray-500 ml-4 flex-shrink-0" />
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm px-3 py-3 outline-none"
                />
                {category && (
                  <input type="hidden" name="category" value={category} />
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-56 flex-shrink-0">
              {/* Categories */}
              <div className="bg-white border border-gray-200 p-5 mb-5">
                <p className="text-xs font-bold text-gray-900 tracking-wider uppercase mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-[#C9A84C]" />
                  Categories
                </p>
                <div className="space-y-1">
                  <Link
                    href="/shop"
                    className={`flex justify-between items-center px-3 py-2 text-sm transition-colors ${!category ? "text-[#C9A84C] bg-[#C9A84C]/6 font-semibold" : "text-gray-600 hover:text-[#C9A84C] hover:bg-gray-50"}`}
                  >
                    <span>All</span>
                    <span className="text-xs text-gray-400">{total}</span>
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.id}${sort ? `&sort=${sort}` : ""}`}
                      className={`flex justify-between items-center px-3 py-2 text-sm transition-colors ${category === cat.id ? "text-[#C9A84C] bg-[#C9A84C]/6 font-semibold" : "text-gray-600 hover:text-[#C9A84C] hover:bg-gray-50"}`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                        {cat._count.products}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="bg-white border border-gray-200 p-5 mb-5">
                <p className="text-xs font-bold text-gray-900 tracking-wider uppercase mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-[#C9A84C]" />
                  Sort By
                </p>
                <div className="space-y-1">
                  {[
                    { label: "Featured", value: "" },
                    { label: "Newest", value: "newest" },
                    { label: "Price: Low → High", value: "price_asc" },
                    { label: "Price: High → Low", value: "price_desc" },
                  ].map(({ label, value }) => (
                    <Link
                      key={value}
                      href={`/shop?${category ? `category=${category}&` : ""}${search ? `search=${search}&` : ""}sort=${value}`}
                      className={`block px-3 py-2 text-sm transition-colors ${(sort ?? "") === value ? "text-[#C9A84C] font-semibold" : "text-gray-600 hover:text-[#C9A84C]"}`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <form
                method="GET"
                className="bg-white border border-gray-200 p-5"
              >
                <p className="text-xs font-bold text-gray-900 tracking-wider uppercase mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-[#C9A84C]" />
                  Price (₦)
                </p>
                {category && (
                  <input type="hidden" name="category" value={category} />
                )}
                {sort && <input type="hidden" name="sort" value={sort} />}
                <div className="space-y-2 mb-4">
                  <input
                    name="minPrice"
                    type="number"
                    defaultValue={minPrice}
                    placeholder="Min"
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] text-gray-700"
                  />
                  <input
                    name="maxPrice"
                    type="number"
                    defaultValue={maxPrice}
                    placeholder="Max"
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] text-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#111008] hover:bg-[#C9A84C] text-white hover:text-[#111008] text-xs font-bold py-2.5 transition-colors"
                >
                  Apply Filter
                </button>
              </form>
            </aside>

            {/* Products grid */}
            <div className="flex-1 min-w-0">
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product as any} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                      {page > 1 && (
                        <Link
                          href={`/shop?${category ? `category=${category}&` : ""}${sort ? `sort=${sort}&` : ""}page=${page - 1}`}
                          className="px-4 py-2 border border-gray-300 text-sm text-gray-600 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
                        >
                          ← Prev
                        </Link>
                      )}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - page) <= 1,
                        )
                        // ...
                        .map((p, i, arr) => (
                          <Fragment key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <Link
                              href={`/shop?${category ? `category=${category}&` : ""}${sort ? `sort=${sort}&` : ""}page=${p}`}
                              className=""
                            >
                              {p}
                            </Link>
                          </Fragment>
                        ))}
                      {page < totalPages && (
                        <Link
                          href={`/shop?${category ? `category=${category}&` : ""}${sort ? `sort=${sort}&` : ""}page=${page + 1}`}
                          className="px-4 py-2 border border-gray-300 text-sm text-gray-600 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
                        >
                          Next →
                        </Link>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Package className="h-16 w-16 text-gray-300 mb-5" />
                  <h3 className="font-display text-2xl text-gray-800 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Try adjusting your filters or search terms.
                  </p>
                  <Link
                    href="/shop"
                    className="bg-[#C9A84C] text-[#111008] font-bold px-6 py-3 text-sm"
                  >
                    Clear Filters
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
