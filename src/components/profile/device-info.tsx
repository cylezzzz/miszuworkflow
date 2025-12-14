'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, MemoryStick, Cpu } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function DeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState({
    cpu: null,
    memory: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This code runs only on the client
    const memory = (navigator as any).deviceMemory;
    const cpu = navigator.hardwareConcurrency;
    setDeviceInfo({
      cpu: cpu || null,
      memory: memory || null,
    });
    setLoading(false);
  }, []);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="font-headline text-lg">Gerätefähigkeiten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cpu className="h-4 w-4" />
            <span>CPU-Kerne</span>
          </div>
          {loading ? <Skeleton className="h-5 w-8" /> : <span className="font-semibold">{deviceInfo.cpu || 'N/V'}</span>}
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MemoryStick className="h-4 w-4" />
            <span>Speicher (GB)</span>
          </div>
          {loading ? <Skeleton className="h-5 w-8" /> : <span className="font-semibold">{deviceInfo.memory ? `~${deviceInfo.memory}` : 'N/V'}</span>}
        </div>
         <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <HardDrive className="h-4 w-4" />
            <span>GPU</span>
          </div>
          <span className="font-semibold text-muted-foreground">Nicht verfügbar</span>
        </div>
      </CardContent>
    </Card>
  );
}
