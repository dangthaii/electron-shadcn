// Duyệt qua từng section trong unloadConfig (inject từ src/unload/utils.ts),
// lấy full record theo tableName + searchKey cho mỗi file.
apiResult = {};
for (var key in unloadConfig) {
  var data = [];
  var section = unloadConfig[key];
  unloadFiles[key].map(function (item) {
    var query = `${section.searchKey} LIKE "${item.name}"`;
    var result = lib.ESD_Utils.fetchDataFull(section.tableName, query);
    data = data.concat(result);
  });

  apiResult[key] = data;
}
