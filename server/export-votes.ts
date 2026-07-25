import { z } from "zod";
import { adminProcedure } from "./_core/permissions";
import { getDb } from "./db";
import { votes, candidates } from "../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Type for jsPDF with autoTable
type jsPDFWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};

const exportFiltersSchema = z.object({
  contestId: z.number(),
  candidateId: z.number().optional(),
  dateStart: z.string().optional(),
  dateEnd: z.string().optional(),
});

export const exportVotesPDF = adminProcedure
  .input(exportFiltersSchema)
  .mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Build query with filters
    const conditions = [eq(votes.contestId, input.contestId)];
    
    if (input.candidateId) {
      conditions.push(eq(votes.candidateId, input.candidateId));
    }
    
    if (input.dateStart) {
      conditions.push(gte(votes.createdAt, new Date(input.dateStart)));
    }
    
    if (input.dateEnd) {
      conditions.push(lte(votes.createdAt, new Date(input.dateEnd)));
    }

    // Fetch votes with candidate names
    const votesData = await db
      .select({
        voteId: votes.id,
        candidateName: sql<string>`CONCAT(${candidates.firstName}, ' ', ${candidates.lastName})`,
        category: candidates.category,
        votedAt: votes.createdAt,
        ipAddress: votes.voterIp,
        country: votes.geoCountry,
        city: votes.geoCity,
        isFraudulent: votes.isFraudulent,
      })
      .from(votes)
      .innerJoin(candidates, eq(votes.candidateId, candidates.id))
      .where(and(...conditions))
      .orderBy(votes.createdAt);

    // Calculate statistics
    const totalVotes = votesData.length;
    const validVotes = votesData.filter((v: any) => v.isFraudulent === 0).length;
    const suspiciousVotes = votesData.filter((v: any) => v.isFraudulent === 1).length;

    // Group by candidate
    const votesByCandidate: Record<string, { count: number; category: string }> = {};
    votesData.forEach((vote: any) => {
      const key = vote.candidateName as string;
      if (!votesByCandidate[key]) {
        votesByCandidate[key] = { count: 0, category: vote.category as string };
      }
      votesByCandidate[key].count++;
    });

    // Generate PDF
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    // Title
    doc.setFontSize(20);
    doc.text("Rapport d'Export des Votes", 14, 20);
    
    // Metadata
    doc.setFontSize(10);
    doc.text(`Date de génération: ${new Date().toLocaleString("fr-FR")}`, 14, 30);
    doc.text(`Concours ID: ${input.contestId}`, 14, 36);
    
    if (input.dateStart || input.dateEnd) {
      const dateRange = `Période: ${input.dateStart || "Début"} - ${input.dateEnd || "Fin"}`;
      doc.text(dateRange, 14, 42);
    }

    // Statistics
    doc.setFontSize(14);
    doc.text("Statistiques Globales", 14, 55);
    doc.setFontSize(10);
    doc.text(`Total des votes: ${totalVotes}`, 14, 63);
    doc.text(`Votes valides: ${validVotes} (${((validVotes / totalVotes) * 100).toFixed(1)}%)`, 14, 69);
    doc.text(`Votes suspects: ${suspiciousVotes} (${((suspiciousVotes / totalVotes) * 100).toFixed(1)}%)`, 14, 75);

    // Votes by candidate table
    doc.setFontSize(14);
    doc.text("Votes par Candidat", 14, 90);
    
    const candidateTableData = Object.entries(votesByCandidate).map(([name, data]) => [
      name,
      data.category,
      data.count.toString(),
      ((data.count / totalVotes) * 100).toFixed(1) + "%",
    ]);

    autoTable(doc, {
      startY: 95,
      head: [["Candidat", "Catégorie", "Votes", "Pourcentage"]],
      body: candidateTableData,
      theme: "grid",
      headStyles: { fillColor: [212, 175, 55] }, // Gold color
    });

    // Detailed votes table (first 50 votes)
    const detailedStartY = (doc.lastAutoTable?.finalY || 100) + 15;
    doc.setFontSize(14);
    doc.text("Détail des Votes (50 premiers)", 14, detailedStartY);

    const detailedTableData = votesData.slice(0, 50).map((vote: any) => [
      vote.voteId.toString(),
      vote.candidateName as string,
      new Date(vote.votedAt).toLocaleString("fr-FR"),
      vote.city || "N/A",
      vote.country || "N/A",
      vote.isFraudulent === 1 ? "Oui" : "Non",
    ]);

    autoTable(doc, {
      startY: detailedStartY + 5,
      head: [["ID", "Candidat", "Date", "Ville", "Pays", "Suspect"]],
      body: detailedTableData,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [212, 175, 55] },
    });

    // Generate PDF as base64
    const pdfBase64 = doc.output("datauristring").split(",")[1];
    
    return {
      success: true,
      data: pdfBase64,
      filename: `votes-export-${Date.now()}.pdf`,
      totalVotes,
      validVotes,
      suspiciousVotes,
    };
  });

