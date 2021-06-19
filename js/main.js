/*
 Copyright 2021 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// Need to use this WMR syntax to properly compile the service worker.
// If you compile your service worker in another way, you can use the URL to it
// directly in navigator.serviceWorker.register
import swURL from 'sw:../service-worker.js';
import { openDB } from 'idb';


// Register the service worker
if ('serviceWorker' in navigator) {
  // Wait for the 'load' event to not block other work
  window.addEventListener('load', async () => {
    // Try to register the service worker.
    try {
      const reg = await navigator.serviceWorker.register(swURL);
      console.log('Service worker registered! 😎', reg);
    } catch (err) {
      console.log('😥 Service worker registration failed: ', err);
    }
  });
}

// Set up the database
// create an IndexedDB database called "settings-store", initilased with version 1 and 
// an object store called "settings"
const db = await openDB('settings-store', 1, {
  upgrade(db) {
    db.createObjectStore('settings');
  },
});

window.addEventListener('DOMContentLoaded', async () => {
  // Set up the editor
  const { Editor } = await import('./app/editor.js');
  const editor = new Editor(document.body);

  // Set up the menu
  const { Menu } = await import('./app/menu.js');
  new Menu(document.querySelector('.actions'), editor);

  // Set the initial state in the editor
  const defaultText = `# Welcome to PWA Edit!\n\nTo leave the editing area, press the \`esc\` key, then \`tab\` or \`shift+tab\`.`;

  // Save content to database on edit
  editor.onUpdate(async (content) => {
    await db.put('settings', content, 'content');
  });

  editor.setContent(defaultText);
});
