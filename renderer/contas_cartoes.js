// ---------- CONTAS BANCÁRIAS ----------
let contasData = [];

async function carregarContas() {
  const container = document.getElementById("contas-container");
  try {
    contasData = await window.api.getContas();
    renderContas();
  } catch (err) {
    container.innerHTML = `<p>Erro ao carregar contas.</p>`;
  }
}

function renderContas() {
  const container = document.getElementById("contas-container");
  let html = `<button class="btn" onclick="mostrarModalConta()"><i class="fas fa-plus"></i> Nova Conta</button>
    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 16px;">`;
  if (contasData.length) {
    contasData.forEach((c) => {
      html += `
        <div class="conta-card" style="background: ${c.cor || "#C4A882"}; border: 1px solid #ccc; border-radius: 8px; padding: 16px; width: 220px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.3); box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 18px; font-weight: bold;">${c.nome}</span>
            <i class="fas fa-university" style="font-size: 24px;"></i>
          </div>
          <div style="margin-top: 12px;">
            <div style="font-size: 12px; opacity: 0.8;">Saldo Inicial</div>
            <div style="font-size: 18px; font-weight: 600;">R$ ${c.saldo_inicial.toFixed(2)}</div>
          </div>
          ${c.tipo ? `<div style="margin-top: 6px; font-size: 13px; opacity: 0.9;">${c.tipo}</div>` : ""}
          ${c.observacoes ? `<div style="margin-top: 8px; font-size: 12px; opacity: 0.9; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 6px;">${c.observacoes}</div>` : ""}
          <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end;">
            <button class="btn btn-sm btn-success" onclick="editarConta(${c.id})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger" onclick="excluirConta(${c.id})"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `;
    });
  } else {
    html += `<p style="width:100%; text-align:center; color: var(--text-secondary);">Nenhuma conta cadastrada.</p>`;
  }
  html += `</div>`;
  container.innerHTML = html;
}

function mostrarModalConta(dados = null) {
  const modal = document.createElement("div");
  modal.className = "modal active";
  modal.id = "modal-conta";
  const isEdit = !!dados;
  const title = isEdit ? "Editar Conta" : "Nova Conta";
  const data = dados || {
    nome: "",
    tipo: "",
    saldo_inicial: "",
    observacoes: "",
    cor: "#C4A882",
  };

  modal.innerHTML = `
    <div class="modal-content">
      <h3>${title}</h3>
      <form id="form-conta">
        <div class="form-group"><label>Nome</label><input type="text" id="c-nome" value="${data.nome || ""}" required /></div>
        <div class="form-row">
          <div class="form-group"><label>Tipo</label><input type="text" id="c-tipo" value="${data.tipo || ""}" placeholder="ex: Corrente, Poupança, Dinheiro" /></div>
          <div class="form-group"><label>Saldo Inicial (R$)</label><input type="number" step="0.01" id="c-saldo" value="${data.saldo_inicial || ""}" /></div>
        </div>
        <div class="form-group"><label>Cor da Conta</label><input type="color" id="c-cor" value="${data.cor || "#C4A882"}" /></div>
        <div class="form-group"><label>Observações</label><input type="text" id="c-obs" value="${data.observacoes || ""}" /></div>
        <div class="modal-actions">
          <button type="button" class="btn" onclick="fecharModal('modal-conta')">Cancelar</button>
          <button type="submit" class="btn btn-success">Salvar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document
    .getElementById("form-conta")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = {
        nome: document.getElementById("c-nome").value,
        tipo: document.getElementById("c-tipo").value,
        saldo_inicial:
          parseFloat(document.getElementById("c-saldo").value) || 0,
        cor: document.getElementById("c-cor").value,
        observacoes: document.getElementById("c-obs").value,
      };
      try {
        if (isEdit) await window.api.updateConta(dados.id, formData);
        else await window.api.insertConta(formData);
        fecharModal("modal-conta");
        carregarContas();
      } catch (err) {
        alert("Erro ao salvar: " + err.message);
      }
    });
}

function editarConta(id) {
  const c = contasData.find((c) => c.id === id);
  if (c) mostrarModalConta(c);
}

async function excluirConta(id) {
  if (confirm("Excluir esta conta?")) {
    try {
      await window.api.deleteConta(id);
      carregarContas();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  }
}

// ---------- CARTÕES DE CRÉDITO ----------
let cartoesData = [];

async function carregarCartoes() {
  const container = document.getElementById("cartoes-container");
  try {
    cartoesData = await window.api.getCartoes();
    renderCartoes();
  } catch (err) {
    container.innerHTML = `<p>Erro ao carregar cartões.</p>`;
  }
}

function renderCartoes() {
  const container = document.getElementById("cartoes-container");
  let html = `<button class="btn" onclick="mostrarModalCartao()"><i class="fas fa-plus"></i> Novo Cartão</button>
    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 16px;">`;
  if (cartoesData.length) {
    cartoesData.forEach((c) => {
      const utilizado = c.limite_utilizado || 0;
      const disponivel = Math.max(c.limite - utilizado, 0);
      const percentual = c.limite > 0 ? (utilizado / c.limite) * 100 : 0;
      let barraCor = "var(--green)";
      if (percentual > 80) barraCor = "var(--red)";
      else if (percentual > 50) barraCor = "var(--yellow)";

      html += `
        <div class="cartao-card" style="background: ${c.cor || "#D4A373"}; border-radius: var(--radius-lg); padding: 20px; width: 240px; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.15); box-shadow: var(--shadow-md);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 18px; font-weight: bold;">${c.nome}</span>
            <i class="fas fa-credit-card" style="font-size: 24px;"></i>
          </div>
          <div style="margin-top: 12px;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <div style="font-size: 11px; opacity: 0.8;">Limite</div>
                <div style="font-size: 16px; font-weight: 600;">R$ ${c.limite.toFixed(2)}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 11px; opacity: 0.8;">Utilizado</div>
                <div style="font-size: 16px; font-weight: 600;">R$ ${utilizado.toFixed(2)}</div>
              </div>
            </div>
            <div style="margin-top: 8px;">
              <div style="font-size: 11px; opacity: 0.8;">Disponível</div>
              <div style="font-size: 18px; font-weight: 700;">R$ ${disponivel.toFixed(2)}</div>
            </div>
            <div style="margin-top: 8px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden;">
              <div style="width: ${Math.min(percentual, 100)}%; height: 100%; background: ${barraCor}; border-radius: 3px; transition: width 0.3s;"></div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <div><span style="font-size: 10px; opacity: 0.7;">Fechamento</span><br>${c.dia_fechamento || "-"}</div>
            <div><span style="font-size: 10px; opacity: 0.7;">Vencimento</span><br>${c.dia_vencimento || "-"}</div>
          </div>
          ${c.observacoes ? `<div style="margin-top: 8px; font-size: 11px; opacity: 0.9; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 6px;">${c.observacoes}</div>` : ""}
          <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end;">
            <button class="btn btn-sm btn-success" onclick="editarCartao(${c.id})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger" onclick="excluirCartao(${c.id})"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `;
    });
  } else {
    html += `<p style="width:100%; text-align:center; color: var(--text-light);">Nenhum cartão cadastrado.</p>`;
  }
  html += `</div>`;
  container.innerHTML = html;
}

