chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');

  // Create parent context menu items
  chrome.contextMenus.create({
    id: "author",
    title: "Author",
    contexts: ["all"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error(`Error creating 'Author' menu: ${chrome.runtime.lastError}`);
    } else {
      console.log("'Author' menu created successfully");
    }
  });

  chrome.contextMenus.create({
    id: "publish",
    title: "Publish",
    contexts: ["all"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error(`Error creating 'Publish' menu: ${chrome.runtime.lastError}`);
    } else {
      console.log("'Publish' menu created successfully");
    }
  });

  // Create child context menu items for Author
  chrome.contextMenus.create({
    id: "authorCrxde",
    parentId: "author",
    title: "CRXDE",
    contexts: ["all"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error(`Error creating 'Author CRXDE' menu: ${chrome.runtime.lastError}`);
    } else {
      console.log("'Author CRXDE' menu created successfully");
    }
  });

  chrome.contextMenus.create({
    id: "authorBundles",
    parentId: "author",
    title: "Bundles",
    contexts: ["all"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error(`Error creating 'Author Bundles' menu: ${chrome.runtime.lastError}`);
    } else {
      console.log("'Author Bundles' menu created successfully");
    }
  });

  // Create child context menu items for Publish
  chrome.contextMenus.create({
    id: "publishCrxde",
    parentId: "publish",
    title: "CRXDE",
    contexts: ["all"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error(`Error creating 'Publish CRXDE' menu: ${chrome.runtime.lastError}`);
    } else {
      console.log("'Publish CRXDE' menu created successfully");
    }
  });

  chrome.contextMenus.create({
    id: "publishBundles",
    parentId: "publish",
    title: "Bundles",
    contexts: ["all"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error(`Error creating 'Publish Bundles' menu: ${chrome.runtime.lastError}`);
    } else {
      console.log("'Publish Bundles' menu created successfully");
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const authorCrxdeUrl = "http://localhost:4502/crx/de/index.jsp";
  const authorBundlesUrl = "http://localhost:4502/system/console/bundles";
  const publishCrxdeUrl = "http://localhost:4503/crx/de/index.jsp";
  const publishBundlesUrl = "http://localhost:4503/system/console/bundles";

  if (info.menuItemId === "authorCrxde") {
    chrome.tabs.create({ url: authorCrxdeUrl });
  } else if (info.menuItemId === "authorBundles") {
    chrome.tabs.create({ url: authorBundlesUrl });
  } else if (info.menuItemId === "publishCrxde") {
    chrome.tabs.create({ url: publishCrxdeUrl });
  } else if (info.menuItemId === "publishBundles") {
    chrome.tabs.create({ url: publishBundlesUrl });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'log') {
    console.log(sender.tab.url, message);
  }
});