export const parseDollarPrefixed = (price: string) => {
  const trimmed = price.trim();
  const withoutCommas = trimmed.replace(/,/g, "");
  const match = withoutCommas.match(/^\$(-?\d+(\.\d+)?)/);
  if (!match || isNaN(Number(match[1])))
    throw new Error(`Cannot parse dollar-prefixed price: '${price}'`);

  return Number(match[1]);
};

export const parseAge = (age: string) => {
  try {
    const trimmed = age.trim();

    if (trimmed === "Presale")
      return {
        number: 0,
        unit: "s",
      };

    if (trimmed === "Today")
      return {
        number: 24,
        unit: "h",
      };

    const number = Number(trimmed.match(/\d+/)![0]);
    const unit = trimmed.match(/\d+\s*(\w+)/)![1];
    return {
      number,
      unit,
    };
  } catch {
    throw new Error(`Cannot parse age: '${age}'`);
  }
};

export const sleep = async (ms: number) =>
  await new Promise((res) => setTimeout(res, ms));

export const generateTimestampedFilename = (ext = "txt") => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}-${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}-${now
    .getSeconds()
    .toString()
    .padStart(
      2,
      "0"
    )} ${now.getDate()}-${now.getMonth()}-${now.getFullYear()}.${ext}`;
};
