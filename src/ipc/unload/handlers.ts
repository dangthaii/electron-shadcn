import { promises as fs } from "node:fs";
import path from "node:path";
import { app } from "electron";
import { os } from "@orpc/server";
import { z } from "zod";
import { inDevelopment } from "@/constants";

// data.json cùng folder với code SL cho dễ thấy khi dev.
// Dev:    <project>/src/unload/data.json   ← file này gitignore
// Prod:   <userData>/unload/data.json      ← tránh ghi vào asar
function dataPath() {
  if (inDevelopment) {
    return path.join(app.getAppPath(), "src", "unload", "data.json");
  }
  return path.join(app.getPath("userData"), "unload", "data.json");
}

/**
 * Atomic JSON write: ghi ra file .tmp, fsync, rồi rename sang đích.
 * Nếu app crash giữa chừng, file gốc vẫn nguyên vẹn.
 */
async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), {
    encoding: "utf-8",
    flush: true,
  });

  await fs.rename(tmp, filePath);
}

export const writeUnloadData = os
  .input(z.object({ data: z.unknown() }))
  .handler(async ({ input }) => {
    const target = dataPath();
    await writeJsonAtomic(target, input.data);
    return { path: target };
  });

export const readUnloadData = os.handler(async () => {
  const target = dataPath();
  try {
    const text = await fs.readFile(target, "utf-8");
    return { data: JSON.parse(text), path: target, exists: true };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { data: null, path: target, exists: false };
    }
    throw error;
  }
});
