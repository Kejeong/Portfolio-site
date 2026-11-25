import fs from "fs";
import path from "path";

// public 폴더에 파일이 있는지 (예: "/resume.pdf")
export function hasPublicFile(url: string) {
  return fs.existsSync(path.join(process.cwd(), "public", url));
}
