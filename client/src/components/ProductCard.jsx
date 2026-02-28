import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Card, CardContent } from "./ui/Card";
import { formatPrice, getImageUrl } from "../utils/helpers";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      await addToCart(product._id, 1);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <Link to={`/product/${product._id}`}>
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md hover:border-lilac/40">
        <div className="relative aspect-square overflow-hidden bg-blush">
          <img
            src={getImageUrl(product.images)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark/50">
              <Badge variant="destructive" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate uppercase tracking-wide">
                {product.brand}
              </p>
              <h3 className="mt-1 font-semibold leading-tight truncate text-dark">
                {product.name}
              </h3>
              {product.categoryId && (
                <Badge variant="secondary" className="mt-1">
                  {product.categoryId.name}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-dark">{formatPrice(product.price)}</span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-cta text-white hover:bg-cta/90"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
          {product.rating > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm text-slate">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
