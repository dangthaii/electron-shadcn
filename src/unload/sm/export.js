apiResult = {};
for (var key in exportFiles) {
  var arr = exportFiles[key];
  if (key === "sl") {
    apiResult.sl = arr.map((item) => {
      var record = lib.ESD_Utils.getOneRecordFull(
        "ScriptLibrary",
        `name = "${item.name}"`
      );
      return record;
    });
  }

  if (key === "wizard") {
    apiResult.wizard = arr.map((item) => {
      var record = lib.ESD_Utils.getOneRecordFull("wizard", `name = "${item.name}"`);
      return record;
    });
  }

  if (key === "do") {
    apiResult.do = arr.map((item) => {
      var record = lib.ESD_Utils.getOneRecordFull("displayoption", `id = "${item.name}"`);
      return record;
    });
  }
}
