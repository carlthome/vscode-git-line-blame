export function parseGitBlamePorcelain(blame: string): {
  [key: string]: string;
} {
  const lines = blame.trim().split("\n");
  lines[0] = `commit ${lines[0]}`;
  lines[lines.length - 1] = `line ${lines[lines.length - 1]}`;
  const fields = Object.fromEntries(
    lines.map((line: string) => {
      const words = line.split(" ");
      const key = words[0];
      const value = words.slice(1).join(" ");
      return [key, value];
    })
  );
  return fields;
}

export function relativeTimePassed(now: number, past: number): string {
  const msMinutes = 60 * 1000;
  const msHours = msMinutes * 60;
  const msDays = msHours * 24;
  const msMonths = msDays * 30;
  const msYears = msDays * 365;

  const elapsed = now - past;

  let value = 0;
  let unit = "";
  if (elapsed < msMinutes) {
    value = Math.round(elapsed / 1000);
    unit = "second";
  } else if (elapsed < msHours) {
    value = Math.round(elapsed / msMinutes);
    unit = "minute";
  } else if (elapsed < msDays) {
    value = Math.round(elapsed / msHours);
    unit = "hour";
  } else if (elapsed < msMonths) {
    value = Math.round(elapsed / msDays);
    unit = "day";
  } else if (elapsed < msYears) {
    value = Math.round(elapsed / msMonths);
    unit = "month";
  } else {
    value = Math.round(elapsed / msYears);
    unit = "year";
  }
  const plural = value > 1 ? "s" : "";
  return `${value} ${unit}${plural} ago`;
}

export function formatMessage(fields: Record<string, string>): string {
  const elapsed = relativeTimePassed(
    Date.now(),
    parseInt(fields["author-time"]) * 1000
  );
  const isUncommitted = fields["author"] === "Not Committed Yet";
  const message = isUncommitted
    ? "Not committed yet"
    : `${fields.author}, ${elapsed} • ${fields.summary}`;
  return message;
}

export function formatHoverMessage(fields: Record<string, string>): string {
  const message = Object.entries(fields)
    .map((entry) => `- **${entry[0]}**: \`${entry[1]}\``)
    .join("\n");
  return message;
}
