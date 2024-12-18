// settings.js
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

    chrome.storage.sync.get(['instances', 'globalMenuItems'], (data) => {
        const instances = data.instances || [];
        let globalMenuItems = data.globalMenuItems;
        if (!Array.isArray(globalMenuItems)) {
            globalMenuItems = [
                { name: "Bundles", path: "/system/console/bundles", showAuthor: true, showPublish: true },
                { name: "CRXDE", path: "/crx/de", showAuthor: true, showPublish: true }
            ];
        }

        instances.forEach((inst, idx) => {
            addInstance(inst.name, inst.author, inst.publish, idx+1);
        });

        globalMenuItems.forEach(item => {
            addGlobalLinkEntry(item.name, item.path, item.showAuthor !== false, item.showPublish !== false);
        });

        enableCustomDnD(instancesContainer, '.instance-group');
        enableCustomDnD(globalLinksContainer, '.global-link-entry');

        document.querySelectorAll('.author-urls, .publish-urls').forEach(ulContainer => {
            enableCustomDnD(ulContainer, '.url-entry');
        });
    });

    addInstanceBtn.addEventListener('click', () => {
        const index = document.querySelectorAll('.instance-group').length + 1;
        addInstance('', [{url:'http://localhost', port:'4502', default:true}], [{url:'http://localhost', port:'4503'}], index);
        enableCustomDnD(instancesContainer, '.instance-group');
    });

    addGlobalLinkBtn.addEventListener('click', () => {
        addGlobalLinkEntry('', '', true, true);
        enableCustomDnD(globalLinksContainer, '.global-link-entry');
    });

    function addInstance(name = '', authorUrls = [{ url: 'http://localhost', port: '4502', default:true }], publishUrls = [{ url: 'http://localhost', port: '4503' }], index) {
        const container = document.createElement('div');
        container.classList.add('instance-group');
        container.innerHTML = `
            <div class="instance-header">
                <span class="drag-handle">⣿</span>
                <span class="instance-title">${name ? name : 'New Instance'}</span>
                <button type="button" class="collapse-button"></button>
            </div>
            <div class="instance-body">
                <label>Instance Name: <input type="text" name="instance-name-${index}" value="${name}" required></label>
                <h3>Author URLs</h3>
                <div class="author-urls"></div>
                <button type="button" class="add-url-btn add-author-url">Add Author URL</button>

                <h3>Publish URLs</h3>
                <div class="publish-urls"></div>
                <button type="button" class="add-url-btn add-publish-url">Add Publish URL</button>

                <button type="button" class="remove-instance">Remove Instance</button>
            </div>
        `;
        instancesContainer.appendChild(container);

        const authorContainer = container.querySelector('.author-urls');
        const publishContainer = container.querySelector('.publish-urls');

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
            showConfirmDialog("Are you sure you want to remove this instance?", (confirmed) => {
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
            <button type="button" class="remove-url">✕</button>
        `;
        const removeUrlBtn = div.querySelector('.remove-url');
        removeUrlBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showConfirmDialog("Are you sure you want to remove this URL?", (confirmed) => {
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
        urlEntries.forEach(entry => {
            const existingRadio = entry.querySelector('input[type="radio"]');
            if (existingRadio) existingRadio.parentNode.remove();
        });

        if (urlEntries.length > 1) {
            urlEntries.forEach((entry, i) => {
                const label = document.createElement('label');
                label.style.cssText = "margin-left:10px; font-size:13px; color:#aaa;";
                label.textContent = "Default ";
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'defaultUrlGroup-' + container.closest('.instance-group').querySelector('input[name^="instance-name"]').name;
                if (i === 0) radio.checked = true;
                label.appendChild(radio);
                entry.insertBefore(label, entry.querySelector('.remove-url'));
            });
        }
    }

    function addGlobalLinkEntry(nameVal, pathVal, showAuthor, showPublish) {
        const div = document.createElement('div');
        div.classList.add('global-link-entry');
        div.innerHTML = `
            <span class="drag-handle-global">⠿</span>
            <input type="text" placeholder="Link Name" value="${nameVal}">
            <input type="text" placeholder="/path" value="${pathVal}">
            <div class="visibility-checkboxes">
                <label><input type="checkbox" class="author-check" ${showAuthor ? 'checked' : ''}>Author</label>
                <label><input type="checkbox" class="publish-check" ${showPublish ? 'checked' : ''}>Publish</label>
            </div>
            <button type="button" class="remove-global-link">✕</button>
        `;
        const removeGlobalLinkBtn = div.querySelector('.remove-global-link');
        removeGlobalLinkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showConfirmDialog("Are you sure you want to remove this global menu item?", (confirmed) => {
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
            authorEntries.forEach((entry, i) => {
                let authorUrl = entry.querySelector('input[type="text"]').value.trim();
                if (authorUrl && !/^https?:\/\//i.test(authorUrl)) {
                    authorUrl = 'http://' + authorUrl;
                }
                const authorPort = entry.querySelector('input[type="number"]').value.trim() || '';
                let isDefault = false;
                const defaultRadio = entry.querySelector('input[type="radio"]');
                if (defaultRadio && defaultRadio.checked) {
                    isDefault = true;
                } else if (authorEntries.length === 1) {
                    isDefault = true;
                }
                if (authorUrl) {
                    authorUrls.push({ url: authorUrl, port: authorPort, default: isDefault });
                }
            });

            if (authorUrls.length === 0) {
                alert('At least one Author URL is required.');
                isValid = false;
                return;
            }

            const publishEntries = div.querySelectorAll('.publish-urls .url-entry');
            const publishUrls = [];
            publishEntries.forEach((entry, i) => {
                let publishUrl = entry.querySelector('input[type="text"]').value.trim();
                if (publishUrl && !/^https?:\/\//i.test(publishUrl)) {
                    publishUrl = 'http://' + publishUrl;
                }
                const publishPort = entry.querySelector('input[type="number"]').value.trim() || '';
                let isDefault = false;
                const defaultRadio = entry.querySelector('input[type="radio"]');
                if (defaultRadio && defaultRadio.checked) {
                    isDefault = true;
                } else if (publishEntries.length === 1) {
                    isDefault = true;
                }
                if (publishUrl) {
                    publishUrls.push({ url: publishUrl, port: publishPort, default: isDefault });
                }
            });

            if (publishUrls.length === 0) {
                alert('At least one Publish URL is required.');
                isValid = false;
                return;
            }

            instances.push({
                name,
                author: authorUrls,
                publish: publishUrls
            });
        });

        if (!isValid) return;

        const globalMenuItems = [];
        document.querySelectorAll('#global-links-container .global-link-entry').forEach(entry => {
            const inputs = entry.querySelectorAll('input[type="text"]');
            const nameVal = inputs[0].value.trim();
            const pathVal = inputs[1].value.trim();

            const authorCheck = entry.querySelector('.author-check').checked;
            const publishCheck = entry.querySelector('.publish-check').checked;

            if (nameVal && pathVal) {
                globalMenuItems.push({ name: nameVal, path: pathVal, showAuthor: authorCheck, showPublish: publishCheck });
            }
        });

        chrome.storage.sync.set({ instances, globalMenuItems }, () => {
            console.log('Settings saved');
            chrome.runtime.sendMessage({ action: "updateMenus" });
            const savePopup = document.getElementById('save-popup');
            savePopup.classList.add('show');
            setTimeout(() => {
                savePopup.classList.remove('show');
            }, 3000);
        });
    });

    // Custom Drag and Drop with threshold and restricted toggle logic
    function enableCustomDnD(container, itemSelector) {
        let draggedItem = null;
        let placeholder = null;
        let draggedClone = null;
        let offsetX = 0;
        let offsetY = 0;
        let startX = 0;
        let startY = 0;
        let startTarget = null;
        const dragThreshold = 5; // pixels

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
            // Do not prevent default here to allow input focus
            
        });

        function onMouseMove(e) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (!isDragging && dist > dragThreshold) {
                // Check if we can drag
                if (canDrag(draggedItem, startTarget)) {
                    startDragging(e);
                    // Once we start dragging, we can prevent default to avoid text selection
                    e.preventDefault();
                }
            }

            if (isDragging) {
                draggedClone.style.left = (e.clientX - offsetX) + 'px';
                draggedClone.style.top = (e.clientY - offsetY) + 'px';

                const items = [...container.querySelectorAll(itemSelector)].filter(i => i !== draggedItem && i !== placeholder);
                let insertBeforeEl = null;
                for (const i of items) {
                    const box = i.getBoundingClientRect();
                    if (e.clientY < box.top + box.height / 2) {
                        insertBeforeEl = i;
                        break;
                    }
                }
                if (insertBeforeEl) {
                    container.insertBefore(placeholder, insertBeforeEl);
                } else {
                    container.appendChild(placeholder);
                }
            }
        }

        function canDrag(item, target) {
            // Determine if drag is allowed
            if (item.classList.contains('instance-group')) {
                // If collapsed, drag from anywhere in the instance-group
                // If expanded, only from .drag-handle
                if (item.classList.contains('expanded')) {
                    return target.matches('.drag-handle');
                } else {
                    // collapsed
                    return true;
                }
            } else if (item.classList.contains('url-entry')) {
                return target.matches('.drag-handle-url');
            } else if (item.classList.contains('global-link-entry')) {
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
        }

        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            if (isDragging) {
                // End drag
                if (placeholder && draggedItem) {
                    placeholder.parentNode.insertBefore(draggedItem, placeholder);
                    draggedItem.style.display = '';
                    placeholder.remove();
                }
                if (draggedClone) {
                    draggedClone.remove();
                }
                draggedItem = null;
                draggedClone = null;
                placeholder = null;
                isDragging = false;
            } else {
                // It was a click, not a drag
                // Only toggle if clicked inside .instance-header and not on input or button
                if (draggedItem && draggedItem.classList.contains('instance-group')) {
                    const header = draggedItem.querySelector('.instance-header');
                    // Check if startTarget is inside header
                    if (header && header.contains(startTarget)) {
                        // Check if startTarget is not an input or button
                        if (!startTarget.matches('input, button, .remove-instance, .add-url-btn, .remove-url, .remove-global-link')) {
                            // Toggle collapse
                            draggedItem.classList.toggle('expanded');
                        }
                    }
                }
                draggedItem = null;
            }
        }
    }
});
