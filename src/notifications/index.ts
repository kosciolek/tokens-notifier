import notifier from "node-notifier";
import open from "open";

export const notify = (
  type: "trending" | "latest",
  count: number,
  filePath: string
) => {
  notifier.notify({
    title: `Found ${count} ${type} tokens.`,
    message: "Click to view.",
    wait: true,
  });
  notifier.on("click", () => open(filePath));
};
