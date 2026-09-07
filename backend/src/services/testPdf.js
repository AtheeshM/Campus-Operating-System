const { extractPdfText } = require("./pdfService");

const pdfPath = "D:/ATHEESH/Regulationns/R_2025.srit.pdf";

const testPdf = async () => {
  try {
    const result = await extractPdfText(pdfPath);

    console.log("PDF extracted successfully");
    console.log("Pages:", result.pages);
    console.log("Characters:", result.text.length);

    console.log("\n--- FIRST 2000 CHARACTERS ---\n");
    console.log(result.text.substring(0, 2000));
  } catch (error) {
    console.error("PDF extraction failed:", error.message);
  }
};

testPdf();