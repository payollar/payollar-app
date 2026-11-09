"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications";
import { cn } from "@/lib/utils";

const PANEL_WIDTH = 352;

function formatBadge(count) {
  const n = Number(count) || 0;
  if (n <= 0) return null;
  if (n > 99) return "99+";
  return String(n);
}

function timeLabel(iso) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

function panelStyleFromButton(button) {
  if (!button || typeof window === "undefined") {
    return { top: 56, right: 16, width: PANEL_WIDTH };
  }
  const rect = button.getBoundingClientRect();
  const gutter = 12;
  const width = Math.min(PANEL_WIDTH, window.innerWidth - gutter * 2);
  const right = Math.max(gutter, window.innerWidth - rect.right);
  const top = Math.min(rect.bottom + 8, window.innerHeight - 120);
  return {
    top,
    right,
    width,
    maxHeight: Math.max(220, window.innerHeight - top - gutter),
  };
}

export function NotificationBell({ className }) {
  const router = useRouter();
  const pathname = usePathname();
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelBox, setPanelBox] = useState({
    top: 56,
    right: 16,
    width: PANEL_WIDTH,
    maxHeight: 420,
  });
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const refresh = useCallback(async ({ withList = false } = {}) => {
    try {
      const url = withList
        ? "/api/notifications?limit=30"
        : "/api/notifications?countOnly=1";
      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(Number(data?.unreadCount) || 0);
      if (withList && Array.isArray(data?.notifications)) {
        setItems(data.notifications);
      }
    } catch {
      // Keep last snapshot
    }
  }, []);

  const syncPanelPosition = useCallback(() => {
    setPanelBox(panelStyleFromButton(buttonRef.current));
  }, []);

  useEffect(() => {
    refresh({ withList: false });
  }, [refresh, pathname]);

  useEffect(() => {
    const timer = setInterval(() => refresh({ withList: open }), 15000);
    return () => clearInterval(timer);
  }, [refresh, open]);

  useEffect(() => {
    const onFocus = () => refresh({ withList: open });
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh, open]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    syncPanelPosition();
    setLoading(true);
    refresh({ withList: true }).finally(() => setLoading(false));

    const onResize = () => syncPanelPosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, refresh, syncPanelPosition]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointer = (event) => {
      const target = event.target;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    // Defer so the opening click does not immediately close the panel.
    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointer);
      document.addEventListener("touchstart", onPointer);
      document.addEventListener("keydown", onKey);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const badge = formatBadge(unreadCount);

  const openItem = (item) => {
    startTransition(async () => {
      if (!item.readAt) {
        await markNotificationRead(item.id);
        setItems((prev) =>
          prev.map((row) =>
            row.id === item.id
              ? { ...row, readAt: new Date().toISOString() }
              : row
          )
        );
        setUnreadCount((n) => Math.max(0, n - 1));
      }
      setOpen(false);
      if (item.href) router.push(item.href);
    });
  };

  const markAll = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      setItems((prev) =>
        prev.map((row) => ({
          ...row,
          readAt: row.readAt || new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    });
  };

  const panel =
    open && mounted
      ? createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            className="fixed z-[9999] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
            style={{
              top: panelBox.top,
              right: panelBox.right,
              width: panelBox.width,
              maxHeight: panelBox.maxHeight,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Notifications
                </p>
                <p className="text-[11px] text-slate-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "You're all caught up"}
                </p>
              </div>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAll}
                  disabled={pending}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950 disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              ) : null}
            </div>

            <div
              className="overflow-y-auto"
              style={{ maxHeight: Math.max(160, panelBox.maxHeight - 64) }}
            >
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  No notifications yet. Bookings, kits, campaigns, products,
                  media, and disputes show up here.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const unread = !item.readAt;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => openItem(item)}
                          className={cn(
                            "block w-full px-3.5 py-3 text-left transition hover:bg-slate-50",
                            unread && "bg-[#faf8ff]"
                          )}
                        >
                          <span className="flex items-start gap-2.5">
                            <span
                              className={cn(
                                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                                unread ? "bg-[#6d28d9]" : "bg-transparent"
                              )}
                            />
                            <span className="min-w-0 flex-1">
                              <span
                                className={cn(
                                  "block text-sm leading-snug",
                                  unread
                                    ? "font-semibold text-slate-950"
                                    : "font-medium text-slate-800"
                                )}
                              >
                                {item.title}
                              </span>
                              {item.body ? (
                                <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-slate-500">
                                  {item.body}
                                </span>
                              ) : null}
                              <span className="mt-1 block text-[11px] text-slate-400">
                                {timeLabel(item.createdAt)}
                              </span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={
          badge ? `Notifications, ${badge} unread` : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative inline-flex size-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-slate-950",
          open && "bg-slate-100 text-slate-950"
        )}
      >
        <Bell className="h-[18px] w-[18px]" />
        {badge ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6d28d9] px-1 text-[10px] font-semibold leading-none text-white">
            {badge}
          </span>
        ) : null}
      </button>
      {panel}
    </div>
  );
}
