import { useMemo, useState } from 'react';
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
import { fetchJson } from '../lib/http';
import { getFieldProfiles, type FieldProfile } from '../lib/fieldProfiles';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function fetchDetailedAnalyses(limit = 500): Promise<AnalysisHistoryItem[]> {
  return fetchJson<AnalysisHistoryItem[]>(
    `${API_BASE_URL}/api/analyses?limit=${limit}&detailed=true`,
    {
      cache: 'no-store',
    }
  );
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
    `G ${section.greenPercentage.toFixed(1)}% | Y ${section.yellowPercentage.toFixed(1)}% | B ${section.brownPercentage.toFixed(1)}%`,
    sectionHarvestLabel(section),
    section.isExcluded ? 'Excluded' : 'Included',
  ]);
}

function stripLabel(value?: string | null) {
  return (value ?? '')
    .replace(/^Findings:\s*/i, '')
    .replace(/^Recommended Action:\s*/i, '')
    .replace(/^Prediction:\s*/i, '')
    .trim();
}

function reportProfileLabel(item: AnalysisHistoryItem) {
  return item.profileName || 'No profile';
}

function reportFindings(item: AnalysisHistoryItem) {
  return (
    stripLabel(item.result.maturityAssessment?.findings) ||
    stripLabel(item.result.interpretation) ||
    'No findings available.'
  );
}

function reportAction(item: AnalysisHistoryItem) {
  return (
    stripLabel(item.result.maturityAssessment?.prediction) ||
    stripLabel(item.result.maturityAssessment?.harvestParameter) ||
    stripLabel(item.result.recommendations) ||
    'No recommended action available.'
  );
}

function formatPercent(value?: number) {
  return typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A';
}

function matchesProfile(
  item: AnalysisHistoryItem,
  profileId: string,
  profile?: FieldProfile
) {
  if (profileId === 'all') return true;

  return item.profileId === profileId || item.profileName === profile?.profileName;
}

function profileReportTitle(profileName: string) {
  return profileName === 'All profiles'
    ? 'Rice Plant Health - Analysis Report'
    : `Rice Plant Health - ${profileName} Report`;
}

function wordParagraph(text: string, bold = false) {
  return new Paragraph({
    children: [new TextRun({ text, bold })],
  });
}

function tableCell(text: string, bold = false) {
  return new TableCell({
    children: [wordParagraph(text, bold)],
  });
}

