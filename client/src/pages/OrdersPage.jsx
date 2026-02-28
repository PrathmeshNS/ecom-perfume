import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderService } from "../services/order.service";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Spinner";
import { formatPrice, getImageUrl } from "../utils/helpers";
import { Package, ChevronRight } from "lucide-react";

const statusColors = {
  pending: "warning",
  shipped: "default",
  delivered: "success",
  paid: "success",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await orderService.getUserOrders({ page, limit: 10 });
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Package className="h-6 w-6" />
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-12 w-12 text-slate mb-3" />
          <h2 className="text-xl font-semibold text-dark">No orders yet</h2>
          <p className="text-slate mt-1">
            Start shopping to see your orders here
          </p>
          <Link to="/">
            <Button className="mt-4">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-blush/50 px-4 py-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-slate">Order </span>
                      <span className="font-mono font-medium text-dark">
                        #{order._id?.slice(-8)}
                      </span>
                    </div>
                    <div className="text-slate">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                    <Badge variant={statusColors[order.paymentStatus]}>
                      Payment: {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Transaction ID */}
                {order.transactionId && (
                  <div className="px-4 py-2 border-b border-border bg-blush/30">
                    <p className="text-xs text-slate">
                      Transaction ID:{" "}
                      <span className="font-mono font-medium text-dark">
                        {order.transactionId}
                      </span>
                    </p>
                  </div>
                )}

                {/* Order items */}
                <div className="px-4 py-3 space-y-3">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={getImageUrl(item.productId?.images)}
                        alt={item.productId?.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.productId?.name || "Product"}
                        </p>
                        <p className="text-xs text-slate">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-xs text-slate">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* Order footer */}
                <div className="flex items-center justify-between border-t border-border bg-blush/30 px-4 py-3">
                  <span className="font-semibold">
                    Total: {formatPrice(order.totalAmount)}
                  </span>
                  <Button variant="ghost" size="sm">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

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
      )}
    </div>
  );
}
