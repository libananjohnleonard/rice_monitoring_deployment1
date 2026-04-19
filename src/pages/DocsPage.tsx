import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileDown, FileText, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
} from 'docx';
import type {
  AnalysisHistoryItem,
  SectionResult,
} from '../components/AnalysisResults';
import { API_BASE_URL } from '../lib/config';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function fetchDetailedAnalyses(limit = 500): Promise<AnalysisHistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/analyses?limit=${limit}&detailed=true`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch analyses');
  }
  return response.json();
}

function harvestLabel(result: AnalysisHistoryItem['result']) {
  return result.harvestStatus ?? (result.harvestReady ? 'Ready to Harvest' : 'Not Ready');
}

function sectionHarvestLabel(section: SectionResult) {
  return section.harvestStatus ?? (section.harvestReady ? 'Ready to Harvest' : 'Not Ready');
}

function buildSectionRows(item: AnalysisHistoryItem) {
  return (item.result.sections ?? []).map((section) => [
    section.sectionLabel,
    section.healthStatus,
    String(section.healthScore),
    `${section.greenPercentage.toFixed(1)}%`,
    `${section.yellowPercentage.toFixed(1)}%`,
    `${section.brownPercentage.toFixed(1)}%`,
    sectionHarvestLabel(section),
    section.isExcluded ? 'Excluded' : 'Included',
  ]);
}

export function DocsPage() {
  const [loading, setLoading] = useState<'pdf' | 'docx' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAndDownloadPDF = async () => {
    setLoading('pdf');
    setError(null);

    try {
      const data = await fetchDetailedAnalyses(500);
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFontSize(14);
      doc.text('Rice Plant Health - Analysis Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

      autoTable(doc, {
        head: [[
          'Date',
          'Category',
          'Source',
          'Status',
          'Score',
          'Green %',
          'Yellow %',
          'Brown %',
          'Harvest',
          'Notes',
        ]],
        body: data.map((item) => [
          new Date(item.createdAt).toLocaleString(),
          item.category,
          item.sourceType,
          item.result.status ?? '',
          String(item.result.healthScore ?? ''),
          String(item.result.green ?? ''),
          String(item.result.yellow ?? ''),
          String(item.result.brown ?? ''),
          harvestLabel(item.result),
          (item.notes ?? '').slice(0, 60) +
            ((item.notes?.length ?? 0) > 60 ? '...' : ''),
        ]),
        startY: 28,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94] },
      });

      let cursorY =
        (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
          ?.finalY ?? 28;

      data.forEach((item, index) => {
        const rows = buildSectionRows(item);
        if (rows.length === 0) return;

        if (cursorY > 175) {
          doc.addPage();
          cursorY = 18;
        }

        doc.setFontSize(11);
        doc.text(
          `Analysis ${index + 1}: ${new Date(item.createdAt).toLocaleString()} - ${item.category}`,
          14,
          cursorY + 8
        );
        doc.setFontSize(9);
        doc.text(
          `Interpretation: ${item.result.interpretation ?? 'N/A'}`,
          14,
          cursorY + 14
        );

        autoTable(doc, {
          head: [[
            'Section',
            'Health',
            'Score',
            'Green %',
            'Yellow %',
            'Brown %',
            'Harvest',
            'State',
          ]],
          body: rows,
          startY: cursorY + 18,
          theme: 'grid',
          styles: { fontSize: 7.5 },
          headStyles: { fillColor: [16, 185, 129] },
        });

        cursorY =
          ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
            ?.finalY ?? cursorY + 18) + 8;
      });

      const date = new Date().toISOString().slice(0, 10);
      doc.save(`rice-analysis-${date}.pdf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate PDF');
    } finally {
      setLoading(null);
    }
  };

  const loadAndDownloadWord = async () => {
    setLoading('docx');
    setError(null);

    try {
      const data = await fetchDetailedAnalyses(500);
      const date = new Date().toISOString().slice(0, 10);

      const summaryTable = new Table({
        width: { size: 100, type: 'PERCENTAGE' },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              'Date',
              'Category',
              'Source',
              'Status',
              'Score',
              'Green %',
              'Yellow %',
              'Brown %',
              'Harvest',
              'Notes',
            ].map((label) => new TableCell({ children: [new Paragraph(label)] })),
          }),
          ...data.map(
            (item) =>
              new TableRow({
                children: [
                  new Date(item.createdAt).toLocaleString(),
                  item.category,
                  item.sourceType,
                  item.result.status ?? '',
                  String(item.result.healthScore ?? ''),
                  String(item.result.green ?? ''),
                  String(item.result.yellow ?? ''),
                  String(item.result.brown ?? ''),
                  harvestLabel(item.result),
                  (item.notes ?? '').slice(0, 200),
                ].map((value) => new TableCell({ children: [new Paragraph(value)] })),
              })
          ),
        ],
      });

      const detailBlocks = data.flatMap((item, index) => {
        const sectionRows = buildSectionRows(item);

        const children: Array<Paragraph | Table> = [
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Analysis ${index + 1}: ${new Date(item.createdAt).toLocaleString()} - ${item.category}`,
                bold: true,
              }),
            ],
          }),
          new Paragraph(`Source: ${item.sourceType}`),
          new Paragraph(`Overall Health: ${item.result.status ?? 'N/A'}`),
          new Paragraph(`Harvest Status: ${harvestLabel(item.result)}`),
          new Paragraph(`Interpretation: ${item.result.interpretation ?? 'N/A'}`),
        ];

        if (sectionRows.length > 0) {
          children.push(
            new Table({
              width: { size: 100, type: 'PERCENTAGE' },
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: [
                    'Section',
                    'Health',
                    'Score',
                    'Green %',
                    'Yellow %',
                    'Brown %',
                    'Harvest',
                    'State',
                  ].map((label) => new TableCell({ children: [new Paragraph(label)] })),
                }),
                ...sectionRows.map(
                  (row) =>
                    new TableRow({
                      children: row.map((value) =>
                        new TableCell({ children: [new Paragraph(String(value))] })
                      ),
                    })
                ),
              ],
            })
          );
        }

        return children;
      });

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Rice Plant Health - Analysis Report',
                    bold: true,
                    size: 28,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Generated: ${new Date().toLocaleString()}`,
                    size: 22,
                  }),
                ],
              }),
              new Paragraph({ text: '' }),
              summaryTable,
              ...detailBlocks,
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, `rice-analysis-${date}.docx`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate Word document');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-emerald-800">Docs</h1>
        <p className="mb-6 text-emerald-700">
          Download your analysis results as a report. Choose Word (.docx) for
          editing and sharing, or PDF for printing and archiving. Data includes
          overall status, category, source, notes, color percentages, harvest
          status, interpretation, and by-section details when available.
        </p>

        {error && (
          <p
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          <button
            onClick={loadAndDownloadPDF}
            disabled={!!loading}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-400 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
          >
            {loading === 'pdf' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
            Download as PDF
          </button>

          <button
            onClick={loadAndDownloadWord}
            disabled={!!loading}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-400 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
          >
            {loading === 'docx' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileDown className="h-5 w-5" />
            )}
            Download as Word
          </button>
        </div>

        <p className="mt-4 text-xs text-emerald-600">
          Exports up to 500 most recent analyses.
        </p>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
