const { extractPdfText } = require("./pdfService");
const { parseCourseCatalogue } = require("./courseParser");

const pdfPath = "D:/ATHEESH/Regulationns/R_2025.srit.pdf";

const testCourseParser = async () => {
  try {
    const pdf = await extractPdfText(pdfPath);
    const searchCode = "25EE271";

const positions = [];
let searchIndex = 0;

while (true) {
  const foundIndex = pdf.text.indexOf(searchCode, searchIndex);

  if (foundIndex === -1) {
    break;
  }

  positions.push(foundIndex);
  searchIndex = foundIndex + searchCode.length;
}

console.log(`\n${searchCode} occurrences:`, positions.length);
console.log("Positions:", positions);

for (const position of positions) {
  console.log("\n--- CONTEXT ---\n");

  console.log(
    pdf.text.substring(
      Math.max(0, position - 500),
      Math.min(pdf.text.length, position + 1000)
    )
  );
}
    console.log("PDF extracted successfully");
    console.log("Pages:", pdf.pages);
    console.log("Characters:", pdf.text.length);

    const courses = parseCourseCatalogue(pdf.text);

    console.log("\nTotal detected courses:", courses.length);

    console.log("\n--- DETECTED COURSES ---\n");

    courses.forEach((course, index) => {
      console.log(
        `${index + 1}. ${course.code} - ${course.name} | ` +
        `L:${course.lectureHours} ` +
        `T:${course.tutorialHours} ` +
        `P:${course.practicalHours} ` +
        `C:${course.credits}`
      );
    });

    // --------------------------------------------------
    // RAW PDF INSPECTION FOR PROBLEMATIC COURSES
    // --------------------------------------------------

    console.log("\n--- PROBLEM COURSE RAW TEXT ---\n");

    const problemCodes = [
      "25EE271",
      "25HS252",
      "25HS253",
      "25ME202",
    ];

    const rawLines = pdf.text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    for (const code of problemCodes) {
      const index = rawLines.findIndex((line) =>
        line.startsWith(code)
      );

      console.log(`\n===== ${code} =====`);

      if (index === -1) {
        console.log("Not found");
        continue;
      }

      console.log(
        rawLines
          .slice(Math.max(0, index - 2), index + 8)
          .join("\n")
      );
    }
  } catch (error) {
    console.error("Course parsing failed:", error.message);
  }
};

testCourseParser();