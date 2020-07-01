function slugify(s, md) {
  // Unicode-friendly
  var spaceRegex = new RegExp(md.utils.lib.ucmicro.Z.source, "g");
  return encodeURIComponent(s.replace(spaceRegex, ""));
}

function makeRule(md, options) {
  return function addHeadingAnchors(state) {
    if (!options.tableWrap) {
      return;
    }

    /*
     * 方法一:
     * 先将需要增加的节点添加到map中
     * map的键是idx:标识当前节点的索引
     * pre标识:标识新增的节点需要添添加在当前节点之前还是之后
     * 性能监控: 耗时平均0.179ms
     */
    var arr = [];
    performance.mark("handle-start");
    for (var i = 0; i < state.tokens.length; i++) {
      var curToken = state.tokens[i];
      if (curToken.type === "table_open") {
        var tableWrapStart = new state.Token("html_inline", "", 0);
        tableWrapStart.content = `<figure class="table_wrap">`;
        arr.push(tableWrapStart);
        arr.push(curToken);
      } else if (curToken.type === "table_close") {
        var tableWrapClose = new state.Token("html_inline", "", 0);
        tableWrapClose.content = `</figure>`;
        arr.push(curToken);
        arr.push(tableWrapClose);
      } else {
        arr.push(curToken);
      }
    }
    performance.mark("handle-end");
    performance.measure("handle", "handle-start", "handle-end");
    console.log("handle============" + performance.getEntriesByName("handle")[0].duration);
    state.tokens = arr;

    /*
     * 方法二:
     * 先将需要增加的节点添加到map中,再用slice拼起来
     * map的键是idx:标识当前节点的索引
     * pre标识:标识新增的节点需要添添加在当前节点之前还是之后
     * 性能监控: 耗时平均23.53ms,11.07ms
     */
    // var patchMap = new Map();
    // performance.mark("handle-start");
    // for (var i = 0; i < state.tokens.length; i++) {
    //   var curToken = state.tokens[i];
    //   if (curToken.type === "table_open") {
    //     var tableWrap = new state.Token("html_inline", "", 0);
    //     tableWrap.content = `<figure class="table_wrap">`;
    //     patchMap.set(i, {
    //       pre: true,
    //       val: tableWrap,
    //     });
    //   } else if (curToken.type === "table_close") {
    //     var tableWrapClose = new state.Token("html_inline", "", 0);
    //     tableWrapClose.content = `</figure>`;
    //     patchMap.set(i, {
    //       pre: false,
    //       val: tableWrapClose,
    //     });
    //   } else {
    //     continue;
    //   }
    // }
    // var arr = [];
    // var lastIdx = 0;
    // patchMap.forEach((item, idx) => {
    //   if (item.pre) {
    //     arr.push(...state.tokens.slice(lastIdx, idx));
    //   } else {
    //     arr.push(...state.tokens.slice(lastIdx, idx + 1));
    //   }
    //   arr.push(item.val);
    //   lastIdx = idx;
    // });
    // performance.mark("handle-end");
    // performance.measure("handle", "handle-start", "handle-end");
    // console.log("handle============" + performance.getEntriesByName("handle")[0].duration);
    // state.tokens = arr;
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
