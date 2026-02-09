import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  ScanFace,
  FileText,
  FileBarChart,
  Settings,
  Shield,
  ChevronDown,
  Image,
  Video,
  Mic,
  History,
  Receipt,
  Landmark,
  FileCheck,
  AlertCircle,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";

import logo from "@/assets/logo.jpeg";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavItem[];
}

import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [openSections, setOpenSections] = useState<string[]>(["deepfake", "finance"]);

  const navItems: NavItem[] = [
    {
      label: t("nav.dashboard"),
      href: "/app/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("nav.deepfake"),
      href: "/app/deepfake",
      icon: ScanFace,
      badge: 3,
      children: [
        { label: t("nav.deepfakeImage"), href: "/app/deepfake/image", icon: Image },
        { label: t("nav.deepfakeVideo"), href: "/app/deepfake/video", icon: Video },
        { label: t("nav.deepfakeAudio"), href: "/app/deepfake/audio", icon: Mic },
        { label: t("nav.deepfakeHistory"), href: "/app/deepfake/history", icon: History },
      ],
    },
    {
      label: t("nav.finance"),
      href: "/app/finance",
      icon: FileText,
      children: [
        { label: t("nav.financeInvoices"), href: "/app/finance/invoices", icon: Receipt },
        { label: t("nav.financeStatements"), href: "/app/finance/statements", icon: Landmark },
        { label: t("nav.financeContracts"), href: "/app/finance/contracts", icon: FileCheck },
        { label: t("nav.financeChecks"), href: "/app/finance/checks", icon: AlertCircle },
      ],
    },
    {
      label: t("nav.reports"),
      href: "/app/reports",
      icon: FileBarChart,
    },
    {
      label: t("nav.settings"),
      href: "/app/settings",
      icon: Settings,
    },
    ...(user?.role === 'admin' ? [{
      label: t("nav.admin"),
      href: "/app/admin",
      icon: Shield,
    }] : []),
  ];

  const toggleSection = (label: string) => {
    setOpenSections((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = location.pathname === item.href;
    const isChildActive = item.children?.some((child) =>
      location.pathname.startsWith(child.href)
    );
    const isSectionOpen = openSections.includes(item.label);

    if (hasChildren) {
      return (
        <Collapsible
          key={item.href}
          open={isSectionOpen}
          onOpenChange={() => toggleSection(item.label)}
          className="mb-1"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between relative overflow-hidden group hover:bg-muted/50 transition-all duration-300",
                (isItemActive || isChildActive) && "bg-muted/60 text-primary font-medium"
              )}
            >
              {(isItemActive || isChildActive) && (
                <motion.div
                  layoutId="active-sidebar-item-bg"
                  className="absolute inset-0 bg-primary/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <item.icon className={cn("h-4 w-4 transition-colors", (isItemActive || isChildActive) ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                {item.badge && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 bg-primary/20 text-primary hover:bg-primary/30">
                    {item.badge}
                  </Badge>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-300 text-muted-foreground",
                    isSectionOpen && "rotate-180 text-foreground"
                  )}
                />
              </div>
            </Button>
          </CollapsibleTrigger>
          <AnimatePresence>
            {isSectionOpen && (
              <CollapsibleContent forceMount>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-1 pl-4 pt-1 border-l-2 border-primary/10 ml-4"
                >
                  {item.children?.map((child) => renderNavItem(child, depth + 1))}
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      );
    }

    return (
      <NavLink
        key={item.href}
        to={item.href}
        className={({ isActive }) =>
          cn(
            "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-300 group mb-1",
            "hover:bg-muted/50 hover:text-foreground",
            isActive ? "text-primary font-medium" : "text-muted-foreground",
            depth > 0 && "pl-4"
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.div
                layoutId="active-sidebar-item"
                className="absolute inset-0 bg-primary/10 rounded-md border border-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.1)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
            <item.icon className={cn("h-4 w-4 relative z-10 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            <span className="relative z-10">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1 relative z-10 bg-primary/20 text-primary">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background/50 backdrop-blur-md border border-border/50 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-background/60 backdrop-blur-xl transition-transform lg:translate-x-0 shadow-xl",
          !isOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border/40 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50" />
            <NavLink to="/" className="flex items-center gap-3 relative z-10 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={logo}
                  alt="DeepTrust Logo"
                  className="h-8 w-8 rounded-full ring-2 ring-primary/20 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                DeepTrust AI
              </span>
            </NavLink>
          </div>

          {/* Nav Items */}
          <ScrollArea className="flex-1 px-4 py-4">
            <nav className="space-y-1">
              {navItems.map((item) => renderNavItem(item))}
            </nav>
          </ScrollArea>

          {/* User Profile / Footer */}
          <div className="border-t border-border/40 p-4 bg-muted/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-primary/20">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user?.username || 'User'}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              <span>{t("nav.logout")}</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
