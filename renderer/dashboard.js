async function carregarDashboard() {
  const container = document.getElementById("dashboard-container");
  const { mes, ano } = getFiltro();
  try {
    const todos = await window.api.getLancamentos();
    let filtrados = todos.filter((l) => l.status === "Realizado");
    if (mes !== "todos")
      filtrados = filtrados.filter((l) => l.mes.startsWith(mes));
    if (ano !== "todos")
      filtrados = filtrados.filter((l) => l.mes.endsWith(`/${ano}`));

    const receitas = filtrados
      .filter((l) => l.tipo === "Receita")
      .reduce((s, l) => s + l.valor, 0);
    const despesas = filtrados
      .filter((l) => l.tipo === "Despesa")
      .reduce((s, l) => s + l.valor, 0);
    const saldo = receitas - despesas;

    const catMap = {};
    filtrados
      .filter((l) => l.tipo === "Despesa")
      .forEach(
        (l) => (catMap[l.categoria] = (catMap[l.categoria] || 0) + l.valor),
      );
    const categorias = Object.entries(catMap)
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);

    const mesMap = {};
    filtrados.forEach((l) => {
      mesMap[l.mes] = mesMap[l.mes] || { receitas: 0, despesas: 0 };
      if (l.tipo === "Receita") mesMap[l.mes].receitas += l.valor;
      else if (l.tipo === "Despesa") mesMap[l.mes].despesas += l.valor;
    });
    const evolucao = Object.entries(mesMap)
      .map(([m, v]) => ({
        mes: m,
        receitas: v.receitas,
        despesas: v.despesas,
        saldo: v.receitas - v.despesas,
      }))
      .sort((a, b) => {
        const [mA, aA] = a.mes.split("/"),
          [mB, aB] = b.mes.split("/");
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
        return (
          parseInt(aA) * 12 +
          meses.indexOf(mA) -
          (parseInt(aB) * 12 + meses.indexOf(mB))
        );
      });

    const ultimos = filtrados
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 10);

    let html = `
      <div class="dash-resumo">
        <div class="dash-card receita"><div class="rotulo">Receitas</div><div class="valor">R$ ${receitas.toFixed(2)}</div></div>
        <div class="dash-card despesa"><div class="rotulo">Despesas</div><div class="valor">R$ ${despesas.toFixed(2)}</div></div>
        <div class="dash-card saldo"><div class="rotulo">Saldo</div><div class="valor">R$ ${saldo.toFixed(2)}</div></div>
      </div>
      <div class="card"><h3>Despesas por Categoria</h3><div class="dash-categorias">${
        categorias.length
          ? categorias
              .map(
                (c) =>
                  `<span class="cat-item">${c.nome}: R$ ${c.total.toFixed(2)}</span>`,
              )
              .join("")
          : "<span>Nenhuma despesa.</span>"
      }</div></div>
      <div class="card"><h3>Evolução Mensal</h3><table><thead><tr><th>Mês</th><th>Receitas</th><th>Despesas</th><th>Saldo</th></tr></thead><tbody>${
        evolucao.length
          ? evolucao
              .map(
                (r) =>
                  `<tr><td>${r.mes}</td><td>R$ ${r.receitas.toFixed(2)}</td><td>R$ ${r.despesas.toFixed(2)}</td><td>R$ ${r.saldo.toFixed(2)}</td></tr>`,
              )
              .join("")
          : '<tr><td colspan="4">Nenhum dado.</td></tr>'
      }</tbody></table></div>
      <div class="card"><h3>Últimos Lançamentos</h3><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Status</th></tr></thead><tbody>${
        ultimos.length
          ? ultimos
              .map(
                (l) =>
                  `<tr><td>${l.data}</td><td>${l.descricao}</td><td>${l.categoria}</td><td>R$ ${l.valor.toFixed(2)}</td><td>${l.status}</td></tr>`,
              )
              .join("")
          : '<tr><td colspan="5">Nenhum lançamento.</td></tr>'
      }</tbody></table></div>`;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p>Erro ao carregar dashboard: ${err.message}</p>`;
  }
}
