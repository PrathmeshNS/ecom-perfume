import { useState, useEffect, useCallback } from "react";
import { watchService } from "../../services/watch.service";
import { categoryService } from "../../services/product.service";
import WatchForm from "../../components/watch/WatchForm";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { PageLoader } from "../../components/ui/Spinner";
import { formatPrice, getImageUrl } from "../../utils/helpers";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  brand: "",
  model: "",
  description: "",
  price: "",
  categoryId: "",
  tags: "",
  features: "",
  rating: "",
  stock: "",
  releaseDate: "",
};

export default function AdminWatchesPage() {
  const [watches, setWatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [imageFiles, setImageFiles] = useState([]);

  const fetchWatches = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await watchService.getWatches({ page, limit: 10 });
      setWatches(data.data.watches);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load watches");
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await categoryService.getCategories();
      setCategories(data.data.categories);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchWatches();
    fetchCategories();
  }, [fetchWatches, fetchCategories]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setImageFiles([]);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (watch) => {
    setForm({
      name: watch.name,
      brand: watch.brand,
      model: watch.model || "",
      description: watch.description,
      price: watch.price.toString(),
      categoryId: watch.categoryId?._id || "",
      tags: watch.tags?.join(", ") || "",
      features: watch.features?.join(", ") || "",
      rating: watch.rating?.toString() || "0",
      stock: watch.stock.toString(),
      releaseDate: watch.releaseDate
        ? new Date(watch.releaseDate).toISOString().split("T")[0]
        : "",
    });
    setEditing(watch._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("brand", form.brand);
      formData.append("model", form.model);
      formData.append("description", form.description);
      formData.append("price", form.price);
      if (form.categoryId) formData.append("categoryId", form.categoryId);
      formData.append("tags", form.tags);
      formData.append("features", form.features);
      formData.append("rating", form.rating || "0");
      formData.append("stock", form.stock || "0");
      if (form.releaseDate) formData.append("releaseDate", form.releaseDate);
      imageFiles.forEach((file) => formData.append("images", file));

      if (editing) {
        await watchService.updateWatch(editing, formData);
        toast.success("Watch updated");
      } else {
        await watchService.createWatch(formData);
        toast.success("Watch created");
      }

      resetForm();
      fetchWatches();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this watch?")) return;
    try {
      await watchService.deleteWatch(id);
      toast.success("Watch deleted");
      fetchWatches();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading && !showForm) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Watches</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Watch
          </Button>
        )}
      </div>

      {/* Watch Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editing ? "Edit Watch" : "New Watch"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <WatchForm
              form={form}
              setForm={setForm}
              categories={categories}
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              editing={editing}
              submitting={submitting}
            />
          </CardContent>
        </Card>
      )}

      {/* Watches Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-blush/50">
                  <th className="text-left py-3 px-4 font-medium">Watch</th>
                  <th className="text-left py-3 px-4 font-medium">Brand</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">Stock</th>
                  <th className="text-left py-3 px-4 font-medium">Rating</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watches.map((watch) => (
                  <tr
                    key={watch._id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(watch.images)}
                          alt={watch.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <div>
                          <span className="font-medium truncate max-w-50 block">
                            {watch.name}
                          </span>
                          {watch.model && (
                            <span className="text-xs text-slate">
                              {watch.model}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{watch.brand}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">
                        {watch.categoryId?.name || "N/A"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatPrice(watch.price)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={watch.stock > 0 ? "success" : "destructive"}
                      >
                        {watch.stock}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {watch.rating > 0 ? (
                        <span className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          {watch.rating.toFixed(1)}
                        </span>
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(watch)}
                          aria-label={`Edit ${watch.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(watch._id)}
                          aria-label={`Delete ${watch.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-slate px-4">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
