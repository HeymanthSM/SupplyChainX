import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SupplyChainX – Autonomous AI-Powered Supply Chain Intelligence Platform',
  description: 'Enterprise-grade supply chain intelligence, logistics route planner, risk radar, and predictive twin simulator.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen text-slate-100 bg-[#070A12]">
        {children}
      </body>
    </html>
  );
}
