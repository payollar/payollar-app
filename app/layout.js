import localFont from "next/font/local";
import "./globals.css";
// import { ClerkProvider } from "@clerk/nextjs"; // Clerk - removed, using Better Auth
import { Toaster } from "sonner";
import ConditionalHeader from "@/components/conditional-header";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingChat } from "@/components/FloatingChat";
import { MainWrapper } from "@/components/main-wrapper";
import { ChunkLoadRecovery } from "@/components/chunk-load-recovery";

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-geist-sans",
});
const dmSans = localFont({
  src: "./fonts/dm-sans-latin.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-heading",
});
const caveat = localFont({
  src: "./fonts/caveat-latin.woff2",
  weight: "500 700",
  display: "swap",
  variable: "--font-handwriting",
});

export const metadata = {
  title: "Payollar App",
  description: "Connect with talents anytime, anywhere",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
};

const CHUNK_RECOVERY_BOOTSTRAP = `
(function () {
  try {
    var KEY = "payollar:chunk-reload-at";
    function bad(msg) {
      msg = String(msg || "");
      return /ChunkLoadError|Loading chunk [\\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(msg);
    }
    function reload() {
      try {
        var last = Number(sessionStorage.getItem(KEY) || 0);
        if (last && Date.now() - last < 15000) return;
        sessionStorage.setItem(KEY, String(Date.now()));
      } catch (e) {
        return;
      }
      location.reload();
    }
    window.addEventListener("error", function (e) {
      if (bad(e && e.message) || bad(e && e.error && e.error.message) || bad(e && e.error && e.error.name)) reload();
    });
    window.addEventListener("unhandledrejection", function (e) {
      var r = e && e.reason;
      if (bad(r) || bad(r && r.message) || bad(r && r.name)) reload();
    });
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CHUNK_RECOVERY_BOOTSTRAP }} />
      </head>
      <body
        className={`${inter.className} ${inter.variable} ${dmSans.variable} ${caveat.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ChunkLoadRecovery />
          <div className="flex flex-col min-h-screen">
            <ConditionalHeader />

            <MainWrapper>
              {children}
            </MainWrapper>
          </div>

          <FloatingChat />
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
