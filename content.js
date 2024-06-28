console.log("Content script injected");

function addButtons() {
  console.log("Adding buttons");

  const currentURL = window.location.href;
  console.log("Current URL:", currentURL);

  const editorRegex = /localhost:4502\/editor\.html\/|10.29.24.20:4502\/editor\.html\//;
  const viewAsPublishedRegex = /localhost:4502|10\.29\.24\.20:4502\/?wcmmode=disabled/;
  const publishRegex = /localhost:4503\/content\/|10.29.24.20:4503\/content\//;

  if (editorRegex.test(currentURL)) {
    console.log("URL matches the editor regex");

    // "View as Published" Button
    const viewAsPublishedButton = document.createElement('button');
    viewAsPublishedButton.innerText = 'View as Published';
    viewAsPublishedButton.id = 'view-as-published-button';
    viewAsPublishedButton.className = 'switch-mode-button';

    viewAsPublishedButton.addEventListener('click', () => {
      const newURL = currentURL.replace('/editor.html/', '/') + "?wcmmode=disabled";
      window.open(newURL, '_blank');
      console.log("New URL opened: " + newURL);
    });

    document.body.appendChild(viewAsPublishedButton);
    console.log("View as Published button added to the page");

    // "Publish" Button
    const publishButton = document.createElement('button');
    publishButton.innerText = 'Publish';
    publishButton.id = 'publish-button';
    publishButton.className = 'publish-button';

    publishButton.addEventListener('click', () => {
      const newURL = currentURL.replace('localhost:4502', 'localhost:4503').replace('10.29.24.20:4502', '10.29.24.20:4503').replace('/editor.html/', '/');
      window.open(newURL, '_blank');
      console.log("New Publish URL opened: " + newURL);
    });

    document.body.appendChild(publishButton);
    console.log("Publish button added to the page");
  } else if (publishRegex.test(currentURL)) {
    console.log("URL matches the publish regex");

    // "Author" Button
    const authorButton = document.createElement('button');
    authorButton.innerText = 'Author';
    authorButton.id = 'author-button';
    authorButton.className = 'author-button';

    authorButton.addEventListener('click', () => {
      const newURL = currentURL.replace('localhost:4503', 'localhost:4502').replace('10.29.24.20:4503', '10.29.24.20:4502').replace('/content/', '/editor.html/content/');
      window.open(newURL, '_blank');
      console.log("New Author URL opened: " + newURL);
    });

    document.body.appendChild(authorButton);
    console.log("Author button added to the page");
  } else if (viewAsPublishedRegex.test(currentURL)) {
    console.log("URL matches the publish regex");

    // "Author" Button
    const authorButton = document.createElement('button');
    authorButton.innerText = 'Author';
    authorButton.id = 'author-button';
    authorButton.className = 'author-button';

    authorButton.addEventListener('click', () => {
      const newURL = currentURL.replace('localhost:4502', 'localhost:4502').replace('10.29.24.20:4502', '10.29.24.20:4502').replace('/content/', '/editor.html/content/'.replace('l?wcmmode=disabled', 'l'));
      window.open(newURL, '_blank');
      console.log("New Author URL opened: " + newURL);
    });

    document.body.appendChild(authorButton);
    console.log("Author button added to the page");
  } else {
    console.log("URL does not match any regex");
  }
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