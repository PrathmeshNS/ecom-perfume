import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { watchService } from "../services/watch.service";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { PageLoader } from "../components/ui/Spinner";
import { formatPrice, getImageUrl } from "../utils/helpers";
import { ArrowLeft, Calendar, Tag, Cpu } from "lucide-react";
import toast from "react-hot-toast";

export default function WatchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [watch, setWatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchWatch = async () => {
      try {
        const { data } = await watchService.getWatch(id);
        setWatch(data.data.watch);
      } catch {
        toast.error("Watch not found");
        navigate("/watches");
      } finally {
        setLoading(false);
      }
    };
    fetchWatch();
  }, [id, navigate]);

  if (loading) return <PageLoader />;
  if (!watch) return null;

  return (
    <div>
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-blush">
            <img
              src={
                watch.images?.length > 0
                  ? watch.images[selectedImage]?.url
                  : "/placeholder-perfume.jpg"
              }
              alt={watch.name}
              className="h-full w-full object-cover"
            />
          </div>
          {watch.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {watch.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 cursor-pointer ${
                    selectedImage === idx
                      ? "border-lilac"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={`${watch.name} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Watch info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate uppercase tracking-wide">
              {watch.brand}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-dark">{watch.name}</h1>
            {watch.model && (
              <p className="mt-1 text-slate">{watch.model}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {watch.categoryId && (
                <Badge variant="secondary">{watch.categoryId.name}</Badge>
              )}
              {watch.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-dark">
              {formatPrice(watch.price)}
            </span>
            {watch.rating > 0 && (
              <div className="flex items-center gap-1 text-yellow-500">
                <span>★</span>
                <span className="text-sm text-slate">
                  {watch.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-slate leading-relaxed">
              {watch.description}
            </p>
          </div>

          {/* Features */}
          {watch.features?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Cpu className="h-4 w-4" /> Features
              </h3>
              <ul className="space-y-1">
                {watch.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-cta shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Stock:</span>
              {watch.stock > 0 ? (
                <Badge variant="success">{watch.stock} available</Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
            {watch.releaseDate && (
              <div className="flex items-center gap-1 text-slate">
                <Calendar className="h-4 w-4" />
                {new Date(watch.releaseDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
