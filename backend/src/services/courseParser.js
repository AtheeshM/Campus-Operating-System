const COURSE_CODE_PATTERN = /^\d{2}[A-Z]{2,5}\d{3}$/;

const HEADER_PATTERN = /\bL\s+T\s+P\s+C\b/i;

const isCourseCode = (value) => {
  return COURSE_CODE_PATTERN.test(value.trim().toUpperCase());
};

const cleanCourseName = (value) => {
  return value
    .replace(/\bL\s+T\s+P\s+C\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

const parseLTPCCredits = (value) => {
  const match = value.match(
    /^\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*$/
  );

  if (!match) {
    return null;
  }

  return {
    lectureHours: Number(match[1]),
    tutorialHours: Number(match[2]),
    practicalHours: Number(match[3]),
    credits: Number(match[4]),
  };
};

/*
 * The R2025 PDF contains:
 *
 * 1. Course catalogue
 * 2. Detailed syllabus/course descriptions
 *
 * The same course code can therefore appear more than once.
 *
 * We only want the catalogue occurrence.
 */
const parseCourseCatalogue = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\r/g, "").trim())
    .filter(Boolean);

  const courses = [];
  const seenCodes = new Set();

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    const firstMatch = currentLine.match(
      /^(\d{2}[A-Z]{2,5}\d{3})\s+(.+)$/
    );

    if (!firstMatch) {
      continue;
    }

    const code = firstMatch[1].toUpperCase();

    if (!isCourseCode(code)) {
      continue;
    }

    /*
     * Ignore old regulation course codes.
     *
     * The uploaded regulation is R2025.
     */
    if (!code.startsWith("25")) {
      continue;
    }

    /*
     * If this course was already found in the catalogue,
     * don't add another occurrence from the detailed syllabus.
     */
    if (seenCodes.has(code)) {
      continue;
    }

    let nameParts = [];

    let firstNamePart = cleanCourseName(firstMatch[2]);

    if (firstNamePart && !HEADER_PATTERN.test(firstNamePart)) {
      nameParts.push(firstNamePart);
    }

    let ltpCredits = null;

    /*
     * The catalogue may contain:
     *
     * 25EE271 Electric Circuits &
     * Electron Devices
     * Laboratory
     * 0 0 2 1
     *
     * Therefore inspect the following lines until
     * we find the L/T/P/C values.
     */
    for (
      let j = i + 1;
      j <= Math.min(i + 8, lines.length - 1);
      j++
    ) {
      const line = lines[j];

      /*
       * Stop if another course begins.
       */
      const nextCourseMatch = line.match(
        /^(\d{2}[A-Z]{2,5}\d{3})\s+(.+)$/
      );

      if (nextCourseMatch) {
        break;
      }

      /*
       * Ignore the L T P C header.
       */
      if (HEADER_PATTERN.test(line)) {
        continue;
      }

      /*
       * Detect L/T/P/C values.
       */
      const parsed = parseLTPCCredits(line);

      if (parsed) {
        ltpCredits = parsed;
        break;
      }

      /*
       * Avoid collecting catalogue metadata after
       * the course name.
       */
      if (
        line === "Humanities and Social Sciences including" ||
        line === "Management (HSSM)" ||
        line === "Liberal Arts (LA)" ||
        line === "Mandatory Course (MC)"
      ) {
        break;
      }

      /*
       * Collect multiline course names.
       */
      const cleaned = cleanCourseName(line);

      if (cleaned) {
        nameParts.push(cleaned);
      }
    }

    /*
     * A valid catalogue entry must have L/T/P/C data.
     *
     * This prevents detailed syllabus occurrences from
     * being accepted as catalogue records.
     */
    if (!ltpCredits) {
      continue;
    }

    const name = cleanCourseName(nameParts.join(" "));

    if (!name) {
      continue;
    }

    seenCodes.add(code);

    courses.push({
      code,
      name,

      lectureHours: ltpCredits.lectureHours,
      tutorialHours: ltpCredits.tutorialHours,
      practicalHours: ltpCredits.practicalHours,
      credits: ltpCredits.credits,
    });
  }

  return courses;
};

module.exports = {
  parseCourseCatalogue,
};