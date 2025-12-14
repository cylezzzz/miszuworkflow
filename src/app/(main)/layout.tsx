import Header from '@/components/layout/header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/50 dark:bg-background">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
