import { jsPDF } from 'jspdf';
import Papa from 'papaparse';

export function downloadTextFile(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportRowsToCsv(filename: string, rows: Record<string, unknown>[]) {
  const csv = Papa.unparse(rows);
  downloadTextFile(filename, csv, 'text/csv');
}

export function exportKundliReportPdf(options: {
  title: string;
  subtitle: string;
  metadataLines: string[];
  sections: { heading: string; rows: string[] }[];
  filename: string;
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 48;

  // Header band (Ivory + Gold + Navy)
  doc.setFillColor(252, 251, 247);
  doc.rect(0, 0, pageWidth, 86, 'F');
  doc.setDrawColor(197, 147, 38);
  doc.setLineWidth(1.5);
  doc.line(36, 82, pageWidth - 36, 82);

  doc.setTextColor(13, 27, 62);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('GOO ASTROLOGY UNLIMITED FREE', 40, y);

  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(154, 109, 18);
  doc.text(options.title, 40, y);

  y += 28;
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(10);
  doc.text(options.subtitle, 40, y);
  y += 18;

  for (const line of options.metadataLines) {
    if (y > 770) {
      doc.addPage();
      y = 48;
    }
    doc.text(line, 40, y, { maxWidth: pageWidth - 80 });
    y += 14;
  }

  y += 10;
  for (const sec of options.sections) {
    if (y > 740) {
      doc.addPage();
      y = 48;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(13, 27, 62);
    doc.text(sec.heading, 40, y);
    y += 16;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    for (const row of sec.rows) {
      const wrapped = doc.splitTextToSize(row, pageWidth - 90) as string[];
      for (const wLine of wrapped) {
        if (y > 780) {
          doc.addPage();
          y = 48;
        }
        doc.text(`• ${wLine}`, 48, y);
        y += 13;
      }
    }
    y += 10;
  }

  doc.save(options.filename);
}

export function exportSvgElementToPng(svgElement: SVGSVGElement, filename: string, background = '#FCFBF7') {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const width = svgElement.viewBox.baseVal?.width || svgElement.clientWidth || 800;
    const height = svgElement.viewBox.baseVal?.height || svgElement.clientHeight || 800;
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = filename;
      a.click();
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
