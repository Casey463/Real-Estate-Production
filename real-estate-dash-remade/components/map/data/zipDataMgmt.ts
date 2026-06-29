import { promises as fs } from "fs";
import path from "path";

export async function getJsonData() {
  const dataDir = path.join(
    process.cwd(),
    "components",
    "map",
    "data",
    "zipData"
  );

  try {
    await fs.access(dataDir);
    console.log("Data directory exists:", dataDir);
  } catch {
    console.error("Data directory does not exist:", dataDir);
    return {};
  }
  const files = await fs.readdir(dataDir);
  const jsonData: { [key: string]: unknown } = {};

  for (const file of files) {
    if (file.endsWith(".json")) {
      const filePath = path.join(dataDir, file);
      const fileContent = await fs.readFile(filePath, "utf8");
      jsonData[file.replace(".json", "")] = JSON.parse(fileContent);
    }
  }

  return jsonData;
}
