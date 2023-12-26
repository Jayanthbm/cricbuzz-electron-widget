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
    width: 370,
    height: 350,
    x: width - 370,
    y: 10,
    frame: false,
    transparent: false,
    alwaysOnTop: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  // and load the index.html of the app.
  overlayWindow.loadFile(path.join(__dirname, "../build/index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
