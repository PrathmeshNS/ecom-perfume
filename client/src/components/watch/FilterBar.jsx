import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function FilterBar({
  filters,
  onFilterChange,
  onClearFilters,
  brands = [],
  filtersOpen,
  setFiltersOpen,
}) {
  const hasActiveFilters =
    filters.search ||
    (filters.brand && filters.brand.length > 0) ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.tags;

  return (
    <div className="mb-6 flex flex-col gap-4">
      {/* Search + toggle row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
          <Input
            placeholder="Search watches..."
            className="pl-9"
            aria-label="Search watches"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="md:hidden"
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter controls */}
      <div
        className={`flex flex-col gap-3 md:flex md:flex-row md:flex-wrap md:items-end ${
          filtersOpen ? "block" : "hidden md:flex"
        }`}
      >
        {/* Brand multi-select (dropdown) */}
        <div>
          <Label className="text-xs mb-1 block" htmlFor="brand-filter">
            Brand
          </Label>
          <Select
            id="brand-filter"
            value={filters.brand?.[0] || ""}
            onChange={(e) =>
              onFilterChange(
                "brand",
                e.target.value ? [e.target.value] : []
              )
            }
            aria-label="Filter by brand"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </div>

        {/* Price range */}
        <div className="flex gap-2 items-end">
          <div>
            <Label className="text-xs mb-1 block" htmlFor="min-price">
              Min ₹
            </Label>
            <Input
              id="min-price"
              type="number"
              placeholder="0"
              className="w-24"
              value={filters.minPrice}
              onChange={(e) => onFilterChange("minPrice", e.target.value)}
              aria-label="Minimum price"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block" htmlFor="max-price">
              Max ₹
            </Label>
            <Input
              id="max-price"
              type="number"
              placeholder="Any"
              className="w-24"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange("maxPrice", e.target.value)}
              aria-label="Maximum price"
            />
          </div>
        </div>

        {/* Min rating */}
        <div>
          <Label className="text-xs mb-1 block" htmlFor="rating-filter">
            Min Rating
          </Label>
          <Select
            id="rating-filter"
            value={filters.minRating}
            onChange={(e) => onFilterChange("minRating", e.target.value)}
            aria-label="Minimum rating"
          >
            <option value="">Any</option>
            <option value="1">★ 1+</option>
            <option value="2">★ 2+</option>
            <option value="3">★ 3+</option>
            <option value="4">★ 4+</option>
            <option value="4.5">★ 4.5+</option>
          </Select>
        </div>

        {/* Sort */}
        <div>
          <Label className="text-xs mb-1 block" htmlFor="sort-select">
            Sort By
          </Label>
          <Select
            id="sort-select"
            value={`${filters.sortBy}_${filters.order}`}
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split("_");
              onFilterChange("sortBy", sortBy);
              onFilterChange("order", order);
            }}
            aria-label="Sort watches"
          >
            <option value="createdAt_desc">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating_desc">Top Rated</option>
            <option value="releaseDate_desc">Release Date</option>
            <option value="name_asc">Name: A–Z</option>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="self-end"
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
