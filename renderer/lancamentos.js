let lancamentosData = [];

async function carregarLancamentos() {
  const container = document.getElementById("lancamentos-container");
  const { mes, ano } = getFiltro();
  try {
    const todos = await window.api.getLancamentos();
    let filtrados = todos;
    if (mes !== "todos" && ano !== "todos")
      filtrados = todos.filter((l) => l.mes === `${mes}/${ano}`);
    else if (mes !== "todos")
      filtrados = todos.filter((l) => l.mes.startsWith(mes));
    else if (ano !== "todos")
      filtrados = todos.filter((l) => l.mes.endsWith(`/${ano}`));
    lancamentosData = filtrados;
    renderLancamentos();
  } catch (err) {
    container.innerHTML = `<p>Erro ao carregar lançamentos.</p>`;
  }
}

function renderLancamentos() {
  const container = document.getElementById("lancamentos-container");
  let html = `<button class="btn" onclick="mostrarModalLancamento()"><i class="fas fa-plus"></i> Novo Lançamento</button>
    <div class="card" style="margin-top:16px;"><table>
    <thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th>Meio</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
  if (lancamentosData.length) {
    lancamentosData.forEach((l) => {
      html += `<tr>
        <td>${l.data}</td>
        <td>${l.tipo}</td>
        <td>${l.categoria}</td>
        <td>${l.descricao}</td>
        <td>R$ ${l.valor.toFixed(2)}</td>
        <td>${l.meio}</td>
        <td>${l.status}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="editarLancamento(${l.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger" onclick="excluirLancamento(${l.id})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
    });
  } else {
    html += `<tr><td colspan="8">Nenhum lançamento para os filtros atuais.</td></tr>`;
  }
  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

function mostrarModalLancamento(dados = null) {
  const modal = document.createElement("div");
  modal.className = "modal active";
  modal.id = "modal-lancamento";
  const isEdit = !!dados;
  const title = isEdit ? "Editar Lançamento" : "Novo Lançamento";

  Promise.all([
    window.api.getLista("tipos"),
    window.api.getLista("despesas"),
    window.api.getLista("receitas"),
    window.api.getLista("status"),
    window.api.getContas(),
    window.api.getCartoes(),
  ]).then(([tipos, despesas, receitas, statusList, contas, cartoes]) => {
    const categorias = [
      ...receitas.map((r) => r.valor),
      ...despesas.map((d) => d.valor),
    ];
    const meios = [...contas.map((c) => c.nome), ...cartoes.map((c) => c.nome)];
    const statusOpt = statusList.map((s) => s.valor);

    const data = dados || {
      data: "",
      tipo: "",
      categoria: "",
      descricao: "",
      valor: "",
      meio: "",
      status: "Pendente",
      observacoes: "",
    };

    modal.innerHTML = `
      <div class="modal-content">
        <h3>${title}</h3>
        <form id="form-lancamento">
          <div class="form-row">
            <div class="form-group"><label>Data</label><input type="date" id="l-data" value="${data.data || ""}" required /></div>
            <div class="form-group"><label>Tipo</label><select id="l-tipo" required><option value="">Selecione</option>${tipos.map((t) => `<option value="${t.valor}" ${t.valor === data.tipo ? "selected" : ""}>${t.valor}</option>`).join("")}</select></div>
            <div class="form-group"><label>Categoria</label><select id="l-categoria" required><option value="">Selecione</option>${categorias.map((c) => `<option value="${c}" ${c === data.categoria ? "selected" : ""}>${c}</option>`).join("")}</select></div>
          </div>
          <div class="form-group"><label>Descrição</label><input type="text" id="l-descricao" value="${data.descricao || ""}" required /></div>
          <div class="form-row">
            <div class="form-group"><label>Valor (R$)</label><input type="number" step="0.01" id="l-valor" value="${data.valor || ""}" required /></div>
            <div class="form-group"><label>Meio</label><select id="l-meio"><option value="">Selecione</option>${meios.map((m) => `<option value="${m}" ${m === data.meio ? "selected" : ""}>${m}</option>`).join("")}</select></div>
            <div class="form-group"><label>Status</label><select id="l-status" required>${statusOpt.map((s) => `<option value="${s}" ${s === data.status ? "selected" : ""}>${s}</option>`).join("")}</select></div>
          </div>
          <div class="form-group"><label>Observações</label><textarea id="l-observacoes">${data.observacoes || ""}</textarea></div>
          <div class="modal-actions"><button type="button" class="btn" onclick="fecharModal('modal-lancamento')"><i class="fas fa-times"></i> Cancelar</button><button type="submit" class="btn btn-success"><i class="fas fa-save"></i> Salvar</button></div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document
      .getElementById("form-lancamento")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const { mes, ano } = getFiltro();
        let mesFinal = "";
        if (mes !== "todos" && ano !== "todos") mesFinal = `${mes}/${ano}`;
        else {
          const dataVal = document.getElementById("l-data").value;
          if (dataVal) {
            const dt = new Date(dataVal);
            const meses = [
              "Jan",
              "Fev",
              "Mar",
              "Abr",
              "Mai",
              "Jun",
              "Jul",
              "Ago",
              "Set",
              "Out",
              "Nov",
              "Dez",
            ];
            mesFinal = `${meses[dt.getMonth()]}/${dt.getFullYear()}`;
          }
        }
        const formData = {
          data: document.getElementById("l-data").value,
          tipo: document.getElementById("l-tipo").value,
          categoria: document.getElementById("l-categoria").value,
          descricao: document.getElementById("l-descricao").value,
          valor: parseFloat(document.getElementById("l-valor").value),
          meio: document.getElementById("l-meio").value,
          status: document.getElementById("l-status").value,
          mes: mesFinal,
          observacoes: document.getElementById("l-observacoes").value,
        };
        try {
          if (isEdit) await window.api.updateLancamento(dados.id, formData);
          else await window.api.insertLancamento(formData);
          fecharModal("modal-lancamento");
          carregarLancamentos();
          if (
            document
              .getElementById("view-dashboard")
              .classList.contains("active")
          )
            carregarDashboard();
        } catch (err) {
          alert("Erro ao salvar: " + err.message);
        }
      });
  });
}

function editarLancamento(id) {
  const lanc = lancamentosData.find((l) => l.id === id);
  if (lanc) mostrarModalLancamento(lanc);
}

async function excluirLancamento(id) {
  if (confirm("Tem certeza que deseja excluir este lançamento?")) {
    try {
      await window.api.deleteLancamento(id);
      carregarLancamentos();
      if (
        document.getElementById("view-dashboard").classList.contains("active")
      )
        carregarDashboard();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  }
}
