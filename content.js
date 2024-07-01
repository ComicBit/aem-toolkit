console.log("Content script injected");

chrome.storage.sync.get([
  'authorInstances',
  'publishInstances',
  'openNewTab',
  'enableAuthorButton',
  'enableViewAsPublishedButton',
  'enablePublishButton'
], (data) => {
  const authorInstances = data.authorInstances || [];
  const publishInstances = data.publishInstances || [];
  const openNewTab = data.openNewTab || false;
  const enableAuthorButton = data.enableAuthorButton !== false;
  const enableViewAsPublishedButton = data.enableViewAsPublishedButton !== false;
  const enablePublishButton = data.enablePublishButton !== false;

  function addButtons() {
    console.log("Adding buttons");

    const currentURL = window.location.href;
    console.log("Current URL:", currentURL);

    authorInstances.forEach(instance => {
      const editorRegex = new RegExp(`${instance.url.replace(/\./g, "\\.")}:${instance.port}\/editor\.html\/`);
      if (editorRegex.test(currentURL)) {
        console.log("URL matches the editor regex");

        if (enableViewAsPublishedButton) {
          const viewAsPublishedButton = document.createElement('button');
          viewAsPublishedButton.innerText = 'View as Published';
          viewAsPublishedButton.id = 'view-as-published-button';
          viewAsPublishedButton.className = 'switch-mode-button';

          viewAsPublishedButton.addEventListener('click', () => {
            const newURL = currentURL.replace('/editor.html/', '/') + "?wcmmode=disabled";
            openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
            console.log("New URL opened: " + newURL);
          });

          document.body.appendChild(viewAsPublishedButton);
          console.log("View as Published button added to the page");
        }

        if (enablePublishButton) {
          const publishButton = document.createElement('button');
          publishButton.innerText = 'Publish';
          publishButton.id = 'publish-button';
          publishButton.className = 'publish-button';

          publishButton.addEventListener('click', () => {
            const publishInstance = publishInstances.find(publishInstance => publishInstance.url === instance.url);
            if (publishInstance) {
              const newURL = currentURL.replace(`${instance.url}:${instance.port}`, `${publishInstance.url}:${publishInstance.port}`).replace('/editor.html/', '/');
              openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
              console.log("New Publish URL opened: " + newURL);
            } else {
              console.log("No matching publish instance found for author instance");
            }
          });

          document.body.appendChild(publishButton);
          console.log("Publish button added to the page");
        }
      }

      const viewAsPublishedRegex = new RegExp(`${instance.url.replace(/\./g, "\\.")}:${instance.port}\/\?wcmmode=disabled`);
      if (viewAsPublishedRegex.test(currentURL)) {
        console.log("URL matches the view as published regex");

        if (enableAuthorButton) {
          const authorButton = document.createElement('button');
          authorButton.innerText = 'Author';
          authorButton.id = 'author-button';
          authorButton.className = 'author-button';

          authorButton.addEventListener('click', () => {
            const newURL = currentURL.replace('?wcmmode=disabled', '/editor.html/') + '?wcmmode=edit';
            openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
            console.log("New Author URL opened: " + newURL);
          });

          document.body.appendChild(authorButton);
          console.log("Author button added to the page");
        }

        if (enablePublishButton) {
          const publishButton = document.createElement('button');
          publishButton.innerText = 'Publish';
          publishButton.id = 'publish-button';
          publishButton.className = 'publish-button';

          publishButton.addEventListener('click', () => {
            const publishInstance = publishInstances.find(publishInstance => publishInstance.url === instance.url);
            if (publishInstance) {
              const newURL = currentURL.replace(`${instance.url}:${instance.port}`, `${publishInstance.url}:${publishInstance.port}`);
              openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
              console.log("New Publish URL opened: " + newURL);
            } else {
              console.log("No matching publish instance found for author instance");
            }
          });

          document.body.appendChild(publishButton);
          console.log("Publish button added to the page");
        }
      }
    });

    publishInstances.forEach(instance => {
      const publishRegex = new RegExp(`${instance.url.replace(/\./g, "\\.")}:${instance.port}\/content\/`);
      if (publishRegex.test(currentURL)) {
        console.log("URL matches the publish regex");

        if (enableAuthorButton) {
          const authorButton = document.createElement('button');
          authorButton.innerText = 'Author';
          authorButton.id = 'author-button';
          authorButton.className = 'author-button';

          authorButton.addEventListener('click', () => {
            const authorInstance = authorInstances.find(authorInstance => authorInstance.url === instance.url);
            if (authorInstance) {
              const newURL = currentURL.replace(`${instance.url}:${instance.port}`, `${authorInstance.url}:${authorInstance.port}`).replace('/content/', '/editor.html/content/');
              openNewTab ? window.open(newURL, '_blank') : window.location.href = newURL;
              console.log("New Author URL opened: " + newURL);
            } else {
              console.log("No matching author instance found for publish instance");
            }
          });

          document.body.appendChild(authorButton);
          console.log("Author button added to the page");
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log("DOMContentLoaded event fired");
      addButtons();
    });
  } else {
    console.log("Document already loaded");
    addButtons();
  }
});
