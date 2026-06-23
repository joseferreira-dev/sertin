document.addEventListener("DOMContentLoaded", () => {
  preencherSelectores();
  configurarNavegacao();
  configurarFiltros();
  carregarView("dashboard");
});

function preencherSelectores() {
  const selectAno = document.getElementById("select-ano");
  const anos = gerarAnos();
  selectAno.innerHTML = '<option value="todos">Todos</option>';
  anos.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    selectAno.appendChild(opt);
  });
  const anoAtual = new Date().getFullYear();
  selectAno.value = anoAtual;
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
  const mesAtual = meses[new Date().getMonth()];
  document.getElementById("select-mes").value = mesAtual;
}

function configurarNavegacao() {
  document.querySelectorAll("#sidebar ul li").forEach((item) => {
    item.addEventListener("click", () => {
      const view = item.dataset.view;
      document
        .querySelectorAll("#sidebar ul li")
        .forEach((li) => li.classList.remove("active"));
      item.classList.add("active");
      carregarView(view);
    });
  });
}

function configurarFiltros() {
  document
    .getElementById("select-mes")
    .addEventListener("change", recarregarViewAtiva);
  document
    .getElementById("select-ano")
    .addEventListener("change", recarregarViewAtiva);
}

function carregarView(view) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  const target = document.getElementById(`view-${view}`);
  if (target) target.classList.add("active");
  switch (view) {
    case "dashboard":
      carregarDashboard();
      break;
    case "lancamentos":
      carregarLancamentos();
      break;
    case "parcelamentos":
      carregarParcelamentos();
      break;
    case "metas":
      carregarMetas();
      break;
    case "contas":
      carregarContas();
      break;
    case "cartoes":
      carregarCartoes();
      break;
    case "configuracoes":
      carregarConfiguracoes();
      break;
  }
}

function recarregarViewAtiva() {
  const activeItem = document.querySelector("#sidebar ul li.active");
  if (activeItem) carregarView(activeItem.dataset.view);
  else carregarView("dashboard");
}
