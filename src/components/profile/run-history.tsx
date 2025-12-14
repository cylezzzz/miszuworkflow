import { MOCK_RUN_HISTORY } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function RunHistory() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Workflow</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Dauer</TableHead>
          <TableHead className="text-right">Gestartet am</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {MOCK_RUN_HISTORY.map((run) => (
          <TableRow key={run.id}>
            <TableCell className="font-medium">{run.workflowName}</TableCell>
            <TableCell>
              <Badge
                variant={run.status === 'Success' ? 'default' : run.status === 'Failed' ? 'destructive' : 'secondary'}
                className={cn(run.status === 'Success' && 'bg-green-600/80 text-white')}
              >
                {run.status === 'Success' ? 'Erfolgreich' : run.status === 'Failed' ? 'Fehlgeschlagen' : run.status}
              </Badge>
            </TableCell>
            <TableCell>{run.duration}</TableCell>
            <TableCell className="text-right">{new Date(run.startedAt).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
