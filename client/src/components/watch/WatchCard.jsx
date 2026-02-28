import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatPrice, getImageUrl } from "../../utils/helpers";

export default function WatchCard({ watch }) {
  return (
    <Link to={`/watches/${watch._id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-lilac/40">
        <div className="relative aspect-square overflow-hidden bg-blush">
          <img
            src={getImageUrl(watch.images)}
            alt={watch.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          {watch.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark/50">
              <Badge variant="destructive" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="min-w-0">
            <p className="text-xs text-slate uppercase tracking-wide">
              {watch.brand}
            </p>
            <h3 className="mt-1 font-semibold leading-tight truncate text-dark">
              {watch.name}
            </h3>
            {watch.model && (
              <p className="text-xs text-slate mt-0.5 truncate">
                {watch.model}
              </p>
            )}
            <div className="mt-1 flex flex-wrap gap-1">
              {watch.categoryId && (
                <Badge variant="secondary" className="text-[10px]">
                  {watch.categoryId.name}
                </Badge>
              )}
              {watch.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-dark">{formatPrice(watch.price)}</span>
            {watch.rating > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm text-slate">
                  {watch.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
