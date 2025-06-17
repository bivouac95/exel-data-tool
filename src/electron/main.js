import path from "path";
import { app, BrowserWindow, Menu, protocol, session } from "electron";
import { createHandler } from "next-electron-rsc";

let mainWindow;

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
process.env["ELECTRON_ENABLE_LOGGING"] = "true";

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

// ⬇ Next.js handler ⬇

const appPath = app.getAppPath();
const dev = process.env.NODE_ENV === "development";
const projectRoot = path.resolve(appPath, "..", "..");
const dir = path.join(projectRoot, ".next", "standalone");

const { createInterceptor, localhostUrl } = createHandler({
  dev,
  dir,
  protocol,
  debug: false,
  turbo: true,
  onUnhandledRequest(req) {
    console.log("[Next RSC] Unhandled request", req.url);
  },
});

let stopIntercept;

// ⬆ Next.js handler ⬆

const createWindow = async () => {
  console.log(path.resolve(process.cwd(), "database.db"));
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      devTools: false,
      nodeIntegration: true,
    },
    icon: path.resolve(process.cwd(), "src", "app", "favicon.ico"),
  });

  Menu.setApplicationMenu(null);

  // ⬇ Next.js handler ⬇

  stopIntercept = await createInterceptor({
    session: mainWindow.webContents.session,
  });

  // ⬆ Next.js handler ⬆

  mainWindow.once("ready-to-show", () => {
    mainWindow.maximize(); // Растягивает окно
    mainWindow.webContents.openDevTools();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    stopIntercept?.();
  });

  await app.whenReady();
  await mainWindow.loadURL(localhostUrl + "/");

  console.log("[APP] Loaded", localhostUrl);
};

app.on("ready", createWindow);
app.on("window-all-closed", () => app.quit());
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0 && !mainWindow) {
    createWindow();
  }
});
