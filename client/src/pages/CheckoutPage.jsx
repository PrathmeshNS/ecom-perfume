import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/order.service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/Card";
import { formatPrice, getImageUrl } from "../utils/helpers";
import toast from "react-hot-toast";
import { MapPin, Plus, QrCode, CheckCircle } from "lucide-react";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  addressLine: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Valid pincode required"),
});

export default function CheckoutPage() {
  const { cart, cartTotal, fetchCart } = useCart();
  const { user, addAddress } = useAuth();
  const navigate = useNavigate();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=success
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addressSchema) });

  useEffect(() => {
    if (!cart.items?.length && step === 1) {
      navigate("/");
      toast.error("Your cart is empty");
    }
  }, [cart, navigate, step]);

  useEffect(() => {
    if (user?.addresses?.length > 0 && !selectedAddressId) {
      setSelectedAddressId(user.addresses[0]._id);
    }
  }, [user, selectedAddressId]);

  const handleAddAddress = async (data) => {
    try {
      const addresses = await addAddress(data);
      setSelectedAddressId(addresses[addresses.length - 1]._id);
      setShowAddressForm(false);
      reset();
      toast.success("Address added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add address");
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacing(true);
      const { data } = await orderService.createOrder({
        addressId: selectedAddressId,
      });
      setOrder(data.data.order);
      setStep(3);
      await fetchCart();
      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  // Step 3: Order success
  if (step === 3 && order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Order Placed!</h2>
            <p className="text-muted-foreground">
              Your order #{order._id?.slice(-8)} has been placed successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              Payment status: <span className="font-medium">Pending</span>
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={() => navigate("/orders")}>View Orders</Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Step 1: Address Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.addresses?.map((addr) => (
                <label
                  key={addr._id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    selectedAddressId === addr._id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">{addr.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {addr.addressLine}, {addr.city}, {addr.state} -{" "}
                      {addr.pincode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Phone: {addr.phone}
                    </p>
                  </div>
                </label>
              ))}

              {showAddressForm ? (
                <form
                  onSubmit={handleSubmit(handleAddAddress)}
                  className="space-y-3 rounded-lg border border-border p-4"
                >
                  <h4 className="font-medium">Add New Address</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Full Name</Label>
                      <Input {...register("fullName")} />
                      {errors.fullName && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input {...register("phone")} />
                      {errors.phone && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Address Line</Label>
                    <Input {...register("addressLine")} />
                    {errors.addressLine && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.addressLine.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label>City</Label>
                      <Input {...register("city")} />
                      {errors.city && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input {...register("state")} />
                      {errors.state && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input {...register("pincode")} />
                      {errors.pincode && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.pincode.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      Save Address
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowAddressForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedAddressId}
                className="w-full"
              >
                Continue to Payment
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: QR Payment */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-muted-foreground">
                Scan the QR code below to make payment of{" "}
                <strong>{formatPrice(cartTotal)}</strong>
              </p>
              <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted">
                <div className="text-center space-y-2">
                  <QrCode className="h-24 w-24 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Payment QR Code
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (Configure in admin settings)
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                After scanning, click &quot;Place Order&quot; to confirm. Admin
                will verify your payment manually.
              </p>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? "Placing Order..." : "Place Order"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Order Summary */}
      <div>
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.items?.map((item) => (
              <div key={item._id} className="flex gap-3">
                <img
                  src={getImageUrl(item.productId?.images)}
                  alt={item.productId?.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.productId?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                  <p className="text-sm font-semibold">
                    {formatPrice(item.productId?.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
