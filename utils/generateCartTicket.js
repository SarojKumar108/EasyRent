const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateCartTicket(cart, email) {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, "../tickets");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const file = path.join(dir, `cart-ticket-${Date.now()}.pdf`);
    const doc  = new PDFDocument({ margin: 50 });
    const out  = fs.createWriteStream(file);
    doc.pipe(out);

    // ─── Header ───────────────────────────
    doc.fontSize(26).fillColor("#333366")
       .text("EasyRent – Cart Booking Receipt", { align: "center", underline: true });
    doc.moveDown(1);

    // ─── Table header ─────────────────────
    doc.fontSize(14).fillColor("black").text("Items:", { underline: true });
    doc.moveDown(0.5);

    let total = 0;
    cart.forEach((item, i) => {
      total += Number(item.price);
      doc.text(`${i + 1}. ${item.title} – ₹${item.price}  (${item.location})`);
    });

    doc.moveDown(1);
    doc.font("Helvetica-Bold").text(`Total: ₹${total}`, { align: "right" });
    doc.moveDown(2);

    doc.fontSize(12).fillColor("gray")
       .text(`Booked by: ${email}`)
       .text(`Date: ${new Date().toLocaleString()}`, { align: "left" });

    doc.end();

    out.on("finish", () => resolve(file));
    out.on("error", reject);
  });
}

module.exports = generateCartTicket;
