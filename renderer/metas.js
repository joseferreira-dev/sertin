let metasData = [];

async function carregarMetas() {
  const container = document.getElementById("metas-container");
  try {
    metasData = await window.api.getMetas();
    renderMetas();
  } catch (err) {
    container.innerHTML = `<p>Erro ao carregar metas.</p>`;
  }
}

function renderMetas() {
  const container = document.getElementById("metas-container");
  let html = `<button class="btn" onclick="mostrarModalMeta()"><i class="fas fa-plus"></i> Nova Meta</button>
    <div class="card" style="margin-top:16px;"><table>
    <thead><tr><th>Meta</th><th>Objetivo</th><th>Atual</th><th>Prazo</th><th>Progresso</th><th>Status</th><th>Ações</th></tr></thead><tbody>`;
  if (metasData.length) {
    metasData.forEach((m) => {
      const prog = m.progresso ? (m.progresso * 100).toFixed(0) + "%" : "0%";
      html += `<tr>
        <td>${m.meta}</td>
        <td>R$ ${m.objetivo.toFixed(2)}</td>
        <td>R$ ${m.atual.toFixed(2)}</td>
        <td>${m.prazo}</td>
        <td>${prog}</td>
        <td>${m.status}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="editarMeta(${m.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger" onclick="excluirMeta(${m.id})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
    });
  } else {
    html += `<tr><td colspan="7">Nenhuma meta.</td></tr>`;
  }
  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

function mostrarModalMeta(dados = null) {
  const modal = document.createElement("div");
  modal.className = "modal active";
  modal.id = "modal-meta";
  const isEdit = !!dados;
  const title = isEdit ? "Editar Meta" : "Nova Meta";

  Promise.all([window.api.getLista("status")]).then(([statusList]) => {
    const data = dados || {
      meta: "",
      objetivo: "",
      atual: "",
      prazo: "",
      aporte_mensal: "",
      status: "Em andamento",
      observacoes: "",
    };

    modal.innerHTML = `
      <div class="modal-content">
        <h3>${title}</h3>
        <form id="form-meta">
          <div class="form-group"><label>Meta</label><input type="text" id="m-meta" value="${data.meta || ""}" required /></div>
          <div class="form-row">
            <div class="form-group"><label>Objetivo (R$)</label><input type="number" step="0.01" id="m-objetivo" value="${data.objetivo || ""}" required /></div>
            <div class="form-group"><label>Atual (R$)</label><input type="number" step="0.01" id="m-atual" value="${data.atual || ""}" required /></div>
            <div class="form-group"><label>Aporte Mensal (R$)</label><input type="number" step="0.01" id="m-aporte" value="${data.aporte_mensal || ""}" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Prazo</label><input type="date" id="m-prazo" value="${data.prazo || ""}" required /></div>
            <div class="form-group"><label>Status</label><select id="m-status" required>${statusList.map((s) => `<option value="${s.valor}" ${s.valor === data.status ? "selected" : ""}>${s.valor}</option>`).join("")}</select></div>
          </div>
          <div class="form-group"><label>Observações</label><input type="text" id="m-observacoes" value="${data.observacoes || ""}" /></div>
          <div class="modal-actions">
            <button type="button" class="btn" onclick="fecharModal('modal-meta')"><i class="fas fa-times"></i> Cancelar</button>
            <button type="submit" class="btn btn-success"><i class="fas fa-save"></i> Salvar</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document
      .getElementById("form-meta")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const objetivo = parseFloat(
          document.getElementById("m-objetivo").value,
        );
        const atual = parseFloat(document.getElementById("m-atual").value);
        const progresso = objetivo > 0 ? atual / objetivo : 0;
        const formData = {
          meta: document.getElementById("m-meta").value,
          objetivo: objetivo,
          atual: atual,
          prazo: document.getElementById("m-prazo").value,
          aporte_mensal:
            parseFloat(document.getElementById("m-aporte").value) || 0,
          progresso: progresso,
          status: document.getElementById("m-status").value,
          categoria: "Aporte Meta",
          observacoes: document.getElementById("m-observacoes").value,
        };
        try {
          if (isEdit) await window.api.updateMeta(dados.id, formData);
          else await window.api.insertMeta(formData);
          fecharModal("modal-meta");
          carregarMetas();
        } catch (err) {
          alert("Erro ao salvar: " + err.message);
        }
      });
  });
}

function editarMeta(id) {
  const m = metasData.find((m) => m.id === id);
  if (m) mostrarModalMeta(m);
}

async function excluirMeta(id) {
  if (confirm("Excluir esta meta?")) {
    try {
      await window.api.deleteMeta(id);
      carregarMetas();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  }
}
