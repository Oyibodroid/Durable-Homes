"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  Save,
  X,
  Upload,
  Plus,
  Trash2,
  Package,
  DollarSign,
  Layers,
  AlertCircle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id?: string;
  url: string;
  file?: File;
  isMain?: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    cost: "",
    quantity: "",
    categoryId: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED" | "OUT_OF_STOCK",
    featured: false,
  });
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // Generate SKU suggestion based on product name
  const generateSku = () => {
    if (!formData.name) {
      toast.error("Please enter product name first");
      return;
    }

    const prefix = formData.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);

    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const suggestedSku = `${prefix}-${random}`;

    setFormData({ ...formData, sku: suggestedSku });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);

    // Validate file types
    const validFiles = files.filter((file) =>
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      ),
    );

    if (validFiles.length !== files.length) {
      toast.error(
        "Some files were skipped. Only JPEG, PNG, WEBP, and GIF are allowed.",
      );
    }

    // Validate file size (max 5MB)
    const validSizeFiles = validFiles.filter(
      (file) => file.size <= 5 * 1024 * 1024,
    );

    if (validSizeFiles.length !== validFiles.length) {
      toast.error("Some files were skipped. Maximum file size is 5MB.");
    }

    // Create preview URLs
    const newImages = validSizeFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      isMain: images.length === 0 && validSizeFiles.indexOf(file) === 0, // First image is main
    }));

    setImages([...images, ...newImages]);
  };

  // Remove image
  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    // If we removed the main image and there are other images, make the first one main
    if (images[index].isMain && updatedImages.length > 0) {
      updatedImages[0].isMain = true;
    }
    setImages(updatedImages);
  };

  // Set main image
  const setMainImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    setImages(updatedImages);
  };

  // Upload all images to server
  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image.file) continue; // Skip if no file (should not happen)

      const formData = new FormData();
      formData.append("file", image.file);

      try {
        setUploadProgress((prev) => ({ ...prev, [image.file!.name]: 0 }));

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload", true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress((prev) => ({
              ...prev,
              [image.file!.name]: Math.round(percentComplete),
            }));
          }
        };

        const response = await new Promise<{ url: string }>(
          (resolve, reject) => {
            xhr.onload = () => {
              if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
              } else {
                reject(new Error("Upload failed"));
              }
            };
            xhr.onerror = () => reject(new Error("Upload failed"));
            xhr.send(formData);
          },
        );

        uploadedUrls.push(response.url);
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[image.file!.name];
          return newProgress;
        });
      } catch (error) {
        console.error("Failed to upload image:", error);
        toast.error(`Failed to upload image: ${image.file.name}`);
        throw error;
      }
    }

    return uploadedUrls;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.name) throw new Error("Product name is required");
      if (!formData.sku) throw new Error("SKU is required");
      if (!formData.price) throw new Error("Price is required");
      if (!formData.categoryId) throw new Error("Category is required");
      if (images.length === 0)
        throw new Error("At least one product image is required");

      // Upload images first
      let uploadedUrls: string[] = [];
      if (images.length > 0) {
        uploadedUrls = await uploadImages();
      }

      // Prepare product data
      // In your handleSubmit, ensure numbers are numbers:
      const productData = {
        ...formData,
        price: Number(formData.price) || 0,
        compareAtPrice: formData.compareAtPrice
          ? Number(formData.compareAtPrice)
          : null,
        cost: formData.cost ? Number(formData.cost) : null,
        quantity: Number(formData.quantity) || 0,
        images: uploadedUrls,
      };

      console.log("Submitting product data:", productData);

      // Create product
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      // First check if response is OK
      if (!res.ok) {
        // Try to get error message, but handle if response is not JSON
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP error ${res.status}`);
        } else {
          // Response is not JSON - likely an HTML error page
          const text = await res.text();
          // console.error('Non-JSON response:', text.substring(0, 200))
          throw new Error(
            `Server error (${res.status}). Check console for details.`,
          );
        }
      }

      // Now safely parse JSON
      const responseData = await res.json();
      console.log("Product created:", responseData);

      toast.success("Product created successfully");
      router.push(`/admin/products/${responseData.id}`);
      router.refresh();
    } catch (error: any) {
      // console.error('Submission error:', error)
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-400" />
            Basic Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="e.g., Dangote Cement 42.5R"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  required
                  placeholder="e.g., CEM-DG-001"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateSku}
                  className="whitespace-nowrap"
                >
                  Generate SKU
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Short Description
            </label>
            <Input
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData({ ...formData, shortDescription: e.target.value })
              }
              placeholder="Brief summary (max 255 characters)"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Full Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
              placeholder="Detailed product description, specifications, and features..."
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-400" />
            Pricing & Inventory
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Compare at Price (₦)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.compareAtPrice}
                onChange={(e) =>
                  setFormData({ ...formData, compareAtPrice: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cost (₦)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">Feature this product on homepage</span>
            </label>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-gray-400" />
            Product Images <span className="text-red-500 text-sm">*</span>
          </h2>

          {/* Image Gallery */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {image.isMain && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Main
                    </span>
                  )}

                  {/* Upload progress indicator */}
                  {uploadProgress[image.file?.name || ""] && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white rounded-full px-3 py-1 text-sm font-medium">
                        {uploadProgress[image.file?.name || ""]}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  {!image.isMain && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="bg-white hover:bg-gray-100"
                      onClick={() => setMainImage(index)}
                      title="Set as main image"
                    >
                      <span className="text-xs font-bold">★</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="bg-white hover:bg-red-50 text-red-600"
                    onClick={() => removeImage(index)}
                    title="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Upload Placeholder */}
            <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition cursor-pointer bg-gray-50">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isSubmitting}
              />
              <div className="h-full flex flex-col items-center justify-center text-gray-500 hover:text-primary">
                <Upload className="h-8 w-8 mb-2" />
                <span className="text-xs text-center">Upload Images</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Supported formats: JPEG, PNG, WEBP, GIF (max 5MB each). First image
            will be the main product image.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border">
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
