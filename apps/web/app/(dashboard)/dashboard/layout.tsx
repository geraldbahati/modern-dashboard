import TopBar from "./_components/topbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <div className="flex h-full">
        <TopBar />
        <div className="flex-1 flex flex-col">
          {/* <Sidebar /> */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
