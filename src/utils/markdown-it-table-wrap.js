function slugify(s, md) {
  // Unicode-friendly
  var spaceRegex = new RegExp(md.utils.lib.ucmicro.Z.source, "g");
  return encodeURIComponent(s.replace(spaceRegex, ""));
}

function makeRule(md, options) {
  return function addHeadingAnchors(state) {
    var insertMap = new Map();

    if (!options.tableWrap) {
      return;
    }

    performance.mark("table1-start");

    for (var i = 0; i < state.tokens.length; i++) {
      if (state.tokens[i].type === "table_open") {
        var tableWrap = new state.Token("html_inline", "", 0);
        tableWrap.content = `<figure class="table_wrap">`;
        insertMap.set(i, {
          pre: true,
          val: tableWrap,
        });
      } else if (state.tokens[i].type === "table_close") {
        var tableWrapClose = new state.Token("html_inline", "", 0);
        tableWrapClose.content = `</figure>`;
        insertMap.set(i, {
          pre: false,
          val: tableWrapClose,
        });
      } else {
        continue;
      }
    }
    debugger;
    var arr = [];
    insertMap.forEach((val, idx) => {
      if (idx === 0) {
        arr.unshift(insertMap[idx]);
      } else if (idx === state.tokens.length) {
        arr.push(insertMap[idx]);
      } else {
        arr = state.tokens
          .slice(0, idx)
          .concat(insertMap[idx])
          .concat(arr.slice(idx));
      }
    });
    performance.mark("table1-end");
    performance.measure("table1", "table1-start", "table1-end");

    console.log("table1============" + performance.getEntriesByName("table1")[0].duration);
    state.tokens = arr;
  };
}

export default (md, opts) => {
  var defaults = {
    anchorClass: "markdown-it-table-wrap",
    tableWrap: true,
    slugify: slugify,
  };
  var options = md.utils.assign(defaults, opts);
  md.core.ruler.push("table_wrap", makeRule(md, options));
};
