import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import ConditionalHeaderWrapper from "@/components/conditional-header-wrapper";
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
    <ClerkProvider
      appearance={{
        elements: {
          rootBox: "bg-white",
          card: "bg-white border-gray-200 shadow-lg",
          headerTitle: "text-gray-900 text-2xl font-bold",
          headerSubtitle: "text-gray-600",
          socialButtonsBlockButton: "bg-white text-gray-900 border-gray-300 hover:bg-gray-50",
          formButtonPrimary: "bg-gray-900 text-white hover:bg-gray-800",
          formFieldInput: "bg-white text-gray-900 border-gray-300",
          formFieldLabel: "text-gray-700",
          dividerLine: "bg-gray-300",
          dividerText: "text-gray-600",
          footerActionLink: "text-gray-900 hover:text-gray-700",
          identityPreviewText: "text-gray-900",
          identityPreviewEditButton: "text-gray-900 hover:text-gray-700",
          formResendCodeLink: "text-gray-900 hover:text-gray-700",
          otpCodeFieldInput: "bg-white text-gray-900 border-gray-300",
        },
        variables: {
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#111827",
          colorPrimary: "#111827",
          colorText: "#111827",
          colorTextSecondary: "#4b5563",
          colorDanger: "#ef4444",
          colorSuccess: "#10b981",
          borderRadius: "0.5rem",
          fontFamily: inter.style.fontFamily,
        },
      }}
    >
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
                <ConditionalHeaderWrapper>
                  <Header />
                </ConditionalHeaderWrapper>

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
    </ClerkProvider>
  );
}
