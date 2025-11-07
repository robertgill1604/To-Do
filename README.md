# To-Do List Web App

A modern, responsive to-do list application built with HTML, CSS, and JavaScript.

## Features

- ✅ Add new tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Edit existing tasks
- ✅ Delete tasks
- ✅ Filter tasks (All, Active, Completed)
- ✅ Clear all completed tasks
- ✅ Persistent storage using localStorage
- ✅ Responsive design for mobile and desktop
- ✅ Modern gradient UI with smooth animations
- ✅ Task counter
- ✅ Empty state messages

## How to Use

1. Open `index.html` in your web browser
2. Type a task in the input field and click "Add" or press Enter
3. Click the checkbox to mark tasks as complete
4. Use the Edit button to modify existing tasks
5. Use the Delete button to remove tasks
6. Filter tasks using the All/Active/Completed buttons
7. Clear completed tasks using the "Clear Completed" button

## Technical Details

- **HTML5**: Semantic structure with proper accessibility
- **CSS3**: Modern styling with gradients, transitions, and animations
- **Vanilla JavaScript**: ES6+ features, localStorage for persistence
- **Responsive Design**: Mobile-first approach with media queries
- **Local Storage**: Tasks are saved automatically and persist between sessions

## How Tasks Are Stored Without a Database

This application runs entirely in the browser, so it does not require a server-side database. Every task you create is stored in the browser's [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) under the `todos` key as a JSON string. When the page loads, the app reads that value, parses it back into JavaScript objects, and restores your task list automatically.

Because storage lives in the browser:
- Tasks persist for the same browser and device, even after refreshes.
- Clearing site data or using a private/incognito window removes the saved tasks.
- Tasks are not shared or synced between different browsers or devices. A backend service would be required for multi-device syncing.

You can inspect the stored data by opening your browser's developer tools, navigating to the Application/Storage tab, and checking Local Storage for the current site.

## File Structure

```
├── index.html    # Main HTML structure
├── style.css     # CSS styling and responsive design
├── script.js     # JavaScript functionality
└── README.md     # Documentation
```

## Browser Compatibility

This application works in all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License