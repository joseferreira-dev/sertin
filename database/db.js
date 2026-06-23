const Database = require("better-sqlite3");
const path = require("path");

let db;

function initDatabase() {
  const dbPath = path.join(__dirname, "sertin.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS lancamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT,
      tipo TEXT,
      categoria TEXT,
      descricao TEXT,
      valor REAL,
      meio TEXT,
      destino TEXT,
      status TEXT,
      mes TEXT,
      compra TEXT,
      parcela TEXT,
      observacoes TEXT,
      parcelamento_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS parcelamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compra TEXT,
      categoria TEXT,
      cartao TEXT,
      data_compra TEXT,
      valor_total REAL,
      qtd_parcelas INTEGER,
      valor_parcela REAL,
      inicio TEXT,
      status TEXT,
      obs TEXT
    );

    CREATE TABLE IF NOT EXISTS metas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meta TEXT,
      objetivo REAL,
      atual REAL,
      prazo TEXT,
      aporte_mensal REAL,
      progresso REAL,
      status TEXT,
      categoria TEXT,
      observacoes TEXT
    );

    CREATE TABLE IF NOT EXISTS contas_bancarias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT,
      saldo_inicial REAL DEFAULT 0,
      observacoes TEXT,
      cor TEXT DEFAULT '#C4A882'
    );

    CREATE TABLE IF NOT EXISTS cartoes_credito (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      limite REAL DEFAULT 0,
      dia_fechamento INTEGER,
      dia_vencimento INTEGER,
      observacoes TEXT,
      cor TEXT DEFAULT '#D4A373',
      limite_utilizado REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS config_listas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_lista TEXT,
      valor TEXT
    );
  `);

  // Migrações
  const tableInfoCartoes = db
    .prepare("PRAGMA table_info(cartoes_credito)")
    .all();
  if (!tableInfoCartoes.some((col) => col.name === "cor")) {
    db.exec(
      "ALTER TABLE cartoes_credito ADD COLUMN cor TEXT DEFAULT '#D4A373'",
    );
  }
  if (!tableInfoCartoes.some((col) => col.name === "limite_utilizado")) {
    db.exec(
      "ALTER TABLE cartoes_credito ADD COLUMN limite_utilizado REAL DEFAULT 0",
    );
  }

  const tableInfoContas = db
    .prepare("PRAGMA table_info(contas_bancarias)")
    .all();
  if (!tableInfoContas.some((col) => col.name === "cor")) {
    db.exec(
      "ALTER TABLE contas_bancarias ADD COLUMN cor TEXT DEFAULT '#C4A882'",
    );
  }

  // Remover listas antigas
  db.prepare("DELETE FROM config_listas WHERE nome_lista = 'contas'").run();
  db.prepare("DELETE FROM config_listas WHERE nome_lista = 'meses'").run();

  // Listas de apoio
  const listas = {
    receitas: [
      "Salario",
      "Freelance",
      "Rendimentos",
      "Cashback",
      "Vendas",
      "Restituicao",
      "Aporte Meta",
    ],
    despesas: [
      "Moradia",
      "Alimentacao",
      "Transporte",
      "Saude",
      "Educacao",
      "Lazer",
      "Assinaturas",
      "Vestuario",
      "Mercado",
      "Impostos",
      "Outros",
      "Transferencia",
    ],
    status: ["Realizado", "Pendente", "Cancelado"],
    tipos: ["Receita", "Despesa", "Transferencia"],
  };

  const insertLista = db.prepare(
    "INSERT INTO config_listas (nome_lista, valor) VALUES (?, ?)",
  );
  for (const [nome, valores] of Object.entries(listas)) {
    for (const val of valores) {
      const exist = db
        .prepare(
          "SELECT 1 FROM config_listas WHERE nome_lista = ? AND valor = ?",
        )
        .get(nome, val);
      if (!exist) insertLista.run(nome, val);
    }
  }

  // Dados de exemplo
  const countContas = db
    .prepare("SELECT COUNT(*) as c FROM contas_bancarias")
    .get().c;
  if (countContas === 0) {
    const insConta = db.prepare(
      "INSERT INTO contas_bancarias (nome, tipo, saldo_inicial, observacoes, cor) VALUES (?, ?, ?, ?, ?)",
    );
    insConta.run("Conta Corrente", "Corrente", 1500.0, "Principal", "#C4A882");
    insConta.run("Conta Poupança", "Poupança", 5000.0, "Reserva", "#8B6B4A");
    insConta.run("Dinheiro Físico", "Dinheiro", 200.0, "", "#D4A373");
  }

  const countCartoes = db
    .prepare("SELECT COUNT(*) as c FROM cartoes_credito")
    .get().c;
  if (countCartoes === 0) {
    const insCartao = db.prepare(
      "INSERT INTO cartoes_credito (nome, limite, dia_fechamento, dia_vencimento, observacoes, cor, limite_utilizado) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    insCartao.run("Cartão Nubank", 5000.0, 10, 15, "", "#D4A373", 0);
    insCartao.run("Cartão Itaú", 8000.0, 5, 10, "", "#A67C52", 0);
    insCartao.run("Cartão Inter", 3000.0, 20, 25, "", "#C76B4A", 0);
  }

  const countLanc = db.prepare("SELECT COUNT(*) as c FROM lancamentos").get().c;
  if (countLanc === 0) {
    const insert = db.prepare(`INSERT INTO lancamentos 
      (data, tipo, categoria, descricao, valor, meio, destino, status, mes, compra, parcela, observacoes, parcelamento_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const exemplos = [
      [
        "2026-01-01",
        "Receita",
        "Salario",
        "Salário mensal",
        7500,
        "Conta Corrente",
        "",
        "Realizado",
        "Jan/2026",
        "",
        "",
        "",
        null,
      ],
      [
        "2026-01-05",
        "Despesa",
        "Moradia",
        "Aluguel",
        2200,
        "Conta Corrente",
        "",
        "Realizado",
        "Jan/2026",
        "",
        "",
        "",
        null,
      ],
      [
        "2026-02-01",
        "Receita",
        "Salario",
        "Salário mensal",
        7500,
        "Conta Corrente",
        "",
        "Realizado",
        "Fev/2026",
        "",
        "",
        "",
        null,
      ],
      [
        "2026-02-03",
        "Receita",
        "Freelance",
        "Projeto web",
        1200,
        "Conta Corrente",
        "",
        "Realizado",
        "Fev/2026",
        "",
        "",
        "",
        null,
      ],
      [
        "2026-03-01",
        "Receita",
        "Salario",
        "Salário mensal",
        7500,
        "Conta Corrente",
        "",
        "Realizado",
        "Mar/2026",
        "",
        "",
        "",
        null,
      ],
      [
        "2026-03-10",
        "Despesa",
        "Educacao",
        "Notebook - parcela 1/12",
        400,
        "Cartão Nubank",
        "",
        "Realizado",
        "Mar/2026",
        "Notebook",
        "1/12",
        "Notebook",
        null,
      ],
      [
        "2026-06-01",
        "Receita",
        "Salario",
        "Salário mensal",
        7800,
        "Conta Corrente",
        "",
        "Realizado",
        "Jun/2026",
        "",
        "",
        "",
        null,
      ],
    ];
    for (const ex of exemplos) insert.run(...ex);
  }

  // Sincronizar limites dos cartões com os lançamentos existentes
  atualizarLimitesCartoes();
}

