const PDFDocument = require("pdfkit");

const generateCV = profile => {
  // Create a document
  const doc = new PDFDocument();

  doc.fontSize(25).text(profile.name, 100, 100);
  doc.fontSize(10).text(profile.surname, 100, 150);
  return doc;
};

module.exports = { generateCV };
