import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Star, User, CheckCircle } from 'lucide-react';
import type { GalleryItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WorkflowCardProps {
  item: GalleryItem;
}

export function WorkflowCard({ item }: WorkflowCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={600}
            height={400}
            className="h-48 w-full object-cover"
            data-ai-hint={item.imageHint}
          />
          {item.isNsfw && (
            <Badge variant="destructive" className="absolute right-2 top-2">NSFW</Badge>
          )}
          {item.verificationStatus === 'verified' && (
             <Badge className="absolute left-2 top-2 bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verifiziert
             </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="mb-2 font-headline text-lg">{item.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{item.author}</span>
        </CardDescription>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-secondary/50 p-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{item.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{item.downloads.toLocaleString()}</span>
          </div>
        </div>
        <Button size="sm" variant="ghost">Ansehen</Button>
      </CardFooter>
    </Card>
  );
}
