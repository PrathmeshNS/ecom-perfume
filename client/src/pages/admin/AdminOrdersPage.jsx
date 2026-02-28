import { useState, useEffect, useCallback } from "react";
import { adminOrderService } from "../../services/order.service";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { PageLoader } from "../../components/ui/Spinner";
import { formatPrice } from "../../utils/helpers";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;  
      const { data } = await adminOrderService.getAllOrders(params);
      setOrders(data.data.orders);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateOrder = async (orderId, field, value) => {
    try {
      await adminOrderService.updateOrder(orderId, { [field]: value });
      toast.success("Order updated");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Select
          className="w-40"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </Select>
        <Select
          className="w-40"
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Payment</option>
          <option value="pending">Unpaid</option>
          <option value="paid">Paid</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Items</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Payment</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3 px-4 font-mono text-xs">
                      #{order._id?.slice(-8)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">
                          {order.userId?.name || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.userId?.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {order.items?.length || 0} items
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <Select
                        className="w-28 h-8 text-xs"
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrder(order._id, "status", e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </Select>
                    </td>
                    <td className="py-3 px-4">
                      <Select
                        className="w-24 h-8 text-xs"
                        value={order.paymentStatus}
                        onChange={(e) =>
                          handleUpdateOrder(
                            order._id,
                            "paymentStatus",
                            e.target.value
                          )
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </Select>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No orders found
            </p>
          )}
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
          <span className="text-sm text-muted-foreground px-4">
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
