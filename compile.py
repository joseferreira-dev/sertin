#!/usr/bin/env python3
"""
Compilador de código e estrutura de pastas.
Execute o script na raiz do projeto. O resultado será salvo em um arquivo .txt.
Todas as configurações estão nas variáveis abaixo – edite-as conforme necessário.
"""

import os
import sys
from pathlib import Path
from typing import Set, Optional, List

# =============================================================================
# CONFIGURAÇÕES (edite aqui)
# =============================================================================

# Diretório raiz a ser processado.
# Se for None, usa o diretório onde este script está salvo.
ROOT_DIR: Optional[str] = None

# Nome do arquivo de saída (será salvo na mesma pasta do script).
OUTPUT_FILE: str = "compiled_output.txt"

# Pastas a serem ignoradas (nomes exatos).
IGNORE_DIRS: List[str] = [
    ".git",
    "__pycache__",
    "venv",
    "env",
    "node_modules",
    ".idea",
    ".vscode",
    "dist",
    "build",
    "logs"
]

# Extensões a serem incluídas.
# Se for None, TODAS as extensões são consideradas (exceto as ignoradas).
# Se for uma lista, APENAS os arquivos com essas extensões serão processados.
# Exemplo: INCLUDE_EXTS = [".py", ".txt", ".md"]
INCLUDE_EXTS: Optional[List[str]] = None

# Extensões a serem ignoradas (sobrescreve a inclusão, se ambas forem definidas).
IGNORE_EXTS: List[str] = [
    ".pyc", ".pyo",
    ".so", ".dll", ".dylib", ".exe",
    ".bin", ".dat", ".db",
    ".log", ".tmp", ".swp",
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".ico",
    ".mp3", ".mp4", ".avi", ".mov",
    ".zip", ".tar", ".gz", ".rar",
    ".pdf", ".doc", ".docx"
]

# Incluir a árvore de diretórios no arquivo de saída?
SHOW_TREE: bool = True

# =============================================================================
# FIM DAS CONFIGURAÇÕES
# =============================================================================


def get_script_dir() -> Path:
    """Retorna o diretório onde este script está localizado."""
    return Path(__file__).parent.resolve()


def should_ignore_path(
    path: Path,
    ignore_dirs: Set[str],
    include_exts: Optional[Set[str]],
    ignore_exts: Set[str]
) -> bool:
    """
    Decide se um caminho (arquivo ou diretório) deve ser ignorado.
    - Diretórios: verifica se o nome está em ignore_dirs.
    - Arquivos: verifica extensão contra include_exts e ignore_exts.
    """
    if path.is_dir():
        return path.name in ignore_dirs

    ext = path.suffix.lower()
    if include_exts is not None and ext not in include_exts:
        return True
    if ext in ignore_exts:
        return True
    return False


def get_directory_tree(root: Path, ignore_dirs: Set[str]) -> str:
    """Gera uma string com a árvore de diretórios a partir da raiz."""
    lines = []
    root_name = root.name or str(root)
    lines.append(root_name + "/")

    for dirpath, dirnames, filenames in os.walk(root):
        rel_path = Path(dirpath).relative_to(root)
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
        indent = "    " * (len(rel_path.parts) if rel_path != Path('.') else 0)
        for d in sorted(dirnames):
            lines.append(f"{indent}├── {d}/")
        for f in sorted(filenames):
            lines.append(f"{indent}├── {f}")

    return "\n".join(lines)


def compile_files(
    root: Path,
    ignore_dirs: Set[str],
    include_exts: Optional[Set[str]],
    ignore_exts: Set[str]
) -> str:
    """Percorre a árvore e compila o caminho e conteúdo de cada arquivo permitido."""
    output_parts = []

    if SHOW_TREE:
        output_parts.append("=" * 80)
        output_parts.append("ESTRUTURA DE DIRETÓRIOS")
        output_parts.append("=" * 80)
        output_parts.append(get_directory_tree(root, ignore_dirs))
        output_parts.append("\n")

    output_parts.append("=" * 80)
    output_parts.append("CONTEÚDO DOS ARQUIVOS")
    output_parts.append("=" * 80)

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
        base_path = Path(dirpath)
        for filename in sorted(filenames):
            file_path = base_path / filename
            if should_ignore_path(file_path, ignore_dirs, include_exts, ignore_exts):
                continue

            rel_path = file_path.relative_to(root)
            try:
                content = file_path.read_text(encoding='utf-8', errors='ignore')
            except Exception as e:
                content = f"[ERRO AO LER ARQUIVO: {e}]"

            output_parts.append("\n" + "-" * 80)
            output_parts.append(f"ARQUIVO: {rel_path}")
            output_parts.append("-" * 80)
            output_parts.append(content)

    return "\n".join(output_parts)


def main():
    # Define a raiz
    if ROOT_DIR is None:
        root_dir = get_script_dir()
    else:
        root_dir = Path(ROOT_DIR).resolve()

    if not root_dir.is_dir():
        print(f"Erro: '{root_dir}' não é um diretório válido.", file=sys.stderr)
        sys.exit(1)

    # Converte listas para sets
    ignore_dirs = set(IGNORE_DIRS)
    include_exts = set(INCLUDE_EXTS) if INCLUDE_EXTS is not None else None
    ignore_exts = set(IGNORE_EXTS)

    # Exibe informações
    print(f"Processando: {root_dir}")
    print(f"Ignorando pastas: {', '.join(ignore_dirs)}")
    if include_exts:
        print(f"Incluindo apenas extensões: {', '.join(include_exts)}")
    print(f"Ignorando extensões: {', '.join(ignore_exts)}")
    print(f"Saída será salva em: {OUTPUT_FILE}")

    # Compila
    result = compile_files(root_dir, ignore_dirs, include_exts, ignore_exts)

    # Salva no arquivo
    output_path = Path(__file__).parent / OUTPUT_FILE
    output_path.write_text(result, encoding='utf-8')
    print(f"\n✅ Compilação concluída! Arquivo gerado: {output_path}")


if __name__ == "__main__":
    main()