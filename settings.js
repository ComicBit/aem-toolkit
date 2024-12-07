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

    // Theme initialization
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

    // Show confirmation dialog
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

    // Load settings from storage
    chrome.storage.sync.get(['instances', 'globalMenuItems'], (data) => {
        const instances = data.instances || [];
        let globalMenuItems = data.globalMenuItems;
        if (!Array.isArray(globalMenuItems)) {
            globalMenuItems = [
                { name: "Bundles", path: "/system/console/bundles", showAuthor: true, showPublish: true },
                { name: "CRXDE", path: "/crx/de", showAuthor: true, showPublish: true }
            ];
        }

        // Load instances
        instances.forEach(inst => {
            addInstance(inst.name, inst.author, inst.publish);
        });

        // Load global menu items
        globalMenuItems.forEach(item => {
            addGlobalLinkEntry(item.name, item.path, item.showAuthor !== false, item.showPublish !== false);
        });

        makeSortableInstances();
        makeGlobalLinksSortable(globalLinksContainer);
    });

    addInstanceBtn.addEventListener('click', () => {
        addInstance();
        makeSortableInstances();
    });

    addGlobalLinkBtn.addEventListener('click', () => {
        addGlobalLinkEntry('', '', true, true);
        makeGlobalLinksSortable(globalLinksContainer);
    });

    function addInstance(name = '', authorUrls = [{ url: 'http://localhost', port: '4502' }], publishUrls = [{ url: 'http://localhost', port: '4503' }]) {
        const index = document.querySelectorAll('.instance-group').length + 1;

        const container = document.createElement('div');
        container.classList.add('instance-group');
        container.setAttribute('draggable', 'true');
        container.innerHTML = `
            <div class="instance-header">
                <span class="drag-handle">⣿</span>
                <span class="instance-title">${name ? name : 'New Instance'}</span>
                <button type="button" class="collapse-button">+</button>
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
        authorUrls.forEach(a => addUrlEntry(authorContainer, a.url, a.port));

        container.querySelector('.add-author-url').addEventListener('click', (e) => {
            e.stopPropagation();
            addUrlEntry(authorContainer, '', '');
        });

        const publishContainer = container.querySelector('.publish-urls');
        publishUrls.forEach(p => addUrlEntry(publishContainer, p.url, p.port));

        container.querySelector('.add-publish-url').addEventListener('click', (e) => {
            e.stopPropagation();
            addUrlEntry(publishContainer, '', '');
        });

        const removeInstanceBtn = container.querySelector('.remove-instance');
        removeInstanceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showConfirmDialog("Are you sure you want to remove this instance?", (confirmed) => {
                if (confirmed) container.remove();
            });
        });
    }

    function addUrlEntry(container, urlVal, portVal) {
        const div = document.createElement('div');
        div.classList.add('url-entry');
        div.innerHTML = `
            <input type="text" placeholder="http://example.com" value="${urlVal}">
            <input type="number" placeholder="Port" value="${portVal}">
            <button type="button" class="remove-url">✕</button>
        `;
        const removeUrlBtn = div.querySelector('.remove-url');
        removeUrlBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showConfirmDialog("Are you sure you want to remove this URL?", (confirmed) => {
                if (confirmed) div.remove();
            });
        });
        container.appendChild(div);
    }

    function addGlobalLinkEntry(nameVal, pathVal, showAuthor, showPublish) {
        const div = document.createElement('div');
        div.classList.add('global-link-entry');
        div.setAttribute('draggable', 'true');
        div.innerHTML = `
            <span class="drag-handle-global">⠿</span>
            <input type="text" placeholder="Link Name" value="${nameVal}">
            <input type="text" placeholder="/path" value="${pathVal}">
            <div class="visibility-checkboxes">
                <label>A <input type="checkbox" class="author-check" ${showAuthor ? 'checked' : ''}></label>
                <label>P <input type="checkbox" class="publish-check" ${showPublish ? 'checked' : ''}></label>
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

        document.querySelectorAll('.instance-group').forEach(div => {
            const nameInput = div.querySelector('input[name^="instance-name"]');
            const name = (nameInput.value || '').trim();
            if (!name) {
                alert('Instance name is required.');
                isValid = false;
                return;
            }

            const authorEntries = div.querySelectorAll('.author-urls .url-entry');
            const authorUrls = [];
            authorEntries.forEach(entry => {
                let authorUrl = entry.querySelector('input[type="text"]').value.trim();
                if (authorUrl && !/^https?:\/\//i.test(authorUrl)) {
                    authorUrl = 'http://' + authorUrl;
                }
                const authorPort = entry.querySelector('input[type="number"]').value.trim() || '';
                if (authorUrl) {
                    authorUrls.push({ url: authorUrl, port: authorPort });
                }
            });

            if (authorUrls.length === 0) {
                alert('At least one Author URL is required.');
                isValid = false;
                return;
            }

            const publishEntries = div.querySelectorAll('.publish-urls .url-entry');
            const publishUrls = [];
            publishEntries.forEach(entry => {
                let publishUrl = entry.querySelector('input[type="text"]').value.trim();
                if (publishUrl && !/^https?:\/\//i.test(publishUrl)) {
                    publishUrl = 'http://' + publishUrl;
                }
                const publishPort = entry.querySelector('input[type="number"]').value.trim() || '';
                if (publishUrl) {
                    publishUrls.push({ url: publishUrl, port: publishPort });
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
            // Hide after 3 seconds
            setTimeout(() => {
                savePopup.classList.remove('show');
                // Optional: add 'hide' class if needed for animation
            }, 3000);
        });
    });

    function makeSortableInstances() {
        const container = instancesContainer;
        let draggedItem = null;
        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('instance-group')) {
                draggedItem = e.target;
                e.dataTransfer.effectAllowed = 'move';
                draggedItem.classList.add('dragging');
            }
        });
        container.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }
        });
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY, '.instance-group:not(.dragging)');
            const dragging = container.querySelector('.instance-group.dragging');
            if (!dragging) return;
            if (afterElement == null) {
                container.appendChild(dragging);
            } else {
                container.insertBefore(dragging, afterElement);
            }
        });
    }

    function makeGlobalLinksSortable(container) {
        let draggedItem = null;
        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('global-link-entry')) {
                draggedItem = e.target;
                e.dataTransfer.effectAllowed = 'move';
                draggedItem.classList.add('dragging');
            }
        });

        container.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY, '.global-link-entry:not(.dragging)');
            const dragging = container.querySelector('.global-link-entry.dragging');
            if (!dragging) return;
            if (afterElement == null) {
                container.appendChild(dragging);
            } else {
                container.insertBefore(dragging, afterElement);
            }
        });
    }

    function getDragAfterElement(container, y, selector) {
        const draggableElements = [...container.querySelectorAll(selector)];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - (box.height / 2);
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Toggle instance-group expand on click (except on certain elements)
    document.addEventListener('click', (e) => {
        const instanceGroup = e.target.closest('.instance-group');
        if (instanceGroup && !e.target.matches(
            '.remove-instance, .remove-url, .remove-global-link, .add-url-btn, input, ' +
            '.author-check, .publish-check, .drag-handle, .drag-handle-global, .collapse-button'
        )) {
            instanceGroup.classList.toggle('expanded');
        }
    });
});