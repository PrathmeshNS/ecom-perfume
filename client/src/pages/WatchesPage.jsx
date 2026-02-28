import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { watchService } from "../services/watch.service";
import WatchCard from "../components/watch/WatchCard";
import FilterBar from "../components/watch/FilterBar";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Spinner";
import { Search } from "lucide-react";

const STORAGE_KEY = "watchFilters";

const defaultFilters = {
  search: "",
  brand: [],
  minPrice: "",
  maxPrice: "",
  minRating: "",
  sortBy: "createdAt",
  order: "desc",
  page: 1,
};

function loadFilters(searchParams) {
  // Prefer URL params, then localStorage, then defaults
  const hasUrlParams = [...searchParams.keys()].length > 0;
  if (hasUrlParams) {
    return {
      search: searchParams.get("search") || "",
      brand: searchParams.getAll("brand"),
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      minRating: searchParams.get("minRating") || "",
      sortBy: searchParams.get("sortBy") || "createdAt",
      order: searchParams.get("order") || "desc",
      page: parseInt(searchParams.get("page")) || 1,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultFilters, ...JSON.parse(stored), page: 1 };
  } catch {
    // ignore
  }
  return { ...defaultFilters };
}

export default function WatchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => loadFilters(searchParams));
  const [watches, setWatches] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchWatches = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 12, page: filters.page };
      if (filters.search) params.search = filters.search;
      if (filters.brand?.length) params["brand[]"] = filters.brand;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.order) params.order = filters.order;

      const { data } = await watchService.getWatches(params);
      setWatches(data.data.watches);
      setBrands(data.data.brands || []);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error("Failed to fetch watches:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Persist filters to localStorage
  useEffect(() => {
    const { page, ...rest } = filters;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {
      // ignore
    }
  }, [filters]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    filters.brand?.forEach((b) => params.append("brand", b));
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.minRating) params.set("minRating", filters.minRating);
    if (filters.sortBy !== "createdAt") params.set("sortBy", filters.sortBy);
    if (filters.order !== "desc") params.set("order", filters.order);
    if (filters.page > 1) params.set("page", filters.page);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  useEffect(() => {
    fetchWatches();
  }, [fetchWatches]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, ...(key !== "page" && { page: 1 }) }));
  };

  const clearFilters = () => {
    setFilters({ ...defaultFilters });
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 rounded-xl bg-linear-to-r from-dark to-slate p-8 text-white md:p-12">
        <h1 className="text-3xl font-bold md:text-5xl">Explore Watches</h1>
        <p className="mt-3 max-w-xl text-pastel">
          Discover premium timepieces from the world's finest brands. From
          classic elegance to modern innovation.
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        brands={brands}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
      />

      {/* Grid */}
      {loading ? (
        <PageLoader />
      ) : watches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-slate mb-4" />
          <h2 className="text-xl font-semibold text-dark">No watches found</h2>
          <p className="text-slate mt-1">
            Try adjusting your search or filter criteria
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {watches.map((watch) => (
              <WatchCard key={watch._id} watch={watch} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handleFilterChange("page", filters.page - 1)}
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
                onClick={() => handleFilterChange("page", filters.page + 1)}
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
