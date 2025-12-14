import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceInfo } from "@/components/profile/device-info";
import { RunHistory } from "@/components/profile/run-history";

export default function ProfilePage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <Card>
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src="https://picsum.photos/seed/user-avatar/128/128" alt="@shadcn" data-ai-hint="avatar" />
                                <AvatarFallback>DM</AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold font-headline">Demo User</h2>
                            <p className="text-muted-foreground">demo@flowcanvas.ai</p>
                            <p className="text-sm text-muted-foreground mt-2">Mitglied seit Okt 2023</p>
                            <Button variant="outline" className="mt-4 w-full">Profil bearbeiten</Button>
                        </CardContent>
                    </Card>
                    <DeviceInfo />
                </div>
                <div className="w-full md:w-2/3 lg:w-3/4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Ausführungschronik</CardTitle>
                            <CardDescription>Ein Protokoll Ihrer letzten Workflow-Ausführungen.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RunHistory />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
