const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateTicket(listing, email) {
  return new Promise((resolve, reject) => {
    const dirPath = path.join(__dirname, "../tickets");
    const fileName = `ticket-${Date.now()}.pdf`;
    const filePath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    const doc = new PDFDocument({ margin: 50 });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // HEADER
    doc
      .fontSize(26)
      .fillColor("#333366")
      .text("EasyRent - Booking Confirmation", {
        align: "center",
        underline: true,
      });

    doc.moveDown(2);

    // Booking Info
    doc
      .fontSize(16)
      .fillColor("black")
      .text("🏠 Booking Details", { underline: true });

    doc.moveDown(0.5);
    doc
      .fontSize(14)
      .text(`• Listing Title: ${listing.title}`)
      .text(`• Location: ${listing.location}, ${listing.country}`)
      .text(`• Price: ₹${listing.price}`)
      .text(`• Booked By: ${email}`)
      .text(`• Date: ${new Date().toLocaleString()}`);

    doc.moveDown(2);

    // Footer
    doc
      .fontSize(12)
      .fillColor("gray")
      .text(
        "Thank you for booking with EasyRent. This ticket is generated automatically.",
        {
          align: "center",
        }
      );

    doc.end();

    writeStream.on("finish", () => resolve(filePath));
    writeStream.on("error", reject);
  });
}

module.exports = generateTicket;
