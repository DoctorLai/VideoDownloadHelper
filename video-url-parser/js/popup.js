function onWindowLoad() {
  chrome.tabs.executeScript(null, {
    file: "js/jquery.js"
  }, function() {
    chrome.tabs.executeScript(null, {
      file: "js/getPagesSource.js"
    }, function() {

    })
  });
}
window.onload = onWindowLoad; 