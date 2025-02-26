import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ProfileSetupModal } from "@/components/auth/profile-setup-modal";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { createClient } from "@/lib/supabase/client";

export const metadata = {
  title: "CodeMastery",
  description: "Plateforme d'apprentissage du développement web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Toaster position="top-center" />
            <ProfileSetupModal />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
