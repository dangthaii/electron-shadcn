/**
 * Import flow:
 *   1. Đọc JSON đã export từ src/unload/data.json qua IPC
 *   2. Nhúng JSON vào SL code dưới dạng `var data = ...`
 *   3. Gọi runSL() với combined script
 *   4. Trả về result từ SM
 *
 * Pattern giống export.ts: template-string interpolation của JSON
 * vào đầu SL script.
 */
import { runSL } from "@/axios";
import { ipc } from "@/ipc/manager";
import importSL from "@/unload/sm/import.js?raw";

export async function runImport(): Promise<{
  result: unknown;
  exists: boolean;
  path: string;
}> {
  const { data, exists, path } = await ipc.client.unload.readUnloadData();

  if (!exists || data === null) {
    return { result: null, exists: false, path };
  }

  try {
    const { result } = await runSL(`
var data = ${JSON.stringify(data)};
${importSL}
`);
    return { result, exists: true, path };
  } catch (error) {
    console.log("🚀 ~ runImport ~ error:", error);
    return { result: undefined, exists: true, path };
  }
}
