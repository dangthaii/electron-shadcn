/**
 * Cấu hình dùng chung cho export & import.
 * Tôi code chán lắm rồi
 * Còn cái gì hay hơn không thì cứ sửa nhé.
 * Inject vào SL script dưới dạng `var unloadConfig = {...}`.
 * Bên trong SM code truy cập qua `unloadConfig.<key>`.
 *
 * Mỗi section gồm:
 *   - tableName: tên bảng trên SM
 *   - searchKey: trường dùng để tìm bản ghi (mặc định 'name')
 *   - files:     danh sách file/record cần xử lý
 */
export type UnloadSection = {
  tableName: string;
  searchKey: string;
  files: Array<{ name: string }>;
};

export type UnloadConfig = Record<string, UnloadSection>;

export const unloadConfig: UnloadConfig = {
  sl: {
    tableName: "ScriptLibrary",
    searchKey: "name",
    files: [{ name: "ESD_MS_KMS*" }]
  },
  // wizard: {
  //   tableName: "wizard",
  //   searchKey: "name",
  //   files: [{ name: "ESD MS KMS LIST" }]
  // },
  do: {
    tableName: "displayoption",
    searchKey: "id",
    files: [{ name: "esdMSkmsPackages.*" }]
  }
};

/**
 * Build SL script với các biến khai báo ở đầu file.
 *
 *   buildSL({ unloadConfig, data }, `print(data.length)`)
 *   // → 'var unloadConfig = {...};\nvar data = {...};\nprint(data.length)'
 */
export function buildSL(vars: Record<string, unknown>, slCode: string): string {
  const declarations = Object.entries(vars)
    .map(([name, value]) => {
      return `var ${name} = ${JSON.stringify(value)};`;
    })
    .join("\n");
  return `${declarations}\n${slCode}`;
}
