/**
 * Export flow:
 *   1. Inject `unloadConfig` (từ @/utils/unload) vào SL code
 *   2. Gọi runSL() để lấy data từ Service Manager
 *   3. Ghi data vào src/unload/data.json qua IPC
 */
import { runSL } from "@/axios";
import { ipc } from "@/ipc/manager";
import exportSL from "@/unload/sm/export.js?raw";
import { buildSL, unloadConfig } from "@/unload/utils";

export async function runExport(): Promise<{ path: string; result: unknown }> {
  try {
    const script = buildSL({ unloadConfig }, exportSL);
    const { result } = await runSL(script);
    const { path } = await ipc.client.unload.writeUnloadData({ data: result });
    return { path, result };
  } catch (error) {
    console.log("🚀 ~ runExport ~ error:", error);
    return { result: undefined, path: "" };
  }
}
