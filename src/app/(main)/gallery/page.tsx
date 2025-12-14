import { WorkflowCard } from '@/components/gallery/workflow-card';
import { MOCK_GALLERY_ITEMS } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function GalleryPage() {
    const verifiedItems = MOCK_GALLERY_ITEMS.filter(item => item.verificationStatus === 'verified');
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="text-center">
                <h1 className="font-headline text-4xl font-bold">Workflow-Galerie</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Entdecken, teilen und inspirieren Sie sich von Workflows aus der Community.
                </p>
            </div>
            
            <Tabs defaultValue="verified" className="mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <TabsList>
                        <TabsTrigger value="verified">Verifiziert</TabsTrigger>
                        <TabsTrigger value="all">Alle</TabsTrigger>
                        <TabsTrigger value="popular">Beliebt</TabsTrigger>
                        <TabsTrigger value="newest">Neueste</TabsTrigger>
                    </TabsList>
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Workflows suchen..." className="pl-10" />
                    </div>
                </div>

                <TabsContent value="verified" className="mt-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {verifiedItems.map((item) => (
                            <WorkflowCard key={item.id} item={item} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="all" className="mt-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {MOCK_GALLERY_ITEMS.map((item) => (
                            <WorkflowCard key={item.id} item={item} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="popular" className="mt-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...MOCK_GALLERY_ITEMS].sort((a,b) => b.downloads - a.downloads).map((item) => (
                            <WorkflowCard key={item.id} item={item} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="newest" className="mt-6">
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                         {[...MOCK_GALLERY_ITEMS].reverse().map((item) => (
                            <WorkflowCard key={item.id} item={item} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