// ---------- CRUD Lancamentos ----------
function getLancamentos() {
  return db.prepare("SELECT * FROM lancamentos ORDER BY data DESC").all();
}

function insertLancamento(data) {
  const stmt = db.prepare(`INSERT INTO lancamentos 
    (data, tipo, categoria, descricao, valor, meio, destino, status, mes, compra, parcela, observacoes, parcelamento_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const result = stmt.run(
    data.data,
    data.tipo,
    data.categoria,
    data.descricao,
    data.valor,
    data.meio,
    data.destino || "",
    data.status,
    data.mes,
    data.compra || "",
    data.parcela || "",
    data.observacoes || "",
    data.parcelamento_id || null,
  );
  atualizarLimitesCartoes();
  return result;
}

function updateLancamento(id, data) {
  const stmt = db.prepare(`UPDATE lancamentos SET 
    data=?, tipo=?, categoria=?, descricao=?, valor=?, meio=?, destino=?, status=?, mes=?, compra=?, parcela=?, observacoes=?, parcelamento_id=?
    WHERE id=?`);
  const result = stmt.run(
    data.data,
    data.tipo,
    data.categoria,
    data.descricao,
    data.valor,
    data.meio,
    data.destino || "",
    data.status,
    data.mes,
    data.compra || "",
    data.parcela || "",
    data.observacoes || "",
    data.parcelamento_id || null,
    id,
  );
  atualizarLimitesCartoes();
  return result;
}

function deleteLancamento(id) {
  const result = db.prepare("DELETE FROM lancamentos WHERE id=?").run(id);
  atualizarLimitesCartoes();
  return result;
}

// ---------- CRUD Parcelamentos com sincronização ----------
function getParcelamentos() {
  return db.prepare("SELECT * FROM parcelamentos ORDER BY inicio DESC").all();
}

function insertParcelamento(data) {
  const stmt = db.prepare(`INSERT INTO parcelamentos 
    (compra, categoria, cartao, data_compra, valor_total, qtd_parcelas, valor_parcela, inicio, status, obs)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const result = stmt.run(
    data.compra,
    data.categoria,
    data.cartao,
    data.data_compra,
    data.valor_total,
    data.qtd_parcelas,
    data.valor_parcela,
    data.inicio,
    data.status,
    data.obs,
  );
  const id = result.lastInsertRowid;
  sincronizarParcelamento(id);
  return result;
}

function updateParcelamento(id, data) {
  const stmt = db.prepare(`UPDATE parcelamentos SET 
    compra=?, categoria=?, cartao=?, data_compra=?, valor_total=?, qtd_parcelas=?, valor_parcela=?, inicio=?, status=?, obs=?
    WHERE id=?`);
  const result = stmt.run(
    data.compra,
    data.categoria,
    data.cartao,
    data.data_compra,
    data.valor_total,
    data.qtd_parcelas,
    data.valor_parcela,
    data.inicio,
    data.status,
    data.obs,
    id,
  );
  sincronizarParcelamento(id);
  return result;
}

function deleteParcelamento(id) {
  removerLancamentosPorParcelamento(id);
  const result = db.prepare("DELETE FROM parcelamentos WHERE id=?").run(id);
  atualizarLimitesCartoes();
  return result;
}

function removerLancamentosPorParcelamento(parcelamentoId) {
  return db
    .prepare("DELETE FROM lancamentos WHERE parcelamento_id = ?")
    .run(parcelamentoId);
}

function gerarParcelas(parcelamento) {
  const {
    id,
    compra,
    categoria,
    cartao,
    data_compra,
    valor_parcela,
    qtd_parcelas,
    inicio,
    status,
    obs,
  } = parcelamento;
  const lancamentos = [];
  const dtInicio = new Date(inicio);
  for (let i = 0; i < qtd_parcelas; i++) {
    const dtParcela = new Date(dtInicio);
    dtParcela.setMonth(dtParcela.getMonth() + i);
    const ano = dtParcela.getFullYear();
    const mes = String(dtParcela.getMonth() + 1).padStart(2, "0");
    const dia = String(dtParcela.getDate()).padStart(2, "0");
    const dataStr = `${ano}-${mes}-${dia}`;
    const mesRef = `${["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][dtParcela.getMonth()]}/${ano}`;
    const parcelaStr = `${i + 1}/${qtd_parcelas}`;
    lancamentos.push({
      data: dataStr,
      tipo: "Despesa",
      categoria: categoria,
      descricao: `${compra} - parcela ${parcelaStr}`,
      valor: valor_parcela,
      meio: cartao,
      destino: "",
      status: status,
      mes: mesRef,
      compra: compra,
      parcela: parcelaStr,
      observacoes: obs || "",
      parcelamento_id: id,
    });
  }
  return lancamentos;
}

function sincronizarParcelamento(parcelamentoId) {
  const parcelamento = db
    .prepare("SELECT * FROM parcelamentos WHERE id = ?")
    .get(parcelamentoId);
  if (!parcelamento) return;
  removerLancamentosPorParcelamento(parcelamentoId);
  const lancamentos = gerarParcelas(parcelamento);
  const insert = db.prepare(`INSERT INTO lancamentos 
    (data, tipo, categoria, descricao, valor, meio, destino, status, mes, compra, parcela, observacoes, parcelamento_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const lanc of lancamentos) {
    insert.run(
      lanc.data,
      lanc.tipo,
      lanc.categoria,
      lanc.descricao,
      lanc.valor,
      lanc.meio,
      lanc.destino,
      lanc.status,
      lanc.mes,
      lanc.compra,
      lanc.parcela,
      lanc.observacoes,
      lanc.parcelamento_id,
    );
  }
  atualizarLimitesCartoes();
}

// ---------- CRUD Metas ----------
function getMetas() {
  return db.prepare("SELECT * FROM metas ORDER BY id").all();
}

function insertMeta(data) {
  const stmt = db.prepare(`INSERT INTO metas 
    (meta, objetivo, atual, prazo, aporte_mensal, progresso, status, categoria, observacoes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  return stmt.run(
    data.meta,
    data.objetivo,
    data.atual,
    data.prazo,
    data.aporte_mensal,
    data.progresso,
    data.status,
    data.categoria,
    data.observacoes,
  );
}

function updateMeta(id, data) {
  const stmt = db.prepare(`UPDATE metas SET 
    meta=?, objetivo=?, atual=?, prazo=?, aporte_mensal=?, progresso=?, status=?, categoria=?, observacoes=?
    WHERE id=?`);
  return stmt.run(
    data.meta,
    data.objetivo,
    data.atual,
    data.prazo,
    data.aporte_mensal,
    data.progresso,
    data.status,
    data.categoria,
    data.observacoes,
    id,
  );
}

function deleteMeta(id) {
  return db.prepare("DELETE FROM metas WHERE id=?").run(id);
}

// ---------- CRUD Contas Bancárias ----------
function getContasBancarias() {
  return db.prepare("SELECT * FROM contas_bancarias ORDER BY nome").all();
}

function insertContaBancaria(data) {
  const stmt = db.prepare(
    "INSERT INTO contas_bancarias (nome, tipo, saldo_inicial, observacoes, cor) VALUES (?, ?, ?, ?, ?)",
  );
  return stmt.run(
    data.nome,
    data.tipo,
    data.saldo_inicial || 0,
    data.observacoes || "",
    data.cor || "#C4A882",
  );
}

function updateContaBancaria(id, data) {
  const stmt = db.prepare(
    "UPDATE contas_bancarias SET nome=?, tipo=?, saldo_inicial=?, observacoes=?, cor=? WHERE id=?",
  );
  return stmt.run(
    data.nome,
    data.tipo,
    data.saldo_inicial || 0,
    data.observacoes || "",
    data.cor || "#C4A882",
    id,
  );
}

function deleteContaBancaria(id) {
  return db.prepare("DELETE FROM contas_bancarias WHERE id=?").run(id);
}

// ---------- CRUD Cartões de Crédito ----------
function getCartoesCredito() {
  return db.prepare("SELECT * FROM cartoes_credito ORDER BY nome").all();
}

function insertCartaoCredito(data) {
  const stmt = db.prepare(
    "INSERT INTO cartoes_credito (nome, limite, dia_fechamento, dia_vencimento, observacoes, cor, limite_utilizado) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  return stmt.run(
    data.nome,
    data.limite || 0,
    data.dia_fechamento || 0,
    data.dia_vencimento || 0,
    data.observacoes || "",
    data.cor || "#D4A373",
    data.limite_utilizado || 0,
  );
}

function updateCartaoCredito(id, data) {
  const stmt = db.prepare(
    "UPDATE cartoes_credito SET nome=?, limite=?, dia_fechamento=?, dia_vencimento=?, observacoes=?, cor=?, limite_utilizado=? WHERE id=?",
  );
  return stmt.run(
    data.nome,
    data.limite || 0,
    data.dia_fechamento || 0,
    data.dia_vencimento || 0,
    data.observacoes || "",
    data.cor || "#D4A373",
    data.limite_utilizado || 0,
    id,
  );
}

function deleteCartaoCredito(id) {
  return db.prepare("DELETE FROM cartoes_credito WHERE id=?").run(id);
}

// ---------- Configurações (listas) ----------
function getLista(nome) {
  return db
    .prepare(
      "SELECT id, valor FROM config_listas WHERE nome_lista = ? ORDER BY valor",
    )
    .all(nome);
}

function addToLista(nome, valor) {
  const exist = db
    .prepare("SELECT 1 FROM config_listas WHERE nome_lista = ? AND valor = ?")
    .get(nome, valor);
  if (!exist) {
    return db
      .prepare("INSERT INTO config_listas (nome_lista, valor) VALUES (?, ?)")
      .run(nome, valor);
  }
  return null;
}

function removeFromLista(id) {
  return db.prepare("DELETE FROM config_listas WHERE id=?").run(id);
}

// ---------- Dashboard Mensal ----------
function getResumoMes(mes) {
  const receitas = db
    .prepare(
      "SELECT SUM(valor) as total FROM lancamentos WHERE tipo='Receita' AND mes=? AND status='Realizado'",
    )
    .get(mes);
  const despesas = db
    .prepare(
      "SELECT SUM(valor) as total FROM lancamentos WHERE tipo='Despesa' AND mes=? AND status='Realizado'",
    )
    .get(mes);
  return {
    receitas: receitas.total || 0,
    despesas: despesas.total || 0,
    saldo: (receitas.total || 0) - (despesas.total || 0),
  };
}

function getDespesasPorCategoria(mes) {
  return db
    .prepare(
      `
    SELECT categoria, SUM(valor) as total 
    FROM lancamentos 
    WHERE tipo='Despesa' AND mes=? AND status='Realizado' 
    GROUP BY categoria
  `,
    )
    .all(mes);
}

function getExtratoMensal() {
  const meses = db
    .prepare("SELECT DISTINCT mes FROM lancamentos ORDER BY mes")
    .all();
  const resultado = [];
  for (const row of meses) {
    const mes = row.mes;
    const receitas = db
      .prepare(
        "SELECT SUM(valor) as total FROM lancamentos WHERE tipo='Receita' AND mes=? AND status='Realizado'",
      )
      .get(mes);
    const despesas = db
      .prepare(
        "SELECT SUM(valor) as total FROM lancamentos WHERE tipo='Despesa' AND mes=? AND status='Realizado'",
      )
      .get(mes);
    resultado.push({
      mes,
      receitas: receitas.total || 0,
      despesas: despesas.total || 0,
      saldo: (receitas.total || 0) - (despesas.total || 0),
    });
  }
  return resultado;
}

function getUltimosLancamentos(limit = 10, mes = null) {
  let sql = "SELECT * FROM lancamentos";
  const params = [];
  if (mes) {
    sql += " WHERE mes = ?";
    params.push(mes);
  }
  sql += " ORDER BY data DESC LIMIT ?";
  params.push(limit);
  return db.prepare(sql).all(...params);
}

// ---------- Dashboard Geral ----------
function getResumoGeral() {
  const receitas = db
    .prepare(
      "SELECT SUM(valor) as total FROM lancamentos WHERE tipo='Receita' AND status='Realizado'",
    )
    .get();
  const despesas = db
    .prepare(
      "SELECT SUM(valor) as total FROM lancamentos WHERE tipo='Despesa' AND status='Realizado'",
    )
    .get();
  return {
    receitas: receitas.total || 0,
    despesas: despesas.total || 0,
    saldo: (receitas.total || 0) - (despesas.total || 0),
  };
}

function getCategoriasGeral() {
  return db
    .prepare(
      `
    SELECT categoria, SUM(valor) as total 
    FROM lancamentos 
    WHERE tipo='Despesa' AND status='Realizado' 
    GROUP BY categoria 
    ORDER BY total DESC
  `,
    )
    .all();
}

function getUltimosLancamentosGeral(limit = 10) {
  return db
    .prepare("SELECT * FROM lancamentos ORDER BY data DESC LIMIT ?")
    .all(limit);
}

// ---------- Sincronização de Limites dos Cartões ----------
function atualizarLimitesCartoes() {
  const cartoes = db.prepare("SELECT id, nome FROM cartoes_credito").all();
  for (const cartao of cartoes) {
    const total = db
      .prepare(
        "SELECT SUM(valor) as total FROM lancamentos WHERE tipo='Despesa' AND meio = ? AND status='Realizado'",
      )
      .get(cartao.nome);
    const utilizado = total.total || 0;
    db.prepare(
      "UPDATE cartoes_credito SET limite_utilizado = ? WHERE id = ?",
    ).run(utilizado, cartao.id);
  }
}

module.exports = {
  initDatabase,
  getLancamentos,
  insertLancamento,
  updateLancamento,
  deleteLancamento,
  getParcelamentos,
  insertParcelamento,
  updateParcelamento,
  deleteParcelamento,
  getMetas,
  insertMeta,
  updateMeta,
  deleteMeta,
  getContasBancarias,
  insertContaBancaria,
  updateContaBancaria,
  deleteContaBancaria,
  getCartoesCredito,
  insertCartaoCredito,
  updateCartaoCredito,
  deleteCartaoCredito,
  getLista,
  addToLista,
  removeFromLista,
  getResumoMes,
  getDespesasPorCategoria,
  getExtratoMensal,
  getUltimosLancamentos,
  getResumoGeral,
  getCategoriasGeral,
  getUltimosLancamentosGeral,
  atualizarLimitesCartoes,
};
