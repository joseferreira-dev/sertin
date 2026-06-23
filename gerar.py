from pathlib import Path

# ==========================
# CONFIGURAÇÕES
# ==========================

PASTA_RAIZ = Path(".")  # Pasta atual

PASTAS_IGNORADAS = {
    "node_modules",
    ".git",
    ".idea",
    ".vscode",
    "dist",
    "build",
    "out",
    "release",
    "__pycache__"
}

ARQUIVOS_IGNORADOS = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".DS_Store",
    "Thumbs.db",
    "codigo_completo.txt",
    "estrutura_de_pastas.txt",
    "gerar.py"
}

EXTENSOES_BINARIAS = {
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".webp",
    ".pdf", ".zip", ".rar", ".7z",
    ".exe", ".dll", ".so",
    ".woff", ".woff2", ".ttf", ".eot",
    ".mp3", ".mp4", ".wav",
    ".db", ".sqlite"
}


# ==========================
# FILTROS
# ==========================

def deve_ignorar(caminho: Path) -> bool:
    if caminho.name in ARQUIVOS_IGNORADOS:
        return True

    if any(parte in PASTAS_IGNORADAS for parte in caminho.parts):
        return True

    return False


def arquivo_texto(caminho: Path) -> bool:
    return caminho.suffix.lower() not in EXTENSOES_BINARIAS


# ==========================
# ESTRUTURA DE PASTAS
# ==========================

def gerar_arvore(diretorio: Path, prefixo=""):
    itens = [
        item for item in sorted(
            diretorio.iterdir(),
            key=lambda x: (x.is_file(), x.name.lower())
        )
        if not deve_ignorar(item)
    ]

    linhas = []

    for indice, item in enumerate(itens):
        ultimo = indice == len(itens) - 1

        conector = "└── " if ultimo else "├── "
        linhas.append(prefixo + conector + item.name)

        if item.is_dir():
            extensao = "    " if ultimo else "│   "
            linhas.extend(
                gerar_arvore(
                    item,
                    prefixo + extensao
                )
            )

    return linhas


# ==========================
# CÓDIGO COMPLETO
# ==========================

def gerar_codigo_completo(raiz: Path, arquivo_saida: Path):
    with open(arquivo_saida, "w", encoding="utf-8") as saida:

        for arquivo in sorted(raiz.rglob("*")):

            if not arquivo.is_file():
                continue

            if deve_ignorar(arquivo):
                continue

            if not arquivo_texto(arquivo):
                continue

            caminho_relativo = arquivo.relative_to(raiz)

            saida.write("\n")
            saida.write("=" * 120 + "\n")
            saida.write(f"ARQUIVO: {str(caminho_relativo).replace(chr(92), '/')}\n")
            saida.write("=" * 120 + "\n\n")

            try:
                with open(arquivo, "r", encoding="utf-8") as f:
                    linhas = f.readlines()

                for numero, linha in enumerate(linhas, start=1):
                    saida.write(f"{numero:05d} | {linha}")

            except UnicodeDecodeError:
                saida.write("[ARQUIVO IGNORADO - NÃO É TEXTO UTF-8]\n")

            except Exception as e:
                saida.write(f"[ERRO AO LER ARQUIVO: {e}]\n")

            saida.write("\n\n")


# ==========================
# EXECUÇÃO
# ==========================

def main():

    nome_raiz = PASTA_RAIZ.resolve().name

    # Estrutura de pastas
    estrutura = [f"{nome_raiz}/"]
    estrutura.extend(gerar_arvore(PASTA_RAIZ))

    with open("estrutura_de_pastas.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(estrutura))

    # Código completo
    gerar_codigo_completo(
        PASTA_RAIZ,
        Path("codigo_completo.txt")
    )

    print("Arquivos gerados com sucesso:")
    print(" - estrutura_de_pastas.txt")
    print(" - codigo_completo.txt")


if __name__ == "__main__":
    main()