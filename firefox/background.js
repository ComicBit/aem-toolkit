// firefox/background.js
// Firefox MV3 background service worker using browser.* APIs

function log(...args) {
  try { console.log('[AEM Toolkit][bg]', ...args); } catch (_) {}
}

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browser.storage.sync.set({
      globalMenuItems: [
        { name: 'Bundles', path: '/system/console/bundles', showAuthor: true, showPublish: true },
        { name: 'CRXDE', path: '/crx/de', showAuthor: true, showPublish: true },
      ],
      instances: [
        {
          name: 'Default Instance',
          author: [{ url: 'http://localhost', port: '4502' }],
          publish: [{ url: 'http://localhost', port: '4503' }],
        },
      ],
      openNewTab: false,
      enableAuthorButton: true,
      enableViewAsPublishedButton: true,
      enablePublishButton: true,
      enableEditButton: true,
    }).then(() => {
      log('Default settings have been set.');
    });
  }
  initializeContextMenus();
});

browser.runtime.onMessage.addListener((message, sender) => {
  if (message && message.action === 'updateMenus') {
    initializeContextMenus();
  }
});

browser.menus.onClicked.addListener((info, tab) => {
  try {
    const parts = String(info.menuItemId).split('-');
    if (parts.length < 4) return;

    const index = parseInt(parts[1], 10);
    const type = parts[2]; // 'author' or 'publish'
    const linkIndex = parseInt(parts[3], 10);

    browser.storage.sync.get(['instances', 'globalMenuItems']).then((data) => {
      const instance = data.instances && data.instances[index];
      const globalMenuItems = data.globalMenuItems;
      if (!instance || !globalMenuItems || globalMenuItems.length <= linkIndex) return;

      const mainURLArr = type === 'author' ? instance.author : instance.publish;
      if (!mainURLArr || mainURLArr.length === 0) return;

      const link = globalMenuItems[linkIndex];
      if ((type === 'author' && !link.showAuthor) || (type === 'publish' && !link.showPublish)) return;

      const mainURL = mainURLArr[0];
      const base = `${mainURL.url}${mainURL.port ? ':' + mainURL.port : ''}`;
      const finalUrl = base + link.path;

      browser.tabs.create({ url: finalUrl }).then(() => log(`Opened URL: ${finalUrl}`));
    });
  } catch (e) {
    log('Error handling menu click', e);
  }
});

function initializeContextMenus() {
  // Clear and rebuild menus
  browser.menus.removeAll().then(() => {
    return browser.storage.sync.get(['instances', 'globalMenuItems']);
  }).then((data) => {
    const instances = data.instances || [];
    const globalMenuItems = data.globalMenuItems || [];

    instances.forEach((instance, index) => {
      if (!instance.name || instance.name.trim() === '') return;
      const instanceId = `instance-${index}`;

      // Parent menu for the instance
      browser.menus.create({
        id: instanceId,
        title: instance.name,
        contexts: ['all'],
      });

      const authorItems = globalMenuItems.map((item, i) => ({ ...item, i })).filter((item) => item.showAuthor);
      const publishItems = globalMenuItems.map((item, i) => ({ ...item, i })).filter((item) => item.showPublish);

      let addedAuthor = false;
      if (authorItems.length > 0) {
        browser.menus.create({
          id: `${instanceId}-author-label`,
          title: 'Author:',
          parentId: instanceId,
          enabled: false,
          contexts: ['all'],
        });
        authorItems.forEach((item) => {
          browser.menus.create({
            id: `instance-${index}-author-${item.i}`,
            title: item.name,
            parentId: instanceId,
            contexts: ['all'],
          });
        });
        addedAuthor = true;
      }

      if (publishItems.length > 0) {
        if (addedAuthor) {
          browser.menus.create({
            id: `${instanceId}-sep-author-publish`,
            parentId: instanceId,
            type: 'separator',
            contexts: ['all'],
          });
        }
        browser.menus.create({
          id: `${instanceId}-publish-label`,
          title: 'Publish:',
          parentId: instanceId,
          enabled: false,
          contexts: ['all'],
        });
        publishItems.forEach((item) => {
          browser.menus.create({
            id: `instance-${index}-publish-${item.i}`,
            title: item.name,
            parentId: instanceId,
            contexts: ['all'],
          });
        });
      }
    });
  }).catch((e) => log('initializeContextMenus error', e));
}
