import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/Button";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice, getImageUrl } from "../utils/helpers";
import { Spinner } from "./ui/Spinner";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal, loading } =
    useCart();
  const { user } = useAuth();

  if (!cartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-dark/40"
        onClick={() => setCartOpen(false)}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-dark flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCartOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Spinner />
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-12 w-12 text-slate mb-3" />
              <p className="text-slate mb-4">Login to view your cart</p>
              <Link to="/login" onClick={() => setCartOpen(false)}>
                <Button>Login</Button>
              </Link>
            </div>
          ) : cart.items?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-12 w-12 text-slate mb-3" />
              <p className="text-slate">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items?.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 rounded-xl border border-border p-3 transition-colors hover:bg-blush/50"
                >
                  <img
                    src={getImageUrl(item.productId?.images)}
                    alt={item.productId?.name}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-sm leading-tight text-dark">
                        {item.productId?.name}
                      </h4>
                      <p className="text-sm text-slate">
                        {item.productId?.brand}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(
                              item.productId._id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(
                              item.productId._id,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {formatPrice(item.productId?.price * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.productId._id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {user && cart.items?.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex justify-between text-lg font-semibold text-dark">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <Link to="/checkout" onClick={() => setCartOpen(false)}>
              <Button className="w-full bg-cta text-white hover:bg-cta/90" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
