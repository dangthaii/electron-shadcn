apiResult = {};
for (var key in exportFiles) {
  var arr = exportFiles[key];
  if (key === "sl") {
    apiResult.sl = arr.map((item) => {
      var record = lib.ESD_Utils.getOneRecordFull(
        "ScriptLibrary",
        `name = "${item.name}"`,
        item.name
      );
      return record;
    });
  }
}

print("okela", JSON.stringify(apiResult));
