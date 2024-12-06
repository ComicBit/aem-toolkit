// background.js
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.storage.sync.set({
            globalMenuItems: [
                { name: "Bundles", path: "/system/console/bundles", showAuthor: true, showPublish: true },
                { name: "CRXDE", path: "/crx/de", showAuthor: true, showPublish: true }
            ],
            instances: [{
                name: 'Default Instance',
                author: [{ url: 'http://localhost', port: '4502' }],
                publish: [{ url: 'http://localhost', port: '4503' }]
            }],
            openNewTab: false,
            enableAuthorButton: true,
            enableViewAsPublishedButton: true,
            enablePublishButton: true,
            enableEditButton: true
        }, () => {
            console.log('Default settings have been set.');
        });
    }
    initializeContextMenus();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateMenus") {
        initializeContextMenus();
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const parts = info.menuItemId.split('-');
    if (parts.length < 4) {
        return;
    }

    const index = parseInt(parts[1], 10);
    const type = parts[2]; // "author" or "publish"
    const linkIndex = parseInt(parts[3], 10);

    chrome.storage.sync.get(['instances', 'globalMenuItems'], function(data) {
        const instance = data.instances && data.instances[index];
        const globalMenuItems = data.globalMenuItems;

        if (!instance || !globalMenuItems || globalMenuItems.length <= linkIndex) return;

        const mainURLArr = (type === 'author') ? instance.author : instance.publish;
        if (!mainURLArr || mainURLArr.length === 0) return;

        const link = globalMenuItems[linkIndex];
        // If link visibility is off for that type, do nothing
        if ((type === 'author' && !link.showAuthor) || (type === 'publish' && !link.showPublish)) {
            return;
        }

        const mainURL = mainURLArr[0];
        const base = `${mainURL.url}${mainURL.port ? ':' + mainURL.port : ''}`;
        const finalUrl = base + link.path;

        chrome.tabs.create({ url: finalUrl }, () => {
            console.log(`Opened URL: ${finalUrl}`);
        });
    });
});

function initializeContextMenus() {
    chrome.contextMenus.removeAll(() => {
        chrome.storage.sync.get(['instances', 'globalMenuItems'], function(data) {
            const instances = data.instances || [];
            const globalMenuItems = data.globalMenuItems || [];

            instances.forEach((instance, index) => {
                if (instance.name && instance.name.trim() !== '') {
                    const instanceId = `instance-${index}`;
                    chrome.contextMenus.create({
                        id: instanceId,
                        title: instance.name,
                        contexts: ["all"]
                    });

                    const authorItems = globalMenuItems
                        .map((item, i) => ({...item, i}))
                        .filter(item => item.showAuthor);
                    
                    const publishItems = globalMenuItems
                        .map((item, i) => ({...item, i}))
                        .filter(item => item.showPublish);

                    let addedAuthor = false;
                    if (authorItems.length > 0) {
                        chrome.contextMenus.create({
                            id: `${instanceId}-author-label`,
                            title: 'Author:',
                            parentId: instanceId,
                            enabled: false,
                            contexts: ["all"]
                        });
                        authorItems.forEach(item => {
                            chrome.contextMenus.create({
                                id: `instance-${index}-author-${item.i}`,
                                title: item.name,
                                parentId: instanceId,
                                contexts: ["all"]
                            });
                        });
                        addedAuthor = true;
                    }

                    if (publishItems.length > 0) {
                        if (addedAuthor) {
                            chrome.contextMenus.create({
                                id: `${instanceId}-sep-author-publish`,
                                parentId: instanceId,
                                type: 'separator',
                                contexts: ["all"]
                            });
                        }
                        chrome.contextMenus.create({
                            id: `${instanceId}-publish-label`,
                            title: 'Publish:',
                            parentId: instanceId,
                            enabled: false,
                            contexts: ["all"]
                        });
                        publishItems.forEach(item => {
                            chrome.contextMenus.create({
                                id: `instance-${index}-publish-${item.i}`,
                                title: item.name,
                                parentId: instanceId,
                                contexts: ["all"]
                            });
                        });
                    }
                }
            });
        });
    });
}