// Function to get origin, handling default ports
function getOrigin(url, port) {
    try {
        const urlObj = new URL(url);
        if (port) {
            if (port !== '80' && port !== '443') {
                urlObj.port = port;
            } else {
                urlObj.port = ''; // Use default port
            }
        }
        return urlObj.origin;
    } catch (e) {
        console.error(`Invalid URL in getOrigin: ${url}, Error: ${e.message}`);
        return null;
    }
}

function urlsMatch(instanceUrl, instancePort, currentUrl) {
    const instanceOrigin = getOrigin(instanceUrl, instancePort);
    const currentOrigin = new URL(currentUrl).origin;
    if (!instanceOrigin) {
        return false;
    }
    console.log(`Comparing instanceOrigin: ${instanceOrigin} with currentOrigin: ${currentOrigin}`);
    return instanceOrigin === currentOrigin;
}

// Function to get 'wcmmode' parameter from URL
function getWcmModeFromUrl(url) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('wcmmode');
}

chrome.storage.sync.get(['instances', 'openNewTab', 'enableAuthorButton', 'enableViewAsPublishedButton', 'enablePublishButton', 'enableEditButton'], (data) => {
    const instances = data.instances || [];
    const openNewTab = data.openNewTab || false;
    const enableAuthorButton = data.enableAuthorButton !== false;
    const enableViewAsPublishedButton = data.enableViewAsPublishedButton !== false;
    const enablePublishButton = data.enablePublishButton !== false;
    const enableEditButton = data.enableEditButton !== false;

    function addButtons() {
        const currentURL = window.location.href;

        // Find the matching instance based on the current URL
        const matchedInstance = instances.find(instance => {
            return urlsMatch(instance.author.url, instance.author.port, currentURL) ||
                   urlsMatch(instance.publish.url, instance.publish.port, currentURL);
        });

        if (!matchedInstance) {
            console.log("No matching instance found for the current URL");
            return;
        }

        // Add "Edit" button when in 'View as Published' mode on author site
        if (enableEditButton && urlsMatch(matchedInstance.author.url, matchedInstance.author.port, currentURL) && !currentURL.includes('/editor.html/') && getWcmModeFromUrl(currentURL) === 'disabled') {
            const editButton = document.createElement('button');
            editButton.innerText = 'Go to Edit';
            editButton.id = 'edit-button';
            editButton.className = 'edit-button';

            editButton.addEventListener('click', () => {
                const urlObj = new URL(currentURL);

                // Remove 'wcmmode' parameter
                urlObj.searchParams.delete('wcmmode');

                // Insert '/editor.html' before '/content/' if not already present
                if (!urlObj.pathname.includes('/editor.html/')) {
                    urlObj.pathname = urlObj.pathname.replace('/content/', '/editor.html/content/');
                }

                // Set 'wcmmode' to 'edit'
                urlObj.searchParams.set('wcmmode', 'edit');

                const newURL = urlObj.toString();

                openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
                console.log("Switched to Edit mode: " + newURL);
            });

            document.body.appendChild(editButton);
            console.log("Edit button added to the page");
        }

        // Add "View as Published" button
        if (enableViewAsPublishedButton && currentURL.includes('/editor.html/')) {
            const viewAsPublishedButton = document.createElement('button');
            viewAsPublishedButton.innerText = 'View as Published';
            viewAsPublishedButton.id = 'view-as-published-button';
            viewAsPublishedButton.className = 'switch-mode-button';

            viewAsPublishedButton.addEventListener('click', () => {
                const urlObj = new URL(currentURL);

                // Remove '/editor.html/' from the pathname
                urlObj.pathname = urlObj.pathname.replace('/editor.html/', '/');

                // Remove any existing 'wcmmode' parameter
                urlObj.searchParams.delete('wcmmode');

                // Set 'wcmmode' to 'disabled'
                urlObj.searchParams.set('wcmmode', 'disabled');

                const newURL = urlObj.toString();

                openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
                console.log("New URL opened: " + newURL);
            });

            document.body.appendChild(viewAsPublishedButton);
            console.log("View as Published button added to the page");
        }

        // Add "Publish" button
        if (enablePublishButton && currentURL.includes('/editor.html/')) {
            const publishButton = document.createElement('button');
            publishButton.innerText = 'Go to Publish';
            publishButton.id = 'publish-button';
            publishButton.className = 'publish-button';

            publishButton.addEventListener('click', () => {
                const authorOrigin = getOrigin(matchedInstance.author.url, matchedInstance.author.port);
                const publishOrigin = getOrigin(matchedInstance.publish.url, matchedInstance.publish.port);
                const currentOrigin = new URL(currentURL).origin;

                let newURL = currentURL.replace(currentOrigin, publishOrigin).replace('/editor.html/', '/');

                openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
                console.log("New Publish URL opened: " + newURL);
            });

            document.body.appendChild(publishButton);
            console.log("Publish button added to the page");
        }

        // Add "Author" button (only on publish site)
        const currentOrigin = new URL(currentURL).origin;
        const publishOrigin = getOrigin(matchedInstance.publish.url, matchedInstance.publish.port);

        if (enableAuthorButton && currentOrigin === publishOrigin) {
            const authorButton = document.createElement('button');
            authorButton.innerText = 'Go to Author';
            authorButton.id = 'author-button';
            authorButton.className = 'author-button';

            authorButton.addEventListener('click', () => {
                const authorOrigin = getOrigin(matchedInstance.author.url, matchedInstance.author.port);

                let newURL = currentURL.replace(publishOrigin, authorOrigin);

                // Insert '/editor.html' before '/content/'
                newURL = newURL.replace('/content/', '/editor.html/content/');

                // Remove any existing 'wcmmode' parameter
                newURL = newURL.replace(/(\?|&)wcmmode=[^&]*/, '');
                // Append 'wcmmode=edit'
                newURL += (newURL.includes('?') ? '&' : '?') + 'wcmmode=edit';

                openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
                console.log("Navigated to Author: " + newURL);
            });

            document.body.appendChild(authorButton);
            console.log("Author button added to the page");
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => addButtons());
    } else {
        addButtons();
    }
});