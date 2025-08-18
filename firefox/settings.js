// firefox/settings.js

document.addEventListener('DOMContentLoaded', function () {
  const themeToggle = document.getElementById('theme-toggle');
  const instancesContainer = document.getElementById('instances-container');
  const globalLinksContainer = document.getElementById('global-links-container');
  const addInstanceBtn = document.getElementById('add-instance');
  const addGlobalLinkBtn = document.getElementById('add-global-link');
  const settingsForm = document.getElementById('settings-form');

  const confirmationModal = document.getElementById('confirmation-modal');
  const confirmationMessage = document.getElementById('confirmation-message');
  const confirmYes = document.getElementById('confirm-yes');
  const confirmNo = document.getElementById('confirm-no');
  let confirmCallback = null;

  // Theme init
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.textContent = '🌞';
  } else {
    themeToggle.textContent = '🌙';
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
      localStorage.setItem('theme', 'light');
      themeToggle.textContent = '🌞';
    } else {
      localStorage.setItem('theme', 'dark');
      themeToggle.textContent = '🌙';
    }
  });

  function showConfirmDialog(message, callback) {
    confirmationMessage.textContent = message;
    confirmationModal.style.display = 'flex';
    confirmCallback = callback;
  }
  confirmYes.addEventListener('click', () => {
    confirmationModal.style.display = 'none';
    if (confirmCallback) confirmCallback(true);
    confirmCallback = null;
  });
  confirmNo.addEventListener('click', () => {
    confirmationModal.style.display = 'none';
    if (confirmCallback) confirmCallback(false);
    confirmCallback = null;
  });

  // Load from storage
  browser.storage.sync.get(['instances', 'globalMenuItems']).then((data) => {
    const instances = data.instances || [];
    let globalMenuItems = data.globalMenuItems;
    if (!Array.isArray(globalMenuItems)) {
      globalMenuItems = [
        { name: 'Bundles', path: '/system/console/bundles', showAuthor: true, showPublish: true },
        { name: 'CRXDE', path: '/crx/de', showAuthor: true, showPublish: true },
      ];
    }

    instances.forEach((inst, idx) => {
      addInstance(inst.name, inst.author, inst.publish, idx + 1);
    });
    globalMenuItems.forEach((item) => {
      addGlobalLinkEntry(item.name, item.path, item.showAuthor !== false, item.showPublish !== false);
    });

    enableCustomDnD(instancesContainer, '.instance-group');
    enableCustomDnD(globalLinksContainer, '.global-link-entry');
    document
      .querySelectorAll('.author-urls, .publish-urls')
      .forEach((ulContainer) => enableCustomDnD(ulContainer, '.url-entry'));
  });

  addInstanceBtn.addEventListener('click', () => {
    const index = document.querySelectorAll('.instance-group').length + 1;
    addInstance('', [{ url: 'http://localhost', port: '4502', default: true }], [{ url: 'http://localhost', port: '4503', default: true }], index);
    enableCustomDnD(instancesContainer, '.instance-group');
  });

  addGlobalLinkBtn.addEventListener('click', () => {
    addGlobalLinkEntry('', '', true, true);
    enableCustomDnD(globalLinksContainer, '.global-link-entry');
  });

  function addInstance(name = '', authorUrls = [], publishUrls = [], index) {
    const container = document.createElement('div');
    container.classList.add('instance-group');
    container.innerHTML = `
      <div class="instance-header">
        <span class="drag-handle">⣿</span>
        <span class="instance-title">${name ? name : 'New Instance'}</span>
        <button type="button" class="collapse-button"></button>
      </div>
      <div class="instance-body">
        <label>Instance Name:
          <input type="text" name="instance-name-${index}" value="${name}" required>
        </label>

        <h3>Author URLs</h3>
        <div class="author-urls"></div>
        <button type="button" class="fancy-button btn-secondary add-url-btn add-author-url">Add Author URL</button>

        <h3>Publish URLs</h3>
        <div class="publish-urls"></div>
        <button type="button" class="fancy-button btn-secondary add-url-btn add-publish-url">Add Publish URL</button>

        <button type="button" class="fancy-button btn-remove remove-instance">✕</button>
      </div>
    `;
    instancesContainer.appendChild(container);

    const header = container.querySelector('.instance-header');
    header.addEventListener('click', (e) => {
      if (e.target.closest('.drag-handle')) return;
      if (e.target.closest('.remove-instance')) return;
      container.classList.toggle('expanded');
    });

    const authorContainer = container.querySelector('.author-urls');
    const publishContainer = container.querySelector('.publish-urls');

    if (!authorUrls.length) authorUrls.push({ url: 'http://localhost', port: '4502', default: true });
    if (!publishUrls.length) publishUrls.push({ url: 'http://localhost', port: '4503', default: true });

    authorUrls.forEach((a) => addUrlEntry(authorContainer, a.url, a.port, a.default === true));
    publishUrls.forEach((p) => addUrlEntry(publishContainer, p.url, p.port, p.default === true));
    ensureDefaultRadio(authorContainer);
    ensureDefaultRadio(publishContainer);

    container.querySelector('.add-author-url').addEventListener('click', (e) => {
      e.stopPropagation();
      addUrlEntry(authorContainer, '', '', false);
      ensureDefaultRadio(authorContainer);
      enableCustomDnD(authorContainer, '.url-entry');
    });
    container.querySelector('.add-publish-url').addEventListener('click', (e) => {
      e.stopPropagation();
      addUrlEntry(publishContainer, '', '', false);
      ensureDefaultRadio(publishContainer);
      enableCustomDnD(publishContainer, '.url-entry');
    });

    const removeInstanceBtn = container.querySelector('.remove-instance');
    removeInstanceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showConfirmDialog('Are you sure you want to remove this instance?', (confirmed) => {
        if (confirmed) container.remove();
      });
    });
  }

  function addUrlEntry(container, urlVal, portVal, isDefault = false) {
    const div = document.createElement('div');
    div.classList.add('url-entry');
    div.innerHTML = `
      <span class="drag-handle-url">⋮</span>
      <input type="text" placeholder="http://example.com" value="${urlVal}">
      <input type="number" placeholder="Port" value="${portVal}">
      <button type="button" class="fancy-button btn-remove remove-url">✕</button>
    `;
    const removeUrlBtn = div.querySelector('.remove-url');
    removeUrlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showConfirmDialog('Are you sure you want to remove this URL?', (confirmed) => {
        if (confirmed) {
          div.remove();
          ensureDefaultRadio(container);
        }
      });
    });
    container.appendChild(div);
  }

  function ensureDefaultRadio(container) {
    const urlEntries = container.querySelectorAll('.url-entry');
    urlEntries.forEach((entry) => {
      const existingRadio = entry.querySelector('input[type="radio"]');
      if (existingRadio) existingRadio.remove();
    });
    if (urlEntries.length > 1) {
      urlEntries.forEach((entry, idx) => {
        const label = document.createElement('label');
        label.style.cssText = 'margin-left:10px; font-size:13px; color:#aaa;';
        label.textContent = 'Default ';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name =
          'defaultUrlGroup-' + container.closest('.instance-group').querySelector('input[name^="instance-name"]').name;
        if (idx === 0) radio.checked = true;
        label.appendChild(radio);
        entry.appendChild(label);
      });
    }
  }

  function addGlobalLinkEntry(nameVal, pathVal, showAuthor, showPublish) {
    const div = document.createElement('div');
    div.classList.add('global-link-entry');
    div.innerHTML = `
      <span class="drag-handle-global">⠿</span>
      <input type="text" placeholder="Link Name" value="${nameVal}" style="flex:1;margin-right:5px;">
      <input type="text" placeholder="/path" value="${pathVal}" style="flex:1;margin-right:5px;">
      <div class="visibility-checkboxes">
        <label>
          <input type="checkbox" class="author-check" ${showAuthor ? 'checked' : ''}>
          Author
        </label>
        <label>
          <input type="checkbox" class="publish-check" ${showPublish ? 'checked' : ''}>
          Publish
        </label>
      </div>
      <button type="button" class="fancy-button btn-remove remove-global-link">✕</button>
    `;
    const removeGlobalLinkBtn = div.querySelector('.remove-global-link');
    removeGlobalLinkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showConfirmDialog('Are you sure you want to remove this global menu item?', (confirmed) => {
        if (confirmed) div.remove();
      });
    });
    globalLinksContainer.appendChild(div);
  }

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const instances = [];
    let isValid = true;

    document.querySelectorAll('.instance-group').forEach((div) => {
      const nameInput = div.querySelector('input[name^="instance-name"]');
      const name = (nameInput.value || '').trim();
      if (!name) {
        alert('Instance name is required.');
        isValid = false;
        return;
      }

      const authorEntries = div.querySelectorAll('.author-urls .url-entry');
      const authorUrls = [];
      authorEntries.forEach((entry) => {
        let au = entry.querySelector('input[type="text"]').value.trim();
        if (au && !/^https?:\/\//i.test(au)) au = 'http://' + au;
        const ap = entry.querySelector('input[type="number"]').value.trim() || '';
        let df = false;
        const radio = entry.querySelector('input[type="radio"]');
        if (radio && radio.checked) df = true;
        else if (authorEntries.length === 1) df = true;
        if (au) authorUrls.push({ url: au, port: ap, default: df });
      });
      if (authorUrls.length === 0) {
        alert('At least one Author URL is required.');
        isValid = false;
        return;
      }

      const publishEntries = div.querySelectorAll('.publish-urls .url-entry');
      const publishUrls = [];
      publishEntries.forEach((entry) => {
        let pu = entry.querySelector('input[type="text"]').value.trim();
        if (pu && !/^https?:\/\//i.test(pu)) pu = 'http://' + pu;
        const pp = entry.querySelector('input[type="number"]').value.trim() || '';
        let df = false;
        const radio = entry.querySelector('input[type="radio"]');
        if (radio && radio.checked) df = true;
        else if (publishEntries.length === 1) df = true;
        if (pu) publishUrls.push({ url: pu, port: pp, default: df });
      });
      if (publishUrls.length === 0) {
        alert('At least one Publish URL is required.');
        isValid = false;
        return;
      }

      instances.push({ name, author: authorUrls, publish: publishUrls });
    });

    if (!isValid) return;

    const globalMenuItems = [];
    document.querySelectorAll('#global-links-container .global-link-entry').forEach((entry) => {
      const inputs = entry.querySelectorAll('input[type="text"]');
      const nameVal = inputs[0].value.trim();
      const pathVal = inputs[1].value.trim();
      const authorCheck = entry.querySelector('.author-check').checked;
      const publishCheck = entry.querySelector('.publish-check').checked;
      if (nameVal && pathVal) {
        globalMenuItems.push({ name: nameVal, path: pathVal, showAuthor: authorCheck, showPublish: publishCheck });
      }
    });

    browser.storage.sync.set({ instances, globalMenuItems }).then(() => {
      console.log('Settings saved');
      browser.runtime.sendMessage({ action: 'updateMenus' });
      const savePopup = document.getElementById('save-popup');
      savePopup.classList.add('show');
      setTimeout(() => {
        savePopup.classList.remove('show');
      }, 3000);
    });
  });

  function enableCustomDnD(container, itemSelector) {
    let draggedItem = null;
    let placeholder = null;
    let draggedClone = null;
    let offsetX = 0;
    let offsetY = 0;
    let startX = 0;
    let startY = 0;
    let startTarget = null;
    const dragThreshold = 5;
    let isDragging = false;

    container.addEventListener('mousedown', (e) => {
      const item = e.target.closest(itemSelector);
      if (!item) return;
      startX = e.clientX;
      startY = e.clientY;
      startTarget = e.target;
      draggedItem = item;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (!isDragging && dist > dragThreshold) {
        if (canDrag(draggedItem, startTarget)) {
          startDragging(e);
          e.preventDefault();
        }
      }
      if (isDragging) {
        e.preventDefault();
        draggedClone.style.left = e.clientX - offsetX + 'px';
        draggedClone.style.top = e.clientY - offsetY + 'px';
        const siblings = [...container.querySelectorAll(itemSelector)].filter((i) => i !== draggedItem && i !== placeholder);
        let insertBeforeEl = null;
        for (const s of siblings) {
          const box = s.getBoundingClientRect();
          if (e.clientY < box.top + box.height / 2) {
            insertBeforeEl = s;
            break;
          }
        }
        if (insertBeforeEl) container.insertBefore(placeholder, insertBeforeEl);
        else container.appendChild(placeholder);
      }
    }

    function onMouseUp(e) {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (isDragging) {
        if (placeholder && draggedItem) {
          placeholder.parentNode.insertBefore(draggedItem, placeholder);
          draggedItem.style.display = '';
          placeholder.remove();
        }
        if (draggedClone) draggedClone.remove();
        document.body.classList.remove('dragging');
        draggedItem = null;
        draggedClone = null;
        placeholder = null;
        isDragging = false;
      }
    }

    function canDrag(item, target) {
      if (item.classList.contains('instance-group')) {
        const isExpanded = item.classList.contains('expanded');
        const headerEl = item.querySelector('.instance-header');
        if (!headerEl) return false;
        if (isExpanded) {
          return target.matches('.drag-handle');
        } else {
          if (headerEl.contains(target)) {
            return !target.matches('.collapse-button');
          }
          return false;
        }
      }
      if (item.classList.contains('url-entry')) {
        return target.matches('.drag-handle-url');
      }
      if (item.classList.contains('global-link-entry')) {
        return target.matches('.drag-handle-global');
      }
      return false;
    }

    function startDragging(e) {
      isDragging = true;
      const rect = draggedItem.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      draggedClone = draggedItem.cloneNode(true);
      draggedClone.classList.add('dragged-clone');
      draggedClone.style.width = rect.width + 'px';
      draggedClone.style.height = rect.height + 'px';
      draggedClone.style.left = rect.left + 'px';
      draggedClone.style.top = rect.top + 'px';
      document.body.appendChild(draggedClone);
      placeholder = document.createElement('div');
      placeholder.style.width = rect.width + 'px';
      placeholder.style.height = rect.height + 'px';
      placeholder.style.margin = '10px';
      draggedItem.parentNode.insertBefore(placeholder, draggedItem);
      draggedItem.style.display = 'none';
      document.body.classList.add('dragging');
    }
  }
});
