export function extractTitleAndDescription(input) {
  let result = { name: "", description: "" };
  let lines = input.split("\n").map((line) => line.trim());

  // Pattern: "Name: XXXX\nDescription: DDDD"
  let nameRegex = /^Name:\s*(.*)/i;
  let descRegex = /^Description:\s*(.*)/i;

  // Check for explicit "Name:" and "Description:"
  if (
    lines.length >= 2 &&
    nameRegex.test(lines[0]) &&
    descRegex.test(lines[1])
  ) {
    result.name = lines[0].match(nameRegex)[1];
    result.description = lines[1].match(descRegex)[1];
  }
  // Pattern: "Name: XXXX\nDDDD"
  else if (lines.length >= 2 && nameRegex.test(lines[0])) {
    result.name = lines[0].match(nameRegex)[1];
    result.description = lines.slice(1).join(" ");
  }
  // Pattern: "XXXX\nDDDD"
  else if (lines.length >= 2) {
    result.name = lines[0];
    result.description = lines.slice(1).join(" ");
  }
  // Pattern: "XXXX"
  else if (lines.length === 1) {
    result.name = lines[0];
  }

  // Check if the last line can be formatted as a number
  let lastLine = lines[lines.length - 1];
  let lastLineAsNumber = parseInt(lastLine);
  if (!isNaN(lastLineAsNumber)) {
    result.amount = lastLineAsNumber;
    result.description = lines.slice(1, -1).join(" ");
  } else {
    result.amount = 1; // Default to 1 if the last line is not a valid number
  }

  return result;
}
