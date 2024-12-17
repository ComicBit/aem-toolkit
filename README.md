
# AEM Toolkit

**AEM Toolkit** is a Chrome extension designed to streamline your Adobe Experience Manager (AEM) development and content management tasks. It simplifies navigation between author and publish instances, enhances your workflow with in-page controls, and provides quick access to essential AEM tools like OSGi bundles and CRXDE.

---

## Features

### 1. **Instance Management**
   - Configure multiple AEM instances, each with separate author and publish URLs.
   - Switch seamlessly between environments for different projects.

### 2. **Contextual View Switching**
   - Quickly toggle between:
     - **Edit Mode**: Opens the page in AEM Editor with `wcmmode=edit`.
     - **View as Published**: Displays the published version of the content with `wcmmode=disabled`.

### 3. **Integrated Context Menus**
   - Right-click anywhere on the browser page to access a customized context menu.
   - Navigate directly to OSGi bundles or CRXDE for both **author** and **publish** environments.
   - Configurable options to show/hide these menu items for specific instances.

### 4. **Custom Buttons on AEM Pages**
   - Automatically injects buttons on AEM pages for quick navigation:
     - **Go to Edit**: Opens the page in Edit Mode if currently in Published view.
     - **View as Published**: Opens the published version from Edit Mode.
     - **Go to Publish**: Redirects from the author to the publish instance.
     - **Go to Author**: Redirects from the publish instance to the author.

### 5. **Settings Page**
   - Add or modify your instances directly from the extension’s settings page.
   - Set default preferences for:
     - URLs and ports for author and publish environments.
     - Visibility of menu items and buttons.
   - Configurations are saved in Chrome’s `sync` storage, enabling easy transfer between devices.

---

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/aem-toolkit.git
    ```

2. Navigate to the project directory:
    ```bash
    cd aem-toolkit
    ```

3. Load the extension in Chrome:
    - Open Chrome and go to `chrome://extensions/`
    - Enable "Developer mode" (toggle in the top-right corner).
    - Click "Load unpacked" and select the project folder.

---

## Usage

### Configuring Instances
1. Click the extension icon in Chrome and go to "Options."
2. Add your AEM instances:
   - Provide the name, author URL, and publish URL.
   - Include port numbers if necessary (e.g., 4502 for author, 4503 for publish).

### Switching Views
- On any AEM page, the extension automatically injects action buttons:
  - **Go to Edit**: Navigates to the page in Edit Mode.
  - **View as Published**: Switches to the published version.
  - **Go to Publish/Author**: Switch between environments.

### Using Context Menus
- Right-click on any page to access:
  - Links to manage OSGi bundles.
  - Quick access to CRXDE.

---

## Advanced Settings

### Customize Buttons
- Enable or disable in-page buttons (e.g., "Go to Edit").
- Configure whether buttons open links in new tabs or the same tab.

### Global Context Menus
- Add or remove items from the right-click context menu for quick access to tools like OSGi bundles or CRXDE.

---

## Example Use Cases

1. **Developers Testing on AEM**:
   - Switch between edit and published views to ensure accuracy.
   - Debug OSGi bundles directly from the browser.

2. **Content Managers**:
   - Quickly view published content without manually modifying URLs.

3. **AEM Teams with Multiple Instances**:
   - Manage environments for multiple projects or clients seamlessly.

---

## Contributing

1. Fork the repository.
2. Create a new feature branch:
    ```bash
    git checkout -b feature/AmazingFeature
    ```
3. Commit your changes:
    ```bash
    git commit -m 'Add some AmazingFeature'
    ```
4. Push to the branch:
    ```bash
    git push origin feature/AmazingFeature
    ```
5. Open a Pull Request.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

For suggestions, issues, or questions, open an issue on GitHub or reach out via email at [your email/contact link].
