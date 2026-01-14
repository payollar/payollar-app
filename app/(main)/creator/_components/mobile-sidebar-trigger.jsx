"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileSidebarTrigger() {
  return (
    <>
      <style jsx global>{`
        @media (min-width: 768px) {
          .mobile-sidebar-trigger-wrapper {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
        }
      `}</style>
      <div className="mobile-sidebar-trigger-wrapper md:hidden">
        <SidebarTrigger className="-ml-1" />
      </div>
    </>
  );
}
