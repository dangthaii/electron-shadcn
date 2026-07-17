/**
 * Import flow:
 *   1. Đọc JSON đã export từ src/unload/data.json qua IPC
 *   2. Inject `unloadConfig` + `data` vào đầu SL code
 *   3. Gọi runSL() với combined script
 *   4. Trả về result từ SM
 */
import { runSL } from "@/axios";
import { ipc } from "@/ipc/manager";
import importSL from "@/unload/sm/import.js?raw";
import { buildSL, unloadConfig } from "@/unload/utils";

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
    const script = buildSL({ unloadConfig, data }, importSL);
    const { result } = await runSL(script);
    return { result, exists: true, path };
  } catch (error) {
    console.log("🚀 ~ runImport ~ error:", error);
    return { result: undefined, exists: true, path };
  }
}
