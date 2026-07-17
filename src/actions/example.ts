/**
 * Example action - tách riêng để dễ bảo trì và tái sử dụng.
 * Sử dụng runSL() từ @/axios để gọi Service Manager (SM).
 */
import { runSL } from "@/axios";

export async function runExampleAction(): Promise<string> {
  // Script SL cơ bản để test - thay bằng query thật của bạn
  const script = {
    script: 'print("Hello from SM")',
  };

  const { result, messages } = await runSL(script.script);

  console.log("🚀 ~ runExampleAction ~ result:", result);
  console.log("🚀 ~ runExampleAction ~ messages:", messages);

  return `Đã gọi SM xong. Xem DevTools console để xem kết quả.`;
}