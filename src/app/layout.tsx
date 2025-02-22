import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/client";
import "./globals.css";

export const metadata = {
  title: "CodeMastery",
  description: "Apprenez le développement web de manière interactive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              const supabase = window.supabase;
              supabase.auth.onAuthStateChange((event, session) => {
                console.log("Auth state changed:", event, session);
                if (event === 'SIGNED_IN') {
                  console.log("User signed in:", session?.user);
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
