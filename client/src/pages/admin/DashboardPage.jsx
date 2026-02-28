import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { PageLoader } from "../../components/ui/Spinner";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";
import { productService } from "../../services/product.service";
import { adminOrderService } from "../../services/order.service";
import { formatPrice } from "../../utils/helpers";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          productService.getProducts({ page: 1, limit: 1 }),
          adminOrderService.getAllOrders({ page: 1, limit: 5 }),
        ]);

        const orders = ordersRes.data.data.orders;
        const totalRevenue = orders.reduce(
          (sum, o) => sum + (o.paymentStatus === "paid" ? o.totalAmount : 0),
          0
        );

        setStats({
          totalProducts: productsRes.data.data.pagination.total,
          totalOrders: ordersRes.data.data.pagination.total,
          totalRevenue,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
        });
        setRecentOrders(orders);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <PageLoader />;

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "text-green-500",
    },
    {
      title: "Revenue (Paid)",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: "text-yellow-500",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Users,
      color: "text-red-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No orders yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium">Order ID</th>
                    <th className="text-left py-3 px-2 font-medium">Customer</th>
                    <th className="text-left py-3 px-2 font-medium">Amount</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-left py-3 px-2 font-medium">Payment</th>
                    <th className="text-left py-3 px-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 px-2 font-mono">
                        #{order._id?.slice(-8)}
                      </td>
                      <td className="py-3 px-2">
                        {order.userId?.name || "N/A"}
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            order.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
