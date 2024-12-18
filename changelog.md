# Changelog for Browser Extension Settings Page Updates

---

## General Fixes and Enhancements

1. **Stylized Input Fields**
   - Text fields now match the overall style of the UI.
   - On focus, input fields highlight with a soft glowing effect and animated caret color, providing a more polished user interaction.

2. **Plus/Minus Button Animation**
   - The vertical bar of the **plus sign** now smoothly rotates counterclockwise and merges into the horizontal bar before fading out to form the **minus sign**.
   - This animation feels fluid and visually satisfying.

3. **Improved Drag-and-Drop Experience**
   - **Drag Threshold:** A small drag threshold (5px) ensures that clicking toggles the collapse state, while dragging only begins after noticeable movement.
   - **Item Pickup Animation:** When dragging an item, the actual element is "picked up" and follows the cursor smoothly.
   - **Smooth Reordering:** The rest of the elements smoothly move around to make space for the dragged element, providing an intuitive and visually appealing drag-and-drop experience.
   - **Drag Handles:** While handles are still present for guidance, users can now drag items over the **entire collapsed element** for better usability.

---

## Instance-Specific Fixes

4. **Collapse/Uncollapse Behavior**
   - Clicking the **header section** of an instance (title and plus/minus button) toggles the collapsed state.
   - Dragging an instance only starts when the mouse moves beyond the drag threshold, preventing accidental drags.

5. **Default URL Selection Logic**
   - The **default URL option** is now hidden when there is only one URL present.
   - If two or more URLs are added, the first one is automatically selected as the default.
   - A radio button next to each URL allows users to explicitly select the default URL.

6. **Reordering URLs Within Instances**
   - URLs inside an instance (both Author and Publish URLs) are now draggable and can be reordered intuitively.

7. **Port Field Alignment**
   - The **port input field** now shares the same line as the URL path input for cleaner layout and better use of space.

8. **Separator Visibility Fix**
   - The separator line under the instance name is no longer visible when the instance is collapsed.

9. **Remove Instance Button Position**
   - The **Remove Instance** button has been moved to the bottom of the instance section to avoid confusion with other controls.

---

## Global Contextual Menu Enhancements

10. **Input Field Alignment**
    - Both **Name** and **Path** fields for global contextual menu items now appear on the same line, improving visual alignment and usability.

11. **Improved Checkbox Labels**
    - The **"A" (Author)** and **"P" (Publish)** toggles have been replaced with clearer labels, such as "Show in Author" and "Show in Publish," making their purpose self-explanatory.
    - Labels are visually aligned and styled consistently with the UI.

---

## Theming Optimizations

12. **Dark and Light Themes Overhaul**
    - The light theme has been refined to look modern and visually appealing, addressing its earlier outdated appearance.
    - Improved contrast, shadows, and highlights ensure that both dark and light themes feel polished and captivating.

13. **Interactive Feedback for Buttons**
    - Buttons for **Add Instance**, **Add Global Menu Item**, and **Remove** actions now feature consistent styles, hover effects, and subtle animations.

---

## Bug Fixes

14. **Accidental Dragging Prevention**
    - Fixed an issue where clicking on an instance to expand or collapse it would immediately trigger a drag action.
    - Dragging now only begins after the mouse moves past a defined threshold.

15. **Smooth Element Movement on Drag**
    - Reordering elements now includes a smooth animation for both the dragged item and the surrounding elements, reducing abrupt jumps during movement.

---

## Final Notes

This changelog summarizes the comprehensive improvements made to the settings page, focusing on **usability**, **visual polish**, and **bug fixes**. The changes ensure a smoother user experience, better aesthetics, and intuitive functionality. 🚀
