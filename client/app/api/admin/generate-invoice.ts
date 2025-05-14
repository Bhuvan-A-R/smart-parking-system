import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { paymentId } = req.query;

  if (!paymentId) {
    return res.status(400).json({ error: "Payment ID is required" });
  }

  try {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    // Collect PDF data into buffers
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${paymentId}.pdf`
      );
      res.send(pdfData);
    });

    // Add content to the PDF
    doc.fontSize(20).text("Parking Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: ${paymentId}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.text(`Amount Paid: ₹500`); // Replace with actual data
    doc.text(`Payment Method: UPI`); // Replace with actual data
    doc.end();
  } catch (err) {
    console.error("Error generating invoice:", err);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
}