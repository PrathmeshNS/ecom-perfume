import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderOpen,
  ChevronLeft,
  Watch,
  Settings,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { to: "/admin/categories", icon: FolderOpen, label: "Categories" },
  { to: "/admin/watches", icon: Watch, label: "Watches" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-white transition-all duration-200",
          sidebarOpen ? "w-56" : "w-20"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-border shrink-0">
          {sidebarOpen && (
            <span className="text-base font-bold text-dark">Admin Panel</span>
          )}
          {!sidebarOpen && (
            <span className="text-base font-bold text-dark mx-auto">AP</span>
          )}
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-cta text-white shadow-sm"
                    : "text-slate hover:bg-pastel/40 hover:text-dark",
                  !sidebarOpen && "justify-center px-0"
                )}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-border shrink-0 space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className={cn(
              "w-full justify-start gap-3 text-slate hover:text-dark hover:bg-pastel/40",
              !sidebarOpen && "justify-center px-0"
            )}
            title={!sidebarOpen ? "Back to Store" : undefined}
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Back to Store</span>}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setLogoutModalOpen(true)}
            className={cn(
              "w-full justify-start gap-3 text-slate hover:text-red-500 hover:bg-red-50",
              !sidebarOpen && "justify-center px-0"
            )}
            title={!sidebarOpen ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "w-full justify-start gap-3 text-slate hover:text-dark hover:bg-pastel/40",
              !sidebarOpen && "justify-center px-0"
            )}
            title={!sidebarOpen ? "Toggle Sidebar" : undefined}
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 shrink-0 transition-transform",
                !sidebarOpen && "rotate-180"
              )}
            />
            {sidebarOpen}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto bg-pastel/10">
        <Outlet />
      </div>

      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Confirm Logout"
      >
        <p className="text-slate mb-6">Are you sure you want to log out of the admin panel?</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setLogoutModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white">
            Log Out
          </Button>
        </div>
      </Modal>
    </div>
  );
}
