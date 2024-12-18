// content.js

function getHostAndPort(url, port) {
    if (!url) {
        return null;
    }
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        const portNumber = port || (urlObj.port ? urlObj.port : null);
        return { hostname, port: portNumber };
    } catch (e) {
        console.error(`Invalid URL in getHostAndPort: ${url}, Error: ${e.message}`);
        return null;
    }
}

function urlsMatch(instanceUrl, instancePort, currentUrl) {
    const instanceHostPort = getHostAndPort(instanceUrl, instancePort);
    if (!instanceHostPort) return false;

    let currentUrlObj;
    try {
        currentUrlObj = new URL(currentUrl);
    } catch (e) {
        console.error(`Invalid currentUrl in urlsMatch: ${currentUrl}, Error: ${e.message}`);
        return false;
    }

    const currentHostPort = {
        hostname: currentUrlObj.hostname,
        port: currentUrlObj.port || null
    };

    if (instanceHostPort.hostname !== currentHostPort.hostname) {
        return false;
    }

    if (instanceHostPort.port) {
        const instanceP = instanceHostPort.port;
        const currentP = currentHostPort.port || (currentUrlObj.protocol === 'https:' ? '443' : '80');
        return instanceP === currentP;
    }

    return true;
}

function getWcmModeFromUrl(url) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('wcmmode');
}

chrome.storage.sync.get([
    'instances', 
    'openNewTab', 
    'enableAuthorButton', 
    'enableViewAsPublishedButton', 
    'enablePublishButton',
    'enableEditButton'
], (data) => {
    const instances = data.instances || [];
    const openNewTab = data.openNewTab || false;
    const enableAuthorButton = data.enableAuthorButton !== false;
    const enableViewAsPublishedButton = data.enableViewAsPublishedButton !== false;
    const enablePublishButton = data.enablePublishButton !== false;
    const enableEditButton = data.enableEditButton !== false;

    function findMatchedInstance(currentURL) {
        for (const instance of instances) {
            if (instance.author && Array.isArray(instance.author)) {
                if (instance.author.some(a => urlsMatch(a.url, a.port, currentURL))) {
                    return { instance, type: 'author' };
                }
            }
            if (instance.publish && Array.isArray(instance.publish)) {
                if (instance.publish.some(p => urlsMatch(p.url, p.port, currentURL))) {
                    return { instance, type: 'publish' };
                }
            }
        }
        return null;
    }

    function findDefaultUrl(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return null;
        const def = arr.find(u => u.default === true);
        return def || arr[0];
    }

    function addButtons() {
        const currentURL = window.location.href;
        const currentUrlObj = new URL(currentURL);

        const matched = findMatchedInstance(currentURL);
        if (!matched) {
            console.log("No matching instance found for the current URL");
            return;
        }

        const { instance, type } = matched;
        
        const primaryAuthor = findDefaultUrl(instance.author);
        const primaryPublish = findDefaultUrl(instance.publish);

        // Edit button
        if (enableEditButton && type === 'author' && !currentURL.includes('/editor.html/') && getWcmModeFromUrl(currentURL) === 'disabled') {
            const editButton = document.createElement('button');
            editButton.innerText = 'Go to Edit';
            editButton.id = 'edit-button';
            editButton.className = 'edit-button';

            editButton.addEventListener('click', () => {
                const urlObj = new URL(currentURL);
                urlObj.searchParams.delete('wcmmode');
                if (!urlObj.pathname.includes('/editor.html/')) {
                    urlObj.pathname = urlObj.pathname.replace('/content/', '/editor.html/content/');
                }
                urlObj.searchParams.set('wcmmode', 'edit');
                const newURL = urlObj.toString();
                openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
                console.log("Switched to Edit mode: " + newURL);
            });

            document.body.appendChild(editButton);
            console.log("Edit button added to the page");
        }

        // View as Published button
        if (enableViewAsPublishedButton && currentURL.includes('/editor.html/')) {
            const viewAsPublishedButton = document.createElement('button');
            viewAsPublishedButton.innerText = 'View as Published';
            viewAsPublishedButton.id = 'view-as-published-button';
            viewAsPublishedButton.className = 'switch-mode-button';

            viewAsPublishedButton.addEventListener('click', () => {
                const urlObj = new URL(currentURL);
                urlObj.pathname = urlObj.pathname.replace('/editor.html/', '/');
                urlObj.searchParams.delete('wcmmode');
                urlObj.searchParams.set('wcmmode', 'disabled');
                const newURL = urlObj.toString();
                openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
                console.log("New URL opened: " + newURL);
            });

            document.body.appendChild(viewAsPublishedButton);
            console.log("View as Published button added");
        }

        // Publish button on both editor.html and wcmmode=disabled (View as Published)
        if (enablePublishButton && (currentURL.includes('/editor.html/') || getWcmModeFromUrl(currentURL) === 'disabled') && primaryPublish) {
            const publishButton = document.createElement('button');
            publishButton.innerText = 'Go to Publish';
            publishButton.id = 'publish-button';
            publishButton.className = 'publish-button';

            publishButton.addEventListener('click', () => {
                const publishUrlObj = new URL(primaryPublish.url);
                let newOrigin = `${publishUrlObj.protocol}//${publishUrlObj.hostname}`;
                if (primaryPublish.port && primaryPublish.port !== '80' && primaryPublish.port !== '443') {
                    newOrigin += `:${primaryPublish.port}`;
                }

                let newURL = currentURL.replace(currentUrlObj.origin, newOrigin).replace('/editor.html/', '/');
                openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
                console.log("New Publish URL opened: " + newURL);
            });

            document.body.appendChild(publishButton);
            console.log("Publish button added");
        }

        // Author button if on publish
        if (enableAuthorButton && type === 'publish' && primaryAuthor) {
            const authorButton = document.createElement('button');
            authorButton.innerText = 'Go to Author';
            authorButton.id = 'author-button';
            authorButton.className = 'author-button';

            authorButton.addEventListener('click', () => {
                const authorUrlObj = new URL(primaryAuthor.url);
                let newOrigin = `${authorUrlObj.protocol}//${authorUrlObj.hostname}`;
                if (primaryAuthor.port && primaryAuthor.port !== '80' && primaryAuthor.port !== '443') {
                    newOrigin += `:${primaryAuthor.port}`;
                }

                let newURL = currentURL.replace(currentUrlObj.origin, newOrigin);
                newURL = newURL.replace('/content/', '/editor.html/content/');
                newURL = newURL.replace(/(\?|&)wcmmode=[^&]*/, '');
                newURL += (newURL.includes('?') ? '&' : '?') + 'wcmmode=edit';
                openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
                console.log("Navigated to Author: " + newURL);
            });

            document.body.appendChild(authorButton);
            console.log("Author button added");
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => addButtons());
    } else {
        addButtons();
    }
});
