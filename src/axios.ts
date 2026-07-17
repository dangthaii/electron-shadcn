import axios, { type AxiosInstance } from "axios";

const baseURL = "http://10.0.62.10:13081/SM/9/rest";
const username = "csep.admin.01";
const password = "Hpt@123456";

// Dùng btoa() thay cho Buffer (renderer không có Buffer global khi chạy qua Vite).
// OK vì username/password là ASCII thuần.
const credentials = btoa(`${username}:${password}`);

export const axiosClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${credentials}`,
  },
});

export async function runSL(
  script: string
): Promise<{ result: any; messages: string[] }> {
  try {
    const payload = {
      ticket: {
        name: "test",
        queryString: JSON.stringify(script),
      },
    };

    const { data } = await axiosClient.post<any>(
      `esdDBquerytool_dxms/query/action/execute`,
      payload
    );
    // console.log("🚀 ~ runSL ~ data:", data);

    // Gom Messages (plain strings theo server SM trả về) ra để caller sử dụng
    const messages: string[] = Array.isArray(data?.Messages)
      ? (data.Messages as string[])
      : [];

    messages.forEach((message: any) => {
      console.log(message);
    });

    const result = JSON.parse(data?.ticket?.queryReturn) || {};
    return { result, messages };
  } catch (error) {
    console.error("Error running SL:", error);
    return { result: undefined, messages: [] };
  }
}