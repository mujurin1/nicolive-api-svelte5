// /** 拡張機能のインストール/更新後１回だけ実行する */
// chrome.runtime.onInstalled.addListener(() => {
//   /** アイコンクリック時のメニュー追加 */
//   chrome.contextMenus.create({
//     title: "Open LiveChat Hub",
//     id: "main-page",
//     contexts: ["action"],
//   });
//
//   // MEMO: 入れ子になったメニュー
//   // const extra = chrome.contextMenus.create({
//   //   title: "Extra Options",
//   //   id: "extra",
//   //   contexts: ["action"]
//   // });
//   // chrome.contextMenus.create({
//   //   title: "Extra Option 1",
//   //   type: "checkbox",
//   //   id: "remove-x-frame",
//   //   contexts: ["action"],
//   //   checked: prefs["remove-x-frame"],
//   //   parentId: extra
//   // });
// });

chrome.action.onClicked.addListener(() => {
  void chrome.tabs.create({
    url: "./index.html",
  });
});

// /** コンテキストメニュークリック時イベント */
// chrome.contextMenus.onClicked.addListener(({ menuItemId }) => {
//   if (menuItemId === "main-page") {
//     void chrome.tabs.create({
//       url: "./index.html",
//     });
//   }
// });
