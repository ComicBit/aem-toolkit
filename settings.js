document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('settings-form').addEventListener('submit', function(event) {
        event.preventDefault();
        saveSettings();
    });

    document.getElementById('add-author-instance').addEventListener('click', function () {
        addInstance(document.getElementById('author-instances'), 'author');
    });

    document.getElementById('add-publish-instance').addEventListener('click', function () {
        addInstance(document.getElementById('publish-instances'), 'publish');
    });

    loadSettings();
});

function addInstance(container, type, name = '', url = 'http://localhost', port = type === 'author' ? 4502 : 4503) {
    const index = container.children.length + 1; // Unique index for name fields
    const instanceDiv = document.createElement('div');
    instanceDiv.classList.add('instance');
    instanceDiv.innerHTML = `
        <label>Name: <input type="text" name="${type}-name-${index}" value="${name}" required></label>
        <label>URL: <input type="text" name="${type}-url-${index}" value="${url}"></label>
        <label>Port: <input type="number" name="${type}-port-${index}" value="${port}"></label>
        <button type="button" class="remove-instance">Remove</button>
    `;
    container.appendChild(instanceDiv);

    // Add event listener for the remove button
    instanceDiv.querySelector('.remove-instance').addEventListener('click', function() {
        removeInstance(instanceDiv);
    });
}

function removeInstance(instanceElement) {
    instanceElement.remove();
}

function saveSettings() {
    const authorInstances = [];
    const publishInstances = [];
    let isValid = true;

    document.querySelectorAll('#author-instances .instance').forEach(div => {
        const nameInput = div.querySelector('input[name^="author-name"]');
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
            alert('Author instance name is required.');
            isValid = false;
            return;
        }
        authorInstances.push({
            name: name,
            url: div.querySelector('input[name^="author-url"]').value,
            port: div.querySelector('input[name^="author-port"]').value
        });
    });

    if (!isValid) return;

    document.querySelectorAll('#publish-instances .instance').forEach(div => {
        const nameInput = div.querySelector('input[name^="publish-name"]');
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
            alert('Publish instance name is required.');
            isValid = false;
            return;
        }
        publishInstances.push({
            name: name,
            url: div.querySelector('input[name^="publish-url"]').value,
            port: div.querySelector('input[name^="publish-port"]').value
        });
    });

    if (!isValid) return;

    const openNewTab = document.getElementById('open-new-tab').checked;
    const enableAuthorButton = document.getElementById('enable-author-button').checked;
    const enableViewAsPublishedButton = document.getElementById('enable-view-as-published-button').checked;
    const enablePublishButton = document.getElementById('enable-publish-button').checked;

    chrome.storage.sync.set({
        authorInstances,
        publishInstances,
        openNewTab,
        enableAuthorButton,
        enableViewAsPublishedButton,
        enablePublishButton
    }, () => {
        console.log('Settings saved');
        chrome.runtime.sendMessage({ action: "updateMenus" }); // Send a message to background.js to update the menus
        alert('Settings saved successfully!'); // Show popup
    });
}

function loadSettings() {
    chrome.storage.sync.get([
        'authorInstances',
        'publishInstances',
        'openNewTab',
        'enableAuthorButton',
        'enableViewAsPublishedButton',
        'enablePublishButton'
    ], function (data) {
        (data.authorInstances || []).forEach((instance) => {
            addInstance(document.getElementById('author-instances'), 'author', instance.name, instance.url, instance.port);
        });
        (data.publishInstances || []).forEach((instance) => {
            addInstance(document.getElementById('publish-instances'), 'publish', instance.name, instance.url, instance.port);
        });

        if (data.openNewTab !== undefined) {
            document.getElementById('open-new-tab').checked = data.openNewTab;
        }
        if (data.enableAuthorButton !== undefined) {
            document.getElementById('enable-author-button').checked = data.enableAuthorButton;
        }
        if (data.enableViewAsPublishedButton !== undefined) {
            document.getElementById('enable-view-as-published-button').checked = data.enableViewAsPublishedButton;
        }
        if (data.enablePublishButton !== undefined) {
            document.getElementById('enable-publish-button').checked = data.enablePublishButton;
        }
    });
}
