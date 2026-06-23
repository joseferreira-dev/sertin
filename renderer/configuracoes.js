async function carregarConfiguracoes() {
  const container = document.getElementById("configuracoes-container");
  try {
    const listas = ["receitas", "despesas", "status", "tipos"];
    const cores = {
      receitas: "#10b981",
      despesas: "#ef4444",
      status: "#3b82f6",
      tipos: "#8b5cf6",
    };
    const icones = {
      receitas: "fa-arrow-up",
      despesas: "fa-arrow-down",
      status: "fa-circle",
      tipos: "fa-tag",
    };

    let html = `<div class="config-grid">`;
    for (const nome of listas) {
      const itens = await window.api.getLista(nome);
      const cor = cores[nome] || "#8b5cf6";
      const icone = icones[nome] || "fa-list";
      const label = nome.charAt(0).toUpperCase() + nome.slice(1);

      html += `
        <div class="config-group">
          <h4><i class="fas ${icone}" style="color:${cor}"></i> ${label}</h4>
          <ul>
            ${itens
              .map(
                (item) => `
              <li>
                <span>${item.valor}</span>
                <span class="tag" style="background:${cor}20; color:${cor}">${nome}</span>
                <button class="btn btn-sm btn-danger" onclick="removerItemLista(${item.id}, '${nome}')">
                  <i class="fas fa-times"></i>
                </button>
              </li>
            `,
              )
              .join("")}
          </ul>
          <div class="config-add">
            <input type="text" id="input-${nome}" placeholder="Adicionar novo ${label.toLowerCase()}" />
            <button class="btn btn-sm btn-success" onclick="adicionarItemLista('${nome}')">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      `;
    }
    html += `</div>`;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p>Erro ao carregar configurações.</p>`;
  }
}

async function adicionarItemLista(nome) {
  const input = document.getElementById(`input-${nome}`);
  const valor = input.value.trim();
  if (!valor) return alert("Digite um valor.");
  try {
    await window.api.addToLista(nome, valor);
    input.value = "";
    carregarConfiguracoes();
  } catch (err) {
    alert("Erro ao adicionar: " + err.message);
  }
}

async function removerItemLista(id, nome) {
  if (!confirm("Remover este item?")) return;
  try {
    await window.api.removeFromLista(id);
    carregarConfiguracoes();
  } catch (err) {
    alert("Erro ao remover: " + err.message);
  }
}
