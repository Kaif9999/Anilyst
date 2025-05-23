import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`dashboard-layout ${inter.className}`}>
      {/* Dashboard layout elements like sidebar, header, etc. can go here */}
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}
