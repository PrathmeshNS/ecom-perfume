import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../services/product.service";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { PageLoader } from "../components/ui/Spinner";
import { formatPrice, getImageUrl } from "../utils/helpers";
import { ShoppingCart, ArrowLeft, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await productService.getProduct(id);
        setProduct(data.data.product);
      } catch {
        toast.error("Product not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    try {
      await addToCart(product._id, quantity);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return null;

  return (
    <div>
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={
                product.images?.length > 0
                  ? product.images[selectedImage]?.url
                  : "/placeholder-perfume.jpg"
              }
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 cursor-pointer ${
                    selectedImage === idx
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </p>
            <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
            {product.categoryId && (
              <Badge variant="secondary" className="mt-2">
                {product.categoryId.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">
              {formatPrice(product.price)}
            </span>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-yellow-500">
                <span>★</span>
                <span className="text-sm text-muted-foreground">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Stock:</span>
            {product.stock > 0 ? (
              <Badge variant="success">{product.stock} available</Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart — {formatPrice(product.price * quantity)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
