// background.js
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.storage.sync.set({
            instances: [{
                name: 'Default Instance',
                author: { url: 'http://localhost', port: '4502' },
                publish: { url: 'http://localhost', port: '4503' }
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
    if (parts.length < 3) {
        // This is likely a parent menu item, so skip it
        console.warn(`Clicked a parent menu item with id: ${info.menuItemId}`);
        return;
    }

    const index = parts[1];
    const action = parts.slice(2).join('-'); // Handles actions with hyphens

    if (!['author-bundles', 'author-crx', 'publish-bundles', 'publish-crx'].includes(action)) {
        console.error(`Unknown or undefined action: ${action}`);
        return;
    }

    chrome.storage.sync.get(['instances'], function(data) {
        const instance = data.instances[index];
        if (instance) {
            let url;
            switch (action) {
                case 'author-bundles':
                    url = `${instance.author.url}${instance.author.port ? ':' + instance.author.port : ''}/system/console/bundles`;
                    break;
                case 'author-crx':
                    url = `${instance.author.url}${instance.author.port ? ':' + instance.author.port : ''}/crx/de`;
                    break;
                case 'publish-bundles':
                    url = `${instance.publish.url}${instance.publish.port ? ':' + instance.publish.port : ''}/system/console/bundles`;
                    break;
                case 'publish-crx':
                    url = `${instance.publish.url}${instance.publish.port ? ':' + instance.publish.port : ''}/crx/de`;
                    break;
                default:
                    console.error(`Unhandled action: ${action}`);
                    return;
            }
            if (url) {
                chrome.tabs.create({ url }, () => {
                    console.log(`Opened URL: ${url}`);
                });
            }
        } else {
            console.error(`Instance not found for index: ${index}`);
        }
    });
});

function initializeContextMenus() {
    chrome.contextMenus.removeAll(() => {
        chrome.storage.sync.get(['instances'], function(data) {
            (data.instances || []).forEach((instance, index) => {
                if (instance.name && instance.name.trim() !== '') {
                    // Parent menu (no action)
                    chrome.contextMenus.create({
                        id: `instance-${index}`,
                        title: instance.name,
                        contexts: ["all"]
                    });
                    // Submenu items with actions
                    chrome.contextMenus.create({
                        id: `instance-${index}-author-bundles`,
                        title: 'Author Bundles',
                        parentId: `instance-${index}`,
                        contexts: ["all"]
                    });
                    chrome.contextMenus.create({
                        id: `instance-${index}-author-crx`,
                        title: 'Author CRXDE',
                        parentId: `instance-${index}`,
                        contexts: ["all"]
                    });
                    chrome.contextMenus.create({
                        id: `instance-${index}-publish-bundles`,
                        title: 'Publish Bundles',
                        parentId: `instance-${index}`,
                        contexts: ["all"]
                    });
                    chrome.contextMenus.create({
                        id: `instance-${index}-publish-crx`,
                        title: 'Publish CRXDE',
                        parentId: `instance-${index}`,
                        contexts: ["all"]
                    });
                }
            });
        });
    });
}