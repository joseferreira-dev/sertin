const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Lancamentos
  getLancamentos: () => ipcRenderer.invoke("db:lancamentos:getAll"),
  insertLancamento: (data) => ipcRenderer.invoke("db:lancamentos:insert", data),
  updateLancamento: (id, data) =>
    ipcRenderer.invoke("db:lancamentos:update", id, data),
  deleteLancamento: (id) => ipcRenderer.invoke("db:lancamentos:delete", id),

  // Parcelamentos
  getParcelamentos: () => ipcRenderer.invoke("db:parcelamentos:getAll"),
  insertParcelamento: (data) =>
    ipcRenderer.invoke("db:parcelamentos:insert", data),
  updateParcelamento: (id, data) =>
    ipcRenderer.invoke("db:parcelamentos:update", id, data),
  deleteParcelamento: (id) => ipcRenderer.invoke("db:parcelamentos:delete", id),

  // Metas
  getMetas: () => ipcRenderer.invoke("db:metas:getAll"),
  insertMeta: (data) => ipcRenderer.invoke("db:metas:insert", data),
  updateMeta: (id, data) => ipcRenderer.invoke("db:metas:update", id, data),
  deleteMeta: (id) => ipcRenderer.invoke("db:metas:delete", id),

  // Contas
  getContas: () => ipcRenderer.invoke("db:contas:getAll"),
  insertConta: (data) => ipcRenderer.invoke("db:contas:insert", data),
  updateConta: (id, data) => ipcRenderer.invoke("db:contas:update", id, data),
  deleteConta: (id) => ipcRenderer.invoke("db:contas:delete", id),

  // Cartões
  getCartoes: () => ipcRenderer.invoke("db:cartoes:getAll"),
  insertCartao: (data) => ipcRenderer.invoke("db:cartoes:insert", data),
  updateCartao: (id, data) => ipcRenderer.invoke("db:cartoes:update", id, data),
  deleteCartao: (id) => ipcRenderer.invoke("db:cartoes:delete", id),

  // Config
  getLista: (nome) => ipcRenderer.invoke("db:config:getLista", nome),
  addToLista: (nome, valor) =>
    ipcRenderer.invoke("db:config:addToLista", nome, valor),
  removeFromLista: (id) => ipcRenderer.invoke("db:config:removeFromLista", id),

  // Dashboard Geral
  getResumoGeral: () => ipcRenderer.invoke("db:dashboard:getResumoGeral"),
  getCategoriasGeral: () =>
    ipcRenderer.invoke("db:dashboard:getCategoriasGeral"),
  getUltimosLancamentosGeral: (limit) =>
    ipcRenderer.invoke("db:dashboard:getUltimosLancamentosGeral", limit),

  // Dashboard Mensal
  getResumoMes: (mes) => ipcRenderer.invoke("db:dashboard:getResumoMes", mes),
  getDespesasPorCategoria: (mes) =>
    ipcRenderer.invoke("db:dashboard:getDespesasPorCategoria", mes),
  getExtratoMensal: () => ipcRenderer.invoke("db:dashboard:getExtratoMensal"),
  getUltimosLancamentos: (limit, mes) =>
    ipcRenderer.invoke("db:dashboard:getUltimosLancamentos", limit, mes),
});