export const exportVotesExcel = adminProcedure
  .input(exportFiltersSchema)
  .mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Build query with filters (same as PDF)
    const conditions = [eq(votes.contestId, input.contestId)];
    
    if (input.candidateId) {
      conditions.push(eq(votes.candidateId, input.candidateId));
    }
    
    if (input.dateStart) {
      conditions.push(gte(votes.createdAt, new Date(input.dateStart)));
    }
    
    if (input.dateEnd) {
      conditions.push(lte(votes.createdAt, new Date(input.dateEnd)));
    }

    // Fetch votes with candidate names
    const votesData = await db
      .select({
        voteId: votes.id,
        candidateId: votes.candidateId,
        candidateName: sql<string>`CONCAT(${candidates.firstName}, ' ', ${candidates.lastName})`,
        category: candidates.category,
        votedAt: votes.createdAt,
        ipAddress: votes.voterIp,
        fingerprint: votes.voterFingerprint,
        userAgent: votes.userAgent,
        country: votes.geoCountry,
        city: votes.geoCity,
        isFraudulent: votes.isFraudulent,
      })
      .from(votes)
      .innerJoin(candidates, eq(votes.candidateId, candidates.id))
      .where(and(...conditions))
      .orderBy(votes.createdAt);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Miss & Mister Dour 2026";
    workbook.created = new Date();

    // Sheet 1: All Votes
    const votesSheet = workbook.addWorksheet("Votes");
    votesSheet.columns = [
      { header: "ID Vote", key: "voteId", width: 10 },
      { header: "Candidat", key: "candidateName", width: 25 },
      { header: "Catégorie", key: "category", width: 12 },
      { header: "Date & Heure", key: "votedAt", width: 20 },
      { header: "Adresse IP", key: "ipAddress", width: 18 },
      { header: "Ville", key: "city", width: 15 },
      { header: "Pays", key: "country", width: 15 },
      { header: "Suspect", key: "isFraudulent", width: 10 },
    ];

    votesData.forEach((vote: any) => {
      votesSheet.addRow({
        voteId: vote.voteId,
        candidateName: vote.candidateName,
        category: vote.category,
        votedAt: new Date(vote.votedAt).toLocaleString("fr-FR"),
        ipAddress: vote.ipAddress || "N/A",
        city: vote.city || "N/A",
        country: vote.country || "N/A",
        isFraudulent: vote.isFraudulent === 1 ? "Oui" : "Non",
      });
    });

    // Style header row
    votesSheet.getRow(1).font = { bold: true };
    votesSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD4AF37" }, // Gold
    };

    // Sheet 2: Statistics by Candidate
    const statsSheet = workbook.addWorksheet("Statistiques");
    statsSheet.columns = [
      { header: "Candidat", key: "candidateName", width: 25 },
      { header: "Catégorie", key: "category", width: 12 },
      { header: "Nombre de Votes", key: "voteCount", width: 18 },
      { header: "Pourcentage", key: "percentage", width: 15 },
    ];

    const votesByCandidate: Record<string, { count: number; category: string }> = {};
    votesData.forEach((vote: any) => {
      const key = vote.candidateName as string;
      if (!votesByCandidate[key]) {
        votesByCandidate[key] = { count: 0, category: vote.category as string };
      }
      votesByCandidate[key].count++;
    });

    const totalVotes = votesData.length;
    Object.entries(votesByCandidate).forEach(([name, data]) => {
      statsSheet.addRow({
        candidateName: name,
        category: data.category,
        voteCount: data.count,
        percentage: ((data.count / totalVotes) * 100).toFixed(2) + "%",
      });
    });

    statsSheet.getRow(1).font = { bold: true };
    statsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD4AF37" },
    };

    // Sheet 3: Summary
    const summarySheet = workbook.addWorksheet("Résumé");
    summarySheet.columns = [
      { header: "Métrique", key: "metric", width: 30 },
      { header: "Valeur", key: "value", width: 20 },
    ];

    const validVotes = votesData.filter((v: any) => v.isFraudulent === 0).length;
    const suspiciousVotes = votesData.filter((v: any) => v.isFraudulent === 1).length;

    summarySheet.addRow({ metric: "Total des votes", value: totalVotes });
    summarySheet.addRow({ metric: "Votes valides", value: validVotes });
    summarySheet.addRow({ metric: "Votes suspects", value: suspiciousVotes });
    summarySheet.addRow({ metric: "Taux de fraude", value: ((suspiciousVotes / totalVotes) * 100).toFixed(2) + "%" });
    summarySheet.addRow({ metric: "Date de génération", value: new Date().toLocaleString("fr-FR") });
    summarySheet.addRow({ metric: "Concours ID", value: input.contestId });

    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD4AF37" },
    };

    // Generate Excel as base64
    const buffer = await workbook.xlsx.writeBuffer();
    const excelBase64 = Buffer.from(buffer).toString("base64");

    return {
      success: true,
      data: excelBase64,
      filename: `votes-export-${Date.now()}.xlsx`,
      totalVotes,
      validVotes,
      suspiciousVotes,
    };
  });
