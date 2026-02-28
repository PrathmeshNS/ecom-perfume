import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { Upload, X } from "lucide-react";

export default function WatchForm({
  form,
  setForm,
  categories,
  imageFiles,
  setImageFiles,
  onSubmit,
  onCancel,
  editing,
  submitting,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="watch-name">Watch Name</Label>
          <Input
            id="watch-name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="watch-brand">Brand</Label>
          <Input
            id="watch-brand"
            required
            value={form.brand}
            onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="watch-model">Model</Label>
          <Input
            id="watch-model"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="watch-category">Category</Label>
          <Select
            id="watch-category"
            value={form.categoryId}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoryId: e.target.value }))
            }
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="watch-description">Description</Label>
        <Textarea
          id="watch-description"
          required
          rows={3}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="watch-price">Price (₹)</Label>
          <Input
            id="watch-price"
            type="number"
            required
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="watch-stock">Stock</Label>
          <Input
            id="watch-stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="watch-rating">Rating</Label>
          <Input
            id="watch-rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="watch-releaseDate">Release Date</Label>
          <Input
            id="watch-releaseDate"
            type="date"
            value={form.releaseDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, releaseDate: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="watch-tags">Tags (comma separated)</Label>
          <Input
            id="watch-tags"
            placeholder="luxury, sport, casual"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="watch-features">Features (comma separated)</Label>
          <Input
            id="watch-features"
            placeholder="water resistant, sapphire crystal"
            value={form.features}
            onChange={(e) =>
              setForm((f) => ({ ...f, features: e.target.value }))
            }
          />
        </div>
      </div>

      <div>
        <Label>Images</Label>
        <div className="mt-1 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2 text-sm hover:bg-pastel/30">
            <Upload className="h-4 w-4" />
            Choose files
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
            />
          </label>
          {imageFiles.length > 0 && (
            <span className="text-sm text-slate">
              {imageFiles.length} file(s) selected
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : editing
            ? "Update Watch"
            : "Create Watch"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
