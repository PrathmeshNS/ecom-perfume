import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { cartService } from "../services/cart.service";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    try {
      setLoading(true);
      const { data } = await cartService.getCart();
      setCart(data.data.cart);
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await cartService.addToCart(productId, quantity);
    setCart(data.data.cart);
    setCartOpen(true);
  };

  const removeFromCart = async (productId) => {
    const { data } = await cartService.removeFromCart(productId);
    setCart(data.data.cart);
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await cartService.updateQuantity(productId, quantity);
    setCart(data.data.cart);
  };

  const clearCart = async () => {
    await cartService.clearCart();
    setCart({ items: [] });
  };

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const cartTotal =
    cart.items?.reduce((sum, item) => {
      const price = item.productId?.price || 0;
      return sum + price * item.quantity;
    }, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
