"use client";

import React, { useState } from "react";
import type { PaidTransactionType } from "@data/types";
import { Constants } from "@utils/constants";
import { HashString } from "@utils/hash-string";

const toDataUrl = async (url: string): Promise<string> => {
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const Download = ({ data }: { data: PaidTransactionType }) => {
  const [busy, setBusy] = useState(false);

  const downloadReceipt = async () => {
    setBusy(true);
    try {
      // Load the PDF libraries only when needed; they are large.
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const [logo, watermark, seal] = await Promise.all([
        toDataUrl("/logo.png"),
        toDataUrl("/transparent_logo_3.png"),
        toDataUrl("/security-seal3.png"),
      ]);

      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a6", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.setProperties({ title: `SDACKC Receipt ${data.no}` });

      pdf.addImage(logo, "PNG", 10, 5, 70, 22, undefined, "FAST");
      pdf.setFontSize(9);
      pdf.setLineWidth(0.1);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(10, 27, 280, 27);

      pdf.setFont("helvetica", "bold");
      pdf.text(data.name, 13, 35);
      pdf.setFont("helvetica", "normal");
      pdf.text(HashString(data.email) || "", 13, 47);
      pdf.text(HashString(data.phone), 13, 60);

      pdf.setFont("helvetica", "bold");
      pdf.text("Receipt#        :", 150, 35);
      pdf.text("Payment Mode    :", 150, 47);
      pdf.text("Transaction Date:", 150, 60);
      pdf.text(String(data.no), 225, 35);
      pdf.text(String(data.paymentMode), 225, 47);
      pdf.text(new Date(data.createdAt).toLocaleDateString(), 225, 60);

      const font = { font: "helvetica", fontSize: 9 };
      autoTable(pdf, {
        head: [["S.No", "Item Name", "Amount (KES)"]],
        body: data.lines.map((line, i) => [String(i + 1), line.name, line.amount.toFixed(2)]),
        foot: [["", "Total (KES)", data.amount.toFixed(2)]],
        startY: 68,
        margin: { top: 10, left: 13, right: 13 },
        headStyles: { ...font, fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold", halign: "justify" },
        footStyles: { ...font, fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold", halign: "right" },
        bodyStyles: { ...font, cellPadding: { top: 1, right: 5, bottom: 1, left: 2 }, textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 156 }, 2: { cellWidth: 85, halign: "right" } },
      });

      const y = pageHeight - 50;
      pdf.setFont("helvetica", "normal");
      pdf.text("Thank You,", 13, y + 12);
      pdf.setFont("helvetica", "bold");
      pdf.text("For Queries/Concerns,", 13, y + 20);
      pdf.setFont("helvetica", "italic");
      pdf.text(`Phone: ${Constants.TREASURY_PHONE},`, 18, y + 28);
      pdf.text(`Email: ${Constants.TREASURY_EMAIL},`, 18, y + 36);
      pdf.setFont("helvetica", "bold");
      pdf.text("Karen Community SDA Church", 13, y + 44);

      pdf.addImage(watermark, "PNG", 0, 0, pageWidth, pageWidth, undefined, "FAST");
      pdf.addImage(seal, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
      pdf.line(10, 373, 280, 373);
      pdf.setFont("helvetica", "normal");
      pdf.text("Page 1 of 1", 238, pageHeight - 5);

      pdf.save(`SDACKC Receipt-${data.no}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="font-medium hover:underline disabled:opacity-50" onClick={downloadReceipt} disabled={busy}>
      {busy ? "Preparing…" : "Print Receipt"}
    </button>
  );
};

export default Download;
