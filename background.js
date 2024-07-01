chrome.runtime.onInstalled.addListener(() => {
    initializeContextMenus();
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "updateMenus") {
        initializeContextMenus();
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const [type, name, action] = info.menuItemId.split('-');
    chrome.storage.sync.get([`${type}Instances`], function(data) {
        const instance = data[`${type}Instances`].find(inst => inst.name === name);
        if (instance) {
            let url;
            switch (action) {
                case 'bundles':
                    url = `${instance.url}:${instance.port}/system/console/bundles`;
                    break;
                case 'crx':
                    url = `${instance.url}:${instance.port}/crx/de`;
                    break;
            }
            if (url) {
                chrome.tabs.create({ url });
            }
        }
    });
});

function initializeContextMenus() {
    chrome.contextMenus.removeAll(() => {
        chrome.storage.sync.get(['authorInstances', 'publishInstances'], function(data) {
            (data.authorInstances || []).forEach(instance => {
                if (instance.name && instance.name.trim() !== '') {
                    chrome.contextMenus.create({
                        id: `author-${instance.name}`,
                        title: instance.name,
                        contexts: ["all"]
                    });
                    chrome.contextMenus.create({
                        id: `author-${instance.name}-bundles`,
                        title: 'Show Bundles',
                        parentId: `author-${instance.name}`,
                        contexts: ["all"]
                    });
                    chrome.contextMenus.create({
                        id: `author-${instance.name}-crx`,
                        title: 'Show CRX',
                        parentId: `author-${instance.name}`,
                        contexts: ["all"]
                    });
                }
            });
            (data.publishInstances || []).forEach(instance => {
                if (instance.name && instance.name.trim() !== '') {
                    chrome.contextMenus.create({
                        id: `publish-${instance.name}`,
                        title: instance.name,
                        contexts: ["all"]
                    });
                    chrome.contextMenus.create({
                        id: `publish-${instance.name}-bundles`,
                        title: 'Show Bundles',
                        parentId: `publish-${instance.name}`,
                        contexts: ["all"]
                    });
                    chrome.contextMenus.create({
                        id: `publish-${instance.name}-crx`,
                        title: 'Show CRX',
                        parentId: `publish-${instance.name}`,
                        contexts: ["all"]
                    });
                }
            });
        });
    });
}
