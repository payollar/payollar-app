import { Inter } from "next/font/google";
import "./globals.css";
// import { ClerkProvider } from "@clerk/nextjs"; // Clerk - removed, using Better Auth
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

// import sidebar components
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Payollar App",
  description: "Connect with talents anytime, anywhere",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Wrap everything with SidebarProvider */}
          {/* <SidebarProvider> */}
          {/* <AppSidebar /> */}

            <div className="flex flex-col min-h-screen">
              <Header />

              <main className="flex-1">

                
                {children}
              </main>
{/* 
              <footer className="bg-muted/50 py-12">
                <div className="container mx-auto px-4 text-center text-gray-200">
                  <p>Payollar 2025 All right reserved!</p>
                </div>
              </footer> */}
            </div>
          {/* </SidebarProvider> */}

          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
