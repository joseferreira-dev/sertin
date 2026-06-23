const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const db = require("./database/db");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "assets", "icon.png"),
  });

  mainWindow.loadFile("index.html");
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  db.initDatabase();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---------- IPC Handlers ----------
// Lancamentos
ipcMain.handle("db:lancamentos:getAll", () => db.getLancamentos());
ipcMain.handle("db:lancamentos:insert", (_, data) => db.insertLancamento(data));
ipcMain.handle("db:lancamentos:update", (_, id, data) =>
  db.updateLancamento(id, data),
);
ipcMain.handle("db:lancamentos:delete", (_, id) => db.deleteLancamento(id));

// Parcelamentos
ipcMain.handle("db:parcelamentos:getAll", () => db.getParcelamentos());
ipcMain.handle("db:parcelamentos:insert", (_, data) =>
  db.insertParcelamento(data),
);
ipcMain.handle("db:parcelamentos:update", (_, id, data) =>
  db.updateParcelamento(id, data),
);
ipcMain.handle("db:parcelamentos:delete", (_, id) => db.deleteParcelamento(id));

// Metas
ipcMain.handle("db:metas:getAll", () => db.getMetas());
ipcMain.handle("db:metas:insert", (_, data) => db.insertMeta(data));
ipcMain.handle("db:metas:update", (_, id, data) => db.updateMeta(id, data));
ipcMain.handle("db:metas:delete", (_, id) => db.deleteMeta(id));

// Contas Bancárias
ipcMain.handle("db:contas:getAll", () => db.getContasBancarias());
ipcMain.handle("db:contas:insert", (_, data) => db.insertContaBancaria(data));
ipcMain.handle("db:contas:update", (_, id, data) =>
  db.updateContaBancaria(id, data),
);
ipcMain.handle("db:contas:delete", (_, id) => db.deleteContaBancaria(id));

// Cartões de Crédito
ipcMain.handle("db:cartoes:getAll", () => db.getCartoesCredito());
ipcMain.handle("db:cartoes:insert", (_, data) => db.insertCartaoCredito(data));
ipcMain.handle("db:cartoes:update", (_, id, data) =>
  db.updateCartaoCredito(id, data),
);
ipcMain.handle("db:cartoes:delete", (_, id) => db.deleteCartaoCredito(id));

// Config
ipcMain.handle("db:config:getLista", (_, nome) => db.getLista(nome));
ipcMain.handle("db:config:addToLista", (_, nome, valor) =>
  db.addToLista(nome, valor),
);
ipcMain.handle("db:config:removeFromLista", (_, id) => db.removeFromLista(id));

// Dashboard Geral
ipcMain.handle("db:dashboard:getResumoGeral", () => db.getResumoGeral());
ipcMain.handle("db:dashboard:getCategoriasGeral", () =>
  db.getCategoriasGeral(),
);
ipcMain.handle("db:dashboard:getUltimosLancamentosGeral", (_, limit) =>
  db.getUltimosLancamentosGeral(limit),
);

// Dashboard Mensal
ipcMain.handle("db:dashboard:getResumoMes", (_, mes) => db.getResumoMes(mes));
ipcMain.handle("db:dashboard:getDespesasPorCategoria", (_, mes) =>
  db.getDespesasPorCategoria(mes),
);
ipcMain.handle("db:dashboard:getExtratoMensal", () => db.getExtratoMensal());
ipcMain.handle("db:dashboard:getUltimosLancamentos", (_, limit, mes) =>
  db.getUltimosLancamentos(limit, mes),
);
