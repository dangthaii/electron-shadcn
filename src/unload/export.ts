/**
 * Export flow:
 *   1. Đọc code SL thô từ src/unload/sm/export.js (Vite ?raw)
 *   2. Gọi runSL() để lấy data từ Service Manager
 *   3. Ghi data vào file userData/unload/data.json qua IPC
 */
import { runSL } from "@/axios";
import { ipc } from "@/ipc/manager";
import exportSL from "@/unload/sm/export.js?raw";

const exportFiles = {
  sl: [
    {
      name: "ESD_master"
    }
  ],
  wizard: [
    {
      name: "ESD MS KMS LIST"
    }
  ],
  do: [
    {
      name: "esdMSkmsPackages.view_add_lot"
    }
  ]
};

export async function runExport(): Promise<{ path: string; result: unknown }> {
  try {
    const { result } = await runSL(`
var exportFiles = ${JSON.stringify(exportFiles)};
${exportSL}
`);
    const { path } = await ipc.client.unload.writeUnloadData({ data: result });
    return { path, result };
  } catch (error) {
    console.log("🚀 ~ runExport ~ error:", error);
  }
}
