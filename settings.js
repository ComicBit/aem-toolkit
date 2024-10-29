// settings.js
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('settings-form').addEventListener('submit', function(event) {
        event.preventDefault();
        saveSettings();
    });

    document.getElementById('add-instance').addEventListener('click', function () {
        addInstance();
    });

    loadSettings();
});

function addInstance(name = '', authorUrl = 'http://localhost', authorPort = '', publishUrl = 'http://localhost', publishPort = '') {
    const index = document.querySelectorAll('.instance-group').length + 1;
    const container = document.createElement('div');
    container.classList.add('instance-group');
    container.innerHTML = `
        <label>Instance Name: <input type="text" name="instance-name-${index}" value="${name}" required></label>
        <div class="instance">
            <h3>Author</h3>
            <label>URL: <input type="text" name="author-url-${index}" value="${authorUrl}" placeholder="http://example.com" required></label>
            <label>Port: <input type="number" name="author-port-${index}" value="${authorPort}"></label>
        </div>
        <div class="instance">
            <h3>Publish</h3>
            <label>URL: <input type="text" name="publish-url-${index}" value="${publishUrl}" placeholder="http://example.com" required></label>
            <label>Port: <input type="number" name="publish-port-${index}" value="${publishPort}"></label>
        </div>
        <button type="button" class="remove-instance">Remove Instance</button>
    `;
    document.getElementById('instances-container').appendChild(container);

    container.querySelector('.remove-instance').addEventListener('click', function() {
        container.remove();
    });
}

function saveSettings() {
    const instances = [];
    let isValid = true;

    document.querySelectorAll('.instance-group').forEach(div => {
        const name = div.querySelector('input[name^="instance-name"]').value.trim();
        if (!name) {
            alert('Instance name is required.');
            isValid = false;
            return;
        }

        let authorUrl = div.querySelector('input[name^="author-url"]').value.trim();
        if (!/^https?:\/\//i.test(authorUrl)) {
            authorUrl = 'http://' + authorUrl;
        }

        let publishUrl = div.querySelector('input[name^="publish-url"]').value.trim();
        if (!/^https?:\/\//i.test(publishUrl)) {
            publishUrl = 'http://' + publishUrl;
        }

        const authorPort = div.querySelector('input[name^="author-port"]').value.trim() || '';
        const publishPort = div.querySelector('input[name^="publish-port"]').value.trim() || '';

        instances.push({
            name,
            author: {
                url: authorUrl,
                port: authorPort
            },
            publish: {
                url: publishUrl,
                port: publishPort
            }
        });
    });

    if (!isValid) return;

    chrome.storage.sync.set({ instances }, () => {
        console.log('Settings saved');
        chrome.runtime.sendMessage({ action: "updateMenus" });
        alert('Settings saved successfully!');
    });
}

function loadSettings() {
    chrome.storage.sync.get(['instances'], function (data) {
        (data.instances || []).forEach(instance => {
            addInstance(instance.name, instance.author.url, instance.author.port, instance.publish.url, instance.publish.port);
        });
    });
}