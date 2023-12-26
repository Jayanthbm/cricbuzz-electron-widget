const electron = require("electron");
const path = require("path");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const screen = electron.screen;

let overlayWindow;

function createWindow() {
   const { width, height } = screen.getPrimaryDisplay().workAreaSize;
   // Create the browser window.
   overlayWindow = new BrowserWindow({
      width: 330,
      height: 350,
      x: width - 330,
      y: 10, 
      frame: false,
      transparent: false,
      alwaysOnTop: true, 
      webPreferences: { nodeIntegration: true, contextIsolation: false },
   });
   // and load the index.html of the app.
   console.log(__dirname);
   overlayWindow.loadFile(path.join(__dirname, "../build/index.html"));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);