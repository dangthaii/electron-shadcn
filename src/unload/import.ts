/**
 * Import flow (đơn giản):
 *   1. Đọc file userData/unload/data.json qua IPC
 *   2. Parse sẵn ở main process, trả về data dạng JS
 *   3. UI in ra màn hình
 */
import { ipc } from "@/ipc/manager";

export async function runImport(): Promise<{
  data: unknown;
  path: string;
  exists: boolean;
}> {
  return ipc.client.unload.readUnloadData();
}
