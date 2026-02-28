import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productService, categoryService } from "../services/product.service";
import ProductCard from "../components/ProductCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { PageLoader } from "../components/ui/Spinner";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "-createdAt",
    page: parseInt(searchParams.get("page")) || 1,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sort) params.sort = filters.sort;
      params.page = filters.page;

      const { data } = await productService.getProducts(params);
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await categoryService.getCategories();
      setCategories(data.data.categories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
    // Sync filters to URL
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val && val !== "-createdAt" && val !== 1) {
        params.set(key, val);
      }
    });
    setSearchParams(params, { replace: true });
  }, [filters, fetchProducts, setSearchParams]);

  // Update filters when URL changes externally (e.g. navbar search)
  useEffect(() => {
    const newSearch = searchParams.get("search") || "";
    const newCategory = searchParams.get("category") || "";
    setFilters((prev) => {
      if (prev.search !== newSearch || prev.category !== newCategory) {
        return { ...prev, search: newSearch, category: newCategory, page: 1 };
      }
      return prev;
    });
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      sort: "-createdAt",
      page: 1,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.brand ||
    filters.minPrice ||
    filters.maxPrice;

  return (
    <div>
      {/* Hero section */}
      <div className="mb-8 rounded-xl bg-linear-to-r from-dark to-slate p-8 text-white md:p-12">
        <h1 className="text-3xl font-bold md:text-5xl">
          Discover Your Signature Scent
        </h1>
        <p className="mt-3 max-w-xl text-pastel">
          Premium perfumes curated for every style. Explore our collection of
          luxury fragrances for men, women, and unisex options.
        </p>
      </div>

      {/* Filters bar */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
            <Input
              placeholder="Search perfumes..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div
          className={`flex flex-col gap-3 md:flex md:flex-row md:items-center ${
            filtersOpen ? "block" : "hidden md:flex"
          }`}
        >
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </Select>

          <Input
            placeholder="Brand"
            className="w-full md:w-32"
            value={filters.brand}
            onChange={(e) => handleFilterChange("brand", e.target.value)}
          />

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min ₹"
              className="w-24"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max ₹"
              className="w-24"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>

          <Select
            value={filters.sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
          >
            <option value="-createdAt">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-rating">Top Rated</option>
            <option value="name">Name: A-Z</option>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Product grid */}
      {loading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-slate mb-4" />
          <h2 className="text-xl font-semibold text-dark">No products found</h2>
          <p className="text-slate mt-1">
            Try adjusting your search or filter criteria
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </Button>
              <span className="text-sm text-slate px-4">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
