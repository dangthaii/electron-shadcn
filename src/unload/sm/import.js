for (var key in data) {
  var arr = data[key];
  if (key === "sl") {
    arr.forEach((item) => {
      item.name = item.name + "_test";

      var query = `name = "${item.name}"`;
      var isFound = lib.ESD_Utils.isFound("ScriptLibrary", query);

      if (!isFound) {
        lib.ESD_Utils.CreateTicket("ScriptLibrary", item);
      } else {
        lib.ESD_Utils.updateFieldsOne("ScriptLibrary", query, item);
      }
    });
  }

  if (key === "wizard") {
    arr.forEach((item) => {
      item.name = item.name + "_test";

      var query = `name = "${item.name}"`;
      var isFound = lib.ESD_Utils.isFound("wizard", query);

      if (!isFound) {
        lib.ESD_Utils.CreateTicket("wizard", item);
      } else {
        lib.ESD_Utils.updateFieldsOne("wizard", query, item);
      }
    });
  }
}
