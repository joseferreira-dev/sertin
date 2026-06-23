function gerarAnos() {
  const anos = [];
  const anoAtual = new Date().getFullYear();
  for (let a = 2020; a <= anoAtual + 10; a++) anos.push(a);
  return anos;
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.remove();
}

function getFiltro() {
  const mes = document.getElementById("select-mes").value;
  const ano = document.getElementById("select-ano").value;
  return { mes, ano };
}
