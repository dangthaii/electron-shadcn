import { promises as fs } from "node:fs";
import path from "node:path";
import { app } from "electron";
import { os } from "@orpc/server";
import { z } from "zod";

// data.json sống ở thư mục userData của app (writable cả dev lẫn production).
// Trên Windows: %APPDATA%\electron-shadcn\unload\data.json
// Best practice từ Electron docs: luôn tạo subfolder để tránh trùng với
// Cache / GPUCache / Local Storage của Chromium.
function unloadDir() {
  return path.join(app.getPath("userData"), "unload");
}

function dataPath() {
  return path.join(unloadDir(), "data.json");
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
    flush: true, // fsync → bắt kernel flush buffers xuống đĩa
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
    // Node docs: tránh exists() trước khi readFile — race condition.
    // Cứ đọc và xử lý ENOENT.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { data: null, path: target, exists: false };
    }
    throw error;
  }
});
