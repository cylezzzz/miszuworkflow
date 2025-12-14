import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-foreground", className)}>
      <BrainCircuit className="h-8 w-8 text-primary" />
      <span className="font-headline text-xl font-bold">MiSZU Workfield</span>
    </Link>
  );
}
