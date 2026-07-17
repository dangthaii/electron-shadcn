// Duyệt từng section trong unloadConfig (inject từ src/unload/utils.ts),
// với mỗi record trong data[key] thì tạo mới hoặc update trên SM.
// Lưu ý: tên sẽ được thêm hậu tố "_test" để tránh ghi đè dữ liệu thật.
for (var key in unloadConfig) {
  var section = unloadConfig[key];
  var arr = data[key];
  if (!arr) continue;

  arr.forEach(function (item) {
    item.name = item.name + "_test";
    if (key == "do") {
      item.id = item.id + "_test";
    }
    var query = `${section.searchKey} = "${item.name}"`;
    var isFound = lib.ESD_Utils.isFound(section.tableName, query);

    if (!isFound) {
      lib.ESD_Utils.CreateTicket(section.tableName, item);
    } else {
      lib.ESD_Utils.updateFieldsOne(section.tableName, query, item);
    }
  });
}