export function DocsPage() {
  const [loading, setLoading] = useState<'pdf' | 'docx' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState('all');
  const profiles = useMemo(() => getFieldProfiles(), []);
  const selectedProfile =
    profiles.find((profile) => profile.id === selectedProfileId) ?? null;
  const selectedProfileName =
    selectedProfileId === 'all'
      ? 'All profiles'
      : selectedProfile?.profileName ?? 'Selected profile';

  const loadFilteredData = async () => {
    const data = await fetchDetailedAnalyses(500);
    return data.filter((item) => matchesProfile(item, selectedProfileId, selectedProfile ?? undefined));
  };

  const loadAndDownloadPDF = async () => {
    setLoading('pdf');
    setError(null);

    try {
      const data = await loadFilteredData();
      if (data.length === 0) {
        throw new Error(`No analysis records found for ${selectedProfileName}.`);
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFontSize(14);
      doc.text(profileReportTitle(selectedProfileName), 14, 15);
      doc.setFontSize(10);
      doc.text(`Profile: ${selectedProfileName}`, 14, 22);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

      autoTable(doc, {
        head: [[
          'Date',
          'Profile',
          'Status',
          'Score',
          'Harvest',
          'RGB Summary',
          'Recommended Action',
        ]],
        body: data.map((item) => [
          new Date(item.createdAt).toLocaleString(),
          reportProfileLabel(item),
          item.result.status ?? '',
          String(item.result.healthScore ?? ''),
          harvestLabel(item.result),
          `G ${formatPercent(item.result.green)} | Y ${formatPercent(item.result.yellow)} | B ${formatPercent(item.result.brown)}`,
          reportAction(item),
        ]),
        startY: 34,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 34 },
          2: { cellWidth: 24 },
          3: { cellWidth: 15 },
          4: { cellWidth: 36 },
          5: { cellWidth: 42 },
          6: { cellWidth: 95 },
        },
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
        doc.text(`Analysis ${index + 1}: ${new Date(item.createdAt).toLocaleString()}`, 14, cursorY + 8);
        doc.setFontSize(9);
        const detailText = doc.splitTextToSize(`Findings: ${reportFindings(item)}`, 260);
        doc.text(detailText, 14, cursorY + 14);
        cursorY += Math.max(18, detailText.length * 4 + 10);

        autoTable(doc, {
          head: [[
            'Section',
            'Health',
            'Score',
            'RGB',
            'Harvest',
            'State',
          ]],
          body: rows,
          startY: cursorY,
          theme: 'grid',
          styles: { fontSize: 7.5, overflow: 'linebreak' },
          headStyles: { fillColor: [16, 185, 129] },
        });

        cursorY =
          ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
            ?.finalY ?? cursorY + 18) + 8;
      });

      const date = new Date().toISOString().slice(0, 10);
      const safeProfile = selectedProfileName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      doc.save(`rice-analysis-${safeProfile}-${date}.pdf`);
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
      const data = await loadFilteredData();
      if (data.length === 0) {
        throw new Error(`No analysis records found for ${selectedProfileName}.`);
      }

      const date = new Date().toISOString().slice(0, 10);

      const summaryTable = new Table({
        width: { size: 100, type: 'PERCENTAGE' },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              'Date',
              'Profile',
              'Status',
              'Score',
              'Harvest',
              'RGB Summary',
            ].map((label) => tableCell(label, true)),
          }),
          ...data.map(
            (item) =>
              new TableRow({
                children: [
                  new Date(item.createdAt).toLocaleString(),
                  reportProfileLabel(item),
                  item.result.status ?? '',
                  String(item.result.healthScore ?? ''),
                  harvestLabel(item.result),
                  `G ${formatPercent(item.result.green)} | Y ${formatPercent(item.result.yellow)} | B ${formatPercent(item.result.brown)}`,
                ].map((value) => tableCell(value)),
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
                text: `Analysis ${index + 1}: ${new Date(item.createdAt).toLocaleString()}`,
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: 'PERCENTAGE' },
            rows: [
              ['Profile', reportProfileLabel(item)],
              ['Category', item.category],
              ['Source', item.sourceType],
              ['Overall Health', `${item.result.status ?? 'N/A'} (${item.result.healthScore ?? 'N/A'})`],
              ['RGB Summary', `Green ${formatPercent(item.result.green)} | Yellow ${formatPercent(item.result.yellow)} | Brown ${formatPercent(item.result.brown)}`],
              ['Harvest Status', harvestLabel(item.result)],
            ].map(
              ([label, value]) =>
                new TableRow({
                  children: [tableCell(label, true), tableCell(value)],
                })
            ),
          }),
          wordParagraph('Findings', true),
          wordParagraph(reportFindings(item)),
          wordParagraph('Recommended Action', true),
          wordParagraph(reportAction(item)),
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
                    'RGB',
                    'Harvest',
                    'State',
                  ].map((label) => tableCell(label, true)),
                }),
                ...sectionRows.map(
                  (row) =>
                    new TableRow({
                      children: row.map((value) =>
                        tableCell(String(value))
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
                    text: profileReportTitle(selectedProfileName),
                    bold: true,
                    size: 28,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Profile: ${selectedProfileName}`,
                    size: 22,
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
      const safeProfile = selectedProfileName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      downloadBlob(blob, `rice-analysis-${safeProfile}-${date}.docx`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate Word document');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-emerald-800">Docs</h1>
        <p className="mb-6 text-emerald-700">
          Select a profile, then download its analysis report as Word (.docx) or PDF.
          Reports include overall status, RGB readings, harvest status, findings,
          recommended action, and section details when available.
        </p>

        {error && (
          <p
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-emerald-900">
              Report profile
            </span>
            <select
              value={selectedProfileId}
              onChange={(event) => setSelectedProfileId(event.currentTarget.value)}
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-emerald-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="all">All profiles</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.profileName}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-xs text-emerald-700">
            The download will include records that match the selected profile.
          </p>
        </div>

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
          Exports up to 500 most recent analyses for the selected report profile.
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