function mostrarModalCartao(dados = null) {
  const modal = document.createElement("div");
  modal.className = "modal active";
  modal.id = "modal-cartao";
  const isEdit = !!dados;
  const title = isEdit ? "Editar Cartão" : "Novo Cartão";
  const data = dados || {
    nome: "",
    limite: "",
    limite_utilizado: "",
    dia_fechamento: "",
    dia_vencimento: "",
    observacoes: "",
    cor: "#D4A373",
  };

  modal.innerHTML = `
    <div class="modal-content">
      <h3>${title}</h3>
      <form id="form-cartao">
        <div class="form-group"><label>Nome</label><input type="text" id="ca-nome" value="${data.nome || ""}" required /></div>
        <div class="form-row">
          <div class="form-group"><label>Limite (R$)</label><input type="number" step="0.01" id="ca-limite" value="${data.limite || ""}" /></div>
          <div class="form-group"><label>Limite Utilizado (R$)</label><input type="number" step="0.01" id="ca-limite_utilizado" value="${data.limite_utilizado || ""}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Dia Fechamento</label><input type="number" min="1" max="31" id="ca-fechamento" value="${data.dia_fechamento || ""}" placeholder="dia" /></div>
          <div class="form-group"><label>Dia Vencimento</label><input type="number" min="1" max="31" id="ca-vencimento" value="${data.dia_vencimento || ""}" placeholder="dia" /></div>
        </div>
        <div class="form-group"><label>Cor do Cartão</label><input type="color" id="ca-cor" value="${data.cor || "#D4A373"}" /></div>
        <div class="form-group"><label>Observações</label><input type="text" id="ca-obs" value="${data.observacoes || ""}" /></div>
        <div class="modal-actions">
          <button type="button" class="btn" onclick="fecharModal('modal-cartao')">Cancelar</button>
          <button type="submit" class="btn btn-success">Salvar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document
    .getElementById("form-cartao")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = {
        nome: document.getElementById("ca-nome").value,
        limite: parseFloat(document.getElementById("ca-limite").value) || 0,
        limite_utilizado:
          parseFloat(document.getElementById("ca-limite_utilizado").value) || 0,
        dia_fechamento:
          parseInt(document.getElementById("ca-fechamento").value) || null,
        dia_vencimento:
          parseInt(document.getElementById("ca-vencimento").value) || null,
        cor: document.getElementById("ca-cor").value,
        observacoes: document.getElementById("ca-obs").value,
      };
      try {
        if (isEdit) await window.api.updateCartao(dados.id, formData);
        else await window.api.insertCartao(formData);
        fecharModal("modal-cartao");
        carregarCartoes();
      } catch (err) {
        alert("Erro ao salvar: " + err.message);
      }
    });
}

function editarCartao(id) {
  const c = cartoesData.find((c) => c.id === id);
  if (c) mostrarModalCartao(c);
}

async function excluirCartao(id) {
  if (confirm("Excluir este cartão?")) {
    try {
      await window.api.deleteCartao(id);
      carregarCartoes();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  }
}
