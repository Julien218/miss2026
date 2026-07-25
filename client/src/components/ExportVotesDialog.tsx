import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ExportVotesDialog() {
  const [open, setOpen] = useState(false);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = trpc.admin.exportVotesPDF.useMutation();
  const exportExcel = trpc.admin.exportVotesExcel.useMutation();

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const result = await exportPDF.mutateAsync({
        contestId: 1,
        dateStart: dateStart || undefined,
        dateEnd: dateEnd || undefined,
      });

      // Download PDF
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${result.data}`;
      link.download = result.filename;
      link.click();

      toast.success(`Export PDF réussi : ${result.totalVotes} votes exportés`);
      setOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'export PDF");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const result = await exportExcel.mutateAsync({
        contestId: 1,
        dateStart: dateStart || undefined,
        dateEnd: dateEnd || undefined,
      });

      // Download Excel
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.data}`;
      link.download = result.filename;
      link.click();

      toast.success(`Export Excel réussi : ${result.totalVotes} votes exportés`);
      setOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'export Excel");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="w-4 h-4" />
          Exporter les Votes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exporter les Votes</DialogTitle>
          <DialogDescription>
            Téléchargez les données de votes au format PDF ou Excel avec filtres optionnels.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="dateStart">Date de début (optionnel)</Label>
            <Input
              id="dateStart"
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              disabled={isExporting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateEnd">Date de fin (optionnel)</Label>
            <Input
              id="dateEnd"
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              disabled={isExporting}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex-1 gap-2"
              variant="default"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              Export PDF
            </Button>
            <Button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex-1 gap-2"
              variant="outline"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              Export Excel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
