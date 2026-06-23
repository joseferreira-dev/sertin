let parcelamentosData = [];

async function carregarParcelamentos() {
  const container = document.getElementById("parcelamentos-container");
  try {
    parcelamentosData = await window.api.getParcelamentos();
    renderParcelamentos();
  } catch (err) {
    container.innerHTML = `<p>Erro ao carregar parcelamentos.</p>`;
  }
}

function renderParcelamentos() {
  const container = document.getElementById("parcelamentos-container");
  let html = `<button class="btn" onclick="mostrarModalParcelamento()"><i class="fas fa-plus"></i> Nova Compra Parcelada</button>
    <div class="card" style="margin-top:16px;"><table>
    <thead><tr><th>Compra</th><th>Categoria</th><th>Cartão</th><th>Valor Total</th><th>Parcelas</th><th>Valor Parcela</th><th>Início</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
  if (parcelamentosData.length) {
    parcelamentosData.forEach((p) => {
      html += `<tr>
        <td>${p.compra}</td>
        <td>${p.categoria}</td>
        <td>${p.cartao}</td>
        <td>R$ ${p.valor_total.toFixed(2)}</td>
        <td>${p.qtd_parcelas}</td>
        <td>R$ ${p.valor_parcela.toFixed(2)}</td>
        <td>${p.inicio}</td>
        <td>${p.status}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="editarParcelamento(${p.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger" onclick="excluirParcelamento(${p.id})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
    });
  } else {
    html += `<tr><td colspan="9">Nenhum parcelamento.</td></tr>`;
  }
  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

function mostrarModalParcelamento(dados = null) {
  const modal = document.createElement("div");
  modal.className = "modal active";
  modal.id = "modal-parcelamento";
  const isEdit = !!dados;
  const title = isEdit ? "Editar Parcelamento" : "Novo Parcelamento";

  Promise.all([
    window.api.getLista("despesas"),
    window.api.getCartoes(),
    window.api.getLista("status"),
  ]).then(([categorias, cartoes, statusList]) => {
    const data = dados || {
      compra: "",
      categoria: "",
      cartao: "",
      data_compra: "",
      valor_total: "",
      qtd_parcelas: "",
      status: "Ativo",
      obs: "",
    };

    modal.innerHTML = `
      <div class="modal-content">
        <h3>${title}</h3>
        <form id="form-parcelamento">
          <div class="form-row">
            <div class="form-group"><label>Compra</label><input type="text" id="p-compra" value="${data.compra || ""}" required /></div>
            <div class="form-group"><label>Categoria</label><select id="p-categoria" required><option value="">Selecione</option>${categorias.map((c) => `<option value="${c.valor}" ${c.valor === data.categoria ? "selected" : ""}>${c.valor}</option>`).join("")}</select></div>
            <div class="form-group"><label>Cartão</label><select id="p-cartao" required><option value="">Selecione</option>${cartoes.map((c) => `<option value="${c.nome}" ${c.nome === data.cartao ? "selected" : ""}>${c.nome}</option>`).join("")}</select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Data da Compra</label><input type="date" id="p-data_compra" value="${data.data_compra || ""}" required /></div>
            <div class="form-group"><label>Valor Total (R$)</label><input type="number" step="0.01" id="p-valor_total" value="${data.valor_total || ""}" required /></div>
            <div class="form-group"><label>Qtd Parcelas</label><input type="number" id="p-qtd_parcelas" value="${data.qtd_parcelas || ""}" required /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Valor Parcela (calculado)</label><input type="number" step="0.01" id="p-valor_parcela" value="${data.valor_parcela || ""}" readonly style="background:#f0f0f0;" /></div>
            <div class="form-group"><label>Início (calculado: data compra + 1 mês)</label><input type="date" id="p-inicio" value="${data.inicio || ""}" readonly style="background:#f0f0f0;" /></div>
            <div class="form-group"><label>Status</label><select id="p-status" required>${statusList.map((s) => `<option value="${s.valor}" ${s.valor === data.status ? "selected" : ""}>${s.valor}</option>`).join("")}</select></div>
          </div>
          <div class="form-group"><label>Observações</label><input type="text" id="p-obs" value="${data.obs || ""}" /></div>
          <div class="modal-actions">
            <button type="button" class="btn" onclick="fecharModal('modal-parcelamento')"><i class="fas fa-times"></i> Cancelar</button>
            <button type="submit" class="btn btn-success"><i class="fas fa-save"></i> Salvar</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    function calcularParcela() {
      const total =
        parseFloat(document.getElementById("p-valor_total").value) || 0;
      const qtd =
        parseInt(document.getElementById("p-qtd_parcelas").value) || 1;
      if (qtd > 0) {
        document.getElementById("p-valor_parcela").value = (
          total / qtd
        ).toFixed(2);
      }
      const dataCompra = document.getElementById("p-data_compra").value;
      if (dataCompra) {
        const dt = new Date(dataCompra);
        dt.setMonth(dt.getMonth() + 1);
        const ano = dt.getFullYear();
        const mes = String(dt.getMonth() + 1).padStart(2, "0");
        const dia = String(dt.getDate()).padStart(2, "0");
        document.getElementById("p-inicio").value = `${ano}-${mes}-${dia}`;
      }
    }
    document
      .getElementById("p-valor_total")
      .addEventListener("input", calcularParcela);
    document
      .getElementById("p-qtd_parcelas")
      .addEventListener("input", calcularParcela);
    document
      .getElementById("p-data_compra")
      .addEventListener("change", calcularParcela);
    calcularParcela();

    document
      .getElementById("form-parcelamento")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = {
          compra: document.getElementById("p-compra").value,
          categoria: document.getElementById("p-categoria").value,
          cartao: document.getElementById("p-cartao").value,
          data_compra: document.getElementById("p-data_compra").value,
          valor_total: parseFloat(
            document.getElementById("p-valor_total").value,
          ),
          qtd_parcelas: parseInt(
            document.getElementById("p-qtd_parcelas").value,
          ),
          valor_parcela: parseFloat(
            document.getElementById("p-valor_parcela").value,
          ),
          inicio: document.getElementById("p-inicio").value,
          status: document.getElementById("p-status").value,
          obs: document.getElementById("p-obs").value,
        };
        try {
          if (isEdit) await window.api.updateParcelamento(dados.id, formData);
          else await window.api.insertParcelamento(formData);
          fecharModal("modal-parcelamento");
          carregarParcelamentos();
        } catch (err) {
          alert("Erro ao salvar: " + err.message);
        }
      });
  });
}

function editarParcelamento(id) {
  const p = parcelamentosData.find((p) => p.id === id);
  if (p) mostrarModalParcelamento(p);
}

async function excluirParcelamento(id) {
  if (confirm("Excluir este parcelamento?")) {
    try {
      await window.api.deleteParcelamento(id);
      carregarParcelamentos();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  }
}
