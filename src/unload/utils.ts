/**
 * Cấu hình dùng chung cho export & import.
 * Tôi code chán lắm rồi
 * Còn cái gì hay hơn không thì cứ sửa nhé.
 *
 * Hai biến inject vào SL:
 *   var unloadFiles  = { sl: [...], ... }    // data: danh sách file cần xử lý
 *   var unloadConfig = { sl: {tableName,...},... } // metadata: cách truy vấn
 *
 * Cùng share keys (sl / wizard / do) để SL code dễ pair.
 */

export type UnloadFileItems = Array<{ name: string }>;
export type UnloadFiles = Record<string, UnloadFileItems>;

export type UnloadSection = {
  tableName: string;
  searchKey: string;
};
export type UnloadConfig = Record<string, UnloadSection>;

export const unloadFiles: UnloadFiles = {
  sl: [{ name: "ESD_MS_KMS*" }],
  // wizard: [{ name: "ESD MS KMS LIST" }],
  do: [{ name: "esdMSkmsPackages.*" }]
};

export const unloadConfig: UnloadConfig = {
  sl: { tableName: "ScriptLibrary", searchKey: "name" },
  // wizard: { tableName: "wizard", searchKey: "name" },
  do: { tableName: "displayoption", searchKey: "id" }
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
