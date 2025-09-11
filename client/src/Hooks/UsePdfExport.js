// src/hooks/usePdfExport.js

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function usePdfExport({ charts, fileMeta }) {
  const exportPdf = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin;

    // Summary page
    doc.setFontSize(16);
    doc.text('File Summary', margin, y);
    y += 24;

    doc.setFontSize(12);
    [
      `File: ${fileMeta.fileName}`,
      `Uploaded: ${new Date(fileMeta.uploadDate).toLocaleString()}`,
      `Rows: ${fileMeta.rowCount}`,
      `Cols: ${fileMeta.colCount}`,
    ].forEach(line => {
      doc.text(line, margin, y);
      y += 18;
    });

    // Chart pages
    for (let i = 0; i < charts.length; i++) {
      const el = charts[i].current;
      if (!el) continue;

      doc.addPage();
      y = margin;

      doc.setFontSize(14);
      doc.text(`Chart ${i + 1}`, margin, y);
      y += 20;

      const canvas = await html2canvas(el, { scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdfW = doc.internal.pageSize.getWidth() - margin * 2;
      const { width, height } = doc.getImageProperties(img);
      const pdfH = (height * pdfW) / width;

      doc.addImage(img, 'PNG', margin, y, pdfW, pdfH);
    }

    doc.save(`${fileMeta.fileName}-report.pdf`);
  };

  return { exportPdf };
}