import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bot, Dna, Share2 } from 'lucide-react';
import Logo from '@/components/layout/logo';

const features = [
  {
    icon: <Dna className="h-8 w-8 text-primary" />,
    title: 'Intuitive Workflow Canvas',
    description: 'Entwerfen Sie komplexe Automatisierungen mit einer einfachen und eleganten Drag-and-Drop-Oberfläche.',
    image: 'https://picsum.photos/seed/canvas/600/400',
    hint: 'workflow',
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'KI-gestützte Empfehlungen',
    description: 'Erhalten Sie intelligente Knotenvorschläge basierend auf Ihrem aktuellen Workflow und Ihren Aufgabenanforderungen.',
    image: 'https://picsum.photos/seed/ai/600/400',
    hint: 'ai',
  },
  {
    icon: <Share2 className="h-8 w-8 text-primary" />,
    title: 'Galerie & Teilen',
    description: 'Präsentieren Sie Ihre Kreationen in unserer öffentlichen Galerie oder halten Sie sie privat. Bewerten und entdecken Sie neue Workflows.',
    image: 'https://picsum.photos/seed/gallery/600/400',
    hint: 'community',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Anmelden</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              Loslegen <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative py-20 md:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 top-0 -z-10 h-full w-full bg-background"
          >
            <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-primary/20 opacity-50 blur-[80px]"></div>
          </div>
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Bauen Sie Ihre Vision, automatisiert.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              MiSZU Workfield ist ein Workflow-Builder der nächsten Generation, der KI nutzt, um Ihnen zu helfen, leistungsstarke Automatisierungen schneller als je zuvor zu erstellen.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  App starten <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/gallery">Galerie erkunden</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-secondary py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">
                Entfesseln Sie Ihre Kreativität
              </h2>
              <p className="mt-4 text-muted-foreground">
                Von einfachen Aufgaben bis hin zu komplexen Integrationen bietet MiSZU Workfield die Werkzeuge, die Sie benötigen.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl dark:bg-card">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="px-4 pb-4 text-muted-foreground">{feature.description}</div>
                     <Image
                      src={feature.image}
                      alt={feature.title}
                      width={600}
                      height={400}
                      className="h-48 w-full object-cover"
                      data-ai-hint={feature.hint}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MiSZU Workfield. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
