const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const extractPdfText = async (pdfPath) => {
  if (!fs.existsSync(pdfPath)) {
    throw new Error("PDF file not found");
  }

  const pdfBuffer = fs.readFileSync(pdfPath);

  const parser = new PDFParse({
    data: pdfBuffer,
  });

  try {
    const result = await parser.getText();

    return {
      text: result.text,
      pages: result.total,
    };
  } finally {
    await parser.destroy();
  }
};

module.exports = {
  extractPdfText,
};