**Sistema de Gestão Financeira Pessoal – Sertin**  
_Arquitetura: Backend em Node.js + Express (API REST) | Frontend em Electron (Desktop) | Banco de Dados SQLite_

---

### Módulo 1: Autenticação, Segurança e Controle de Acesso

- **RF-001 – Cadastro de Usuário:** Permitir criar conta com Nome, E-mail, Senha (hash com bcrypt, salt 12 rounds) e Pergunta de Segurança (para recuperação offline).
- **RF-002 – Login/Logout:** Autenticação via JWT (armazenado no localStorage do renderer) ou sessão HTTP (com `express-session`). O logout deve limpar token/sessão e redirecionar para a tela de login.
- **RF-003 – Recuperação de Senha:** Redefinição de senha validando a resposta à pergunta de segurança (sem envio de e-mail, pois é offline).
- **RF-004 – Bloqueio de Tela:** Após X minutos de inatividade (configurável), o sistema bloqueia a interface e exige a senha novamente.
- **RF-005 – Criptografia de Dados Sensíveis:** Todo o banco SQLite deve ser armazenado com criptografia (ex: `sqlcipher` via `better-sqlite3` com extensão ou `sqlite3` compilado com suporte a criptografia) para proteger o arquivo .db contra acesso direto indevido.

**Telas e Comportamentos Esperados:** O usuário inicia o aplicativo e visualiza imediatamente a tela de **Login**, com campos para E-mail e Senha, além de links para "Cadastrar-se" e "Esqueci minha senha". A tela de **Cadastro** é um formulário dividido em etapas (dados básicos + pergunta de segurança). Em caso de inatividade, uma sobreposição translúcida bloqueia a tela atual, exibindo um campo de senha e o nome do usuário logado; ao digitar a senha correta, a sessão é restaurada sem perder o estado das telas abertas. O logout encerra a sessão no backend e limpa quaisquer tokens armazenados no frontend, redirecionando forçadamente para a tela de login.

---

### Módulo 2: Configuração Inicial (Onboarding)

- **RF-006 – Assistente de Boas-Vindas:** Ao primeiro login, executar wizard para configurar: moeda padrão (BRL, USD, EUR), formato de data (DD/MM/AAAA ou MM/DD/AAAA), criação de contas iniciais (ex: Carteira, Conta Corrente) e importação de categorias padrão (Alimentação, Transporte, Saúde, Salário etc.).

**Telas e Comportamentos Esperados:** O sistema detecta que é a primeira execução e abre um **Wizard em tela cheia** com 4 etapas sequenciais (indicador de progresso na parte superior). Na primeira etapa, o usuário seleciona a moeda e o formato de data através de comboboxes. Na segunda, ele pode adicionar contas iniciais utilizando um botão "Adicionar Conta", que abre um modal rápido com Nome, Tipo e Saldo Inicial; é possível pular esta etapa. Na terceira, uma grade de categorias pré-definidas é exibida com checkboxes para o usuário desmarcar as que não deseja importar. Na quarta, um resumo de todas as configurações é apresentado, e ao clicar em "Concluir", os dados são salvos e o sistema carrega o Dashboard principal. Durante todo o wizard, o usuário pode voltar à etapa anterior para corrigir informações.

---

### Módulo 3: Gerenciamento de Contas Financeiras

- **RF-007 – CRUD de Contas:** Criar, editar, listar e excluir (soft delete) contas com: Nome, Tipo (Conta Corrente, Poupança, Dinheiro Físico, Cartão de Crédito, Carteira Digital), Saldo Inicial, Cor/Ícone e Instituição Financeira.
- **RF-008 – Atualização Automática de Saldo:** O saldo de contas correntes/poupança deve ser atualizado automaticamente ao adicionar/remover/editar transações.
- **RF-009 – Gerenciamento de Cartões de Crédito:** Para contas do tipo Cartão, armazenar: Dia de Fechamento, Dia de Vencimento, Limite Total, Saldo atual (soma de compras parceladas e à vista não pagas).
- **RF-010 – Saldo Consolidado (Net Worth):** Exibir no dashboard a soma de todos os ativos (contas) menos os passivos (faturas de cartão a vencer).

**Telas e Comportamentos Esperados:** O módulo é acessado via item de menu "Contas" na barra lateral. A **tela principal** exibe uma lista de cartões (cards) com o nome, tipo, ícone, cor e saldo atual de cada conta. Um botão flutuante "Nova Conta" abre um **modal de criação** com campos organizados por abas (Dados Básicos e Configurações de Cartão, que aparece somente se o tipo for Cartão de Crédito). Ao editar uma conta, o modal é pré-preenchido e permite alterar todos os campos, exceto o tipo (que fica bloqueado para evitar inconsistências no saldo). A exclusão é feita por um ícone de lixeira, que solicita confirmação (uma vez que contas com transações associadas não podem ser deletadas fisicamente – apenas recebem flag "ocultar" e não aparecem mais nas listagens, mas mantêm o histórico para relatórios futuros). O Net Worth é atualizado em tempo real no canto superior do dashboard sempre que uma transação ou conta é modificada.

---

### Módulo 4: Categorias e Subcategorias

- **RF-011 – CRUD de Categorias:** Criar, editar, listar e excluir categorias (ex: Moradia, Lazer).
- **RF-012 – Hierarquia (Subcategorias):** Vincular subcategorias a uma categoria pai (ex: Alimentação → Restaurante, Supermercado).
- **RF-013 – Classificação por Tipo:** Definir cada categoria como **RECEITA** ou **DESPESA** – impacta relatórios e orçamentos.
- **RF-014 – Carga de Categorias Padrão:** Oferecer opção de importar um seed de categorias pré-definidas (ajustado ao mercado brasileiro) ao criar uma nova conta.

**Telas e Comportamentos Esperados:** A tela de "Categorias" apresenta uma **árvore expansível** (estilo acordeão) onde as categorias pai podem ser expandidas para revelar suas subcategorias. Ao lado de cada item, há ícones de editar (lápis) e excluir (lixeira), além de um botão "+" para adicionar uma subcategoria diretamente abaixo. O formulário de criação/edição é um modal simples com campos: Nome, Tipo (Receita/Despesa – desabilitado na edição de subcategorias, pois herda o tipo da pai) e Categoria Pai (combobox que lista apenas categorias do mesmo tipo, para evitar que uma subcategoria de Despesa fique sob uma categoria de Receita). A exclusão de uma categoria que possui transações vinculadas exibe um alerta com duas opções: "Reatribuir transações para outra categoria" (abre um seletor) ou "Excluir permanentemente as transações junto com a categoria" (ação destrutiva com confirmação extra).

---

### Módulo 5: Lançamento de Transações (Core)

- **RF-015 – CRUD de Transações:** Registrar lançamentos com: Data (obrigatória), Descrição (obrigatória), Valor (com suporte a positivo/negativo ou campo Tipo + Valor), Conta de origem (débito), Conta de destino (crédito, se transferência), Categoria/Subcategoria, Status (Pendente/Confirmada/Cancelada), Anexo (upload de comprovante – salvo localmente com caminho no DB) e, opcionalmente, `meta_id` para vincular a uma meta (gerando aporte automático).
- **RF-016 – Lançamento Rápido:** Botão "Adicionar Despesa Rápida" na tela inicial, sem abrir modal complexo.
- **RF-017 – Parcelamento (Cartão de Crédito):** Ao lançar despesa no cartão, permitir número de parcelas, valor da parcela (com ou sem juros), e gerar automaticamente as parcelas futuras com data baseada no vencimento da fatura.
- **RF-018 – Edição de Parcelas:** Permitir editar uma parcela específica (ex: com desconto) ou editar todas as parcelas restantes de uma compra.
- **RF-019 – Transações Recorrentes (Agendadas):** Configurar recorrência com frequência (Diária, Semanal, Mensal, Anual ou Personalizada), data de início/fim; ao atingir a data, o sistema gera a transação automaticamente ou sugere (conforme preferência). O agendamento será gerenciado pelo backend Node.js usando `node-schedule` ou `agenda`, com verificação periódica.

**Telas e Comportamentos Esperados:** O coração do sistema é a tela de **Lançamentos**, acessível pelo menu central ou via atalho `Ctrl+N`. O formulário é um **modal grande** que se adapta dinamicamente: se o usuário seleciona "Transferência", os campos de Categoria e Meta desaparecem e surgem dois seletores de conta (Origem e Destino). Se seleciona "Cartão de Crédito" na conta de origem, exibe o campo "Nº de Parcelas" e "Valor da Parcela" (com cálculo automático). O **Lançamento Rápido** é um mini-modal flutuante com apenas 4 campos: Valor, Descrição, Conta e Data (preenchida automaticamente com hoje), visível na parte inferior direita do Dashboard para inserções ultrarrápidas. A lista de transações (Extrato) é paginada e apresenta as parcelas de forma agrupada visualmente (uma compra parcelada aparece como um único item expansível que revela suas parcelas individuais). A edição de uma parcela isolada permite alterar apenas a data e o valor daquela parcela específica; a edição em lote ("Editar todas as parcelas restantes") atualiza a data de vencimento e o valor proporcionalmente.

---

### Módulo 6: Gerenciamento de Tags (Etiquetas)

- **RF-071 – CRUD de Tags:** Criar, editar, listar e excluir (soft delete) tags com: Nome (ex: "Marido", "Presente", "Trabalho", "Freelance"), Cor (para identificação visual) e Descrição opcional. Ao excluir uma tag, o sistema deve remover automaticamente sua associação com todas as transações (sem excluir as transações) e exibir um alerta confirmando os impactos.
- **RF-072 – Múltiplas Tags por Transação:** Permitir associar uma ou várias tags a qualquer transação (receita, despesa ou transferência) tanto no momento do lançamento quanto na edição posterior. A interface deve oferecer um campo de busca com autocompletar para selecionar tags existentes ou, opcionalmente, criar uma nova tag rapidamente (inline) durante o lançamento.
- **RF-073 – Visualização de Tags no Extrato:** Na listagem de transações (extrato), exibir as tags associadas na forma de "chips"/pílulas coloridas ao lado da descrição, facilitando a identificação visual imediata do que cada lançamento representa.
- **RF-074 – Filtros Avançados por Tags:** Nos módulos de extrato e relatórios (Módulo 11), incluir filtro específico por tags com operadores lógicos:
  - **Incluir:** exibir apenas transações que contenham _pelo menos uma_ das tags selecionadas (OR).
  - **Excluir:** ocultar transações que contenham determinada tag.
  - **Correspondência exata:** exibir apenas transações que contenham _todas_ as tags selecionadas (AND).
- **RF-075 – Relatórios e Gráficos por Tag:** Gerar relatórios consolidados que agrupem despesas/receitas por tag, permitindo ao usuário responder perguntas como "Quanto gastei com presentes este mês?" ou "Qual o total de receitas provenientes de trabalhos freelancers vs. salário?". Os gráficos do dashboard também devem permitir segmentação por tags selecionadas.
- **RF-076 – Importação/Exportação de Tags:** Incluir as tags associadas em todos os arquivos de exportação (CSV, Excel, PDF) como uma coluna adicional com os nomes das tags separados por ponto-e-vírgula. Na importação de arquivos (OFX/CSV), permitir mapear uma coluna para tags, criando automaticamente as tags não existentes ou associando as já cadastradas.

**Telas e Comportamentos Esperados:** A tela de **Gerenciamento de Tags** (menu "Tags") exibe uma grade simples com todas as tags cadastradas, suas cores e uma contagem de quantas transações estão associadas a cada uma. Um botão "Nova Tag" abre um modal com campos Nome, Cor (seletor de paleta) e Descrição. Na tela de lançamento de transações, abaixo da Categoria, surge um campo do tipo **input com autocompletar**: conforme o usuário digita "Mar", o sistema sugere "Marido", "Market" etc.; pressionar Enter ou clicar na sugestão adiciona a tag como um chip colorido dentro do próprio campo. Para criar uma tag nova inline, basta digitar o nome e clicar em "Criar [Nome]" na lista de sugestões. No Extrato (listagem de transações), cada linha exibe seus chips; passar o mouse sobre um chip mostra um tooltip com a descrição completa da tag. O filtro avançado possui um seletor duplo: uma lista suspensa para escolher o operador (OR, AND, EXCLUIR) e um campo de busca de tags para adicionar ao filtro, permitindo combinações complexas (ex: filtrar por tags "Marido" AND "Presente" para ver gastos com presentes para o marido).

---

### Módulo 7: Transferência entre Contas

- **RF-020 – Transferência Interna:** Transferir valores entre contas próprias (ex: Conta A para Conta B) – debita da origem e credita no destino em um único lançamento, sem categorizar como despesa/receita.
- **RF-021 – Taxas em Transferências:** No ato da transferência, permitir adicionar campo "Taxa" (ex: TED/DOC), contabilizada como despesa separada.

**Telas e Comportamentos Esperados:** Dentro do mesmo modal de Lançamentos, ao selecionar o Tipo "Transferência", a interface se transforma: os campos de Categoria e Meta são ocultados, e surgem dois comboboxes lado a lado: "Conta de Origem" e "Conta de Destino" (que não podem ser a mesma). O campo "Valor" representa o montante transferido. Abaixo, um campo opcional "Taxa" com um ícone de cifrão; ao preenchê-lo, o sistema automaticamente adiciona uma linha interna no lançamento (visível apenas no detalhamento) que debita o valor da taxa da conta de origem, categorizando-a como "Despesa com Taxas Bancárias" (categoria criada automaticamente no primeiro uso). O lançamento consolidado aparece no extrato com um ícone de seta dupla ↔ para diferenciá-lo visualmente de receitas/despesas, e o histórico mostra tanto a saída da origem quanto a entrada no destino, mantendo a rastreabilidade completa.

---

### Módulo 8: Orçamentos (Metas de Gastos)

- **RF-022 – Criação de Orçamento Mensal:** Definir limite de gastos para uma categoria específica em um mês/ano.
- **RF-023 – Acompanhamento Visual:** Exibir barra de progresso (Gasto vs. Orçado) no painel e na tela da categoria.
- **RF-024 – Alertas de Estouro:** Notificação desktop (Electron) ao atingir 80%, 90% e 100% do orçamento.
- **RF-025 – Orçamento Anual:** Permitir definir orçamento anual consolidado (soma dos meses) para visão macro.

**Telas e Comportamentos Esperados:** Acessado pelo menu "Orçamentos", a tela exibe um **calendário/mês selecionável** (setas para navegar entre meses). Para cada categoria (apenas Despesas), há um card com o nome da categoria, o valor orçado, o valor gasto até o momento e uma barra de progresso colorida (verde até 70%, amarelo até 85%, vermelho acima de 85%). Um botão "Definir Orçamento" abre um modal onde o usuário seleciona a Categoria (combobox com filtro), insere o Valor Limite e escolhe se o orçamento é Mensal ou Anual (se for anual, o sistema divide automaticamente por 12 para a barra mensal, mas soma o gasto real acumulado). O sistema recalcula os orçamentos sempre que uma nova transação é lançada ou editada. Quando um limite é atingido, uma notificação toast aparece no canto inferior direito, mesmo que o aplicativo esteja em segundo plano (via integração com Electron e IPC).

---

### Módulo 9: Metas Financeiras, Reservas e Cofrinhos (Goals & Savings)

- **RF-055 – CRUD de Metas:** Criar, editar, visualizar e excluir (soft delete/arquivar) metas com: Nome, Valor Total (meta), Valor Atual (saldo inicial), Data Alvo (opcional), Nível de Prioridade (Baixa/Média/Alta/Urgente), Descrição, Cor/Ícone, Status (Em andamento/Concluída/Atrasada/Arquivada – calculado automaticamente).
- **RF-056 – Vinculação a Contas Reais:** Cada meta deve ser vinculada a uma ou mais contas financeiras; o "Valor Atual" pode ser a soma dos saldos alocados ou definido manualmente (alocação parcial).
- **RF-057 – Tipos de Meta (Categorização Especial):** Classificar como: Fundo de Emergência, Reserva de Oportunidade, Viagem/Lazer, Educação, Bens Materiais, Investimentos/Aposentadoria ou Livre – influencia relatórios e recomendações.
- **RF-058 – Aportes e Resgates Manuais:** Registrar movimentações manuais (data, valor, observação, comprovante) – atualiza automaticamente o Valor Atual da meta.
- **RF-059 – Aporte Automático via Transações:** Ao criar uma transação (especialmente receitas), permitir destinar parte ou todo o valor para uma meta, gerando simultaneamente o lançamento financeiro e a movimentação de aporte na meta.
- **RF-060 – Arredondamento Inteligente ("Troco Poupança"):** Arredondar despesas para cima e enviar a diferença para uma meta escolhida (ex: compra de R$ 14,70 → arredonda para R$ 15,00; R$ 0,30 vão para o cofrinho). Permitir limite mensal máximo.
- **RF-061 – Progresso Visual:** No dashboard e na tela da meta, exibir barra de progresso, valor atual vs. total, dias restantes e status ("No caminho", "Atrasada", "Concluída").
- **RF-062 – Projeção e Simulação:** Calcular média de aportes dos últimos 3 meses e projetar data prevista de conclusão; comparar com a Data Alvo (se existir) e exibir "Com o ritmo atual, você termina em Mês/Ano".
- **RF-063 – Sugestão de Aporte Mensal Ideal:** Com base na Data Alvo e Valor Total, calcular o valor mensal necessário para atingir a meta no prazo e comparar com o aporte médio atual, sugerindo ajustes.
- **RF-064 – Extrato Detalhado da Meta:** Tela com listagem completa de todas as movimentações (aportes/resgates) da meta, com filtros por período, tipo e valor; permitir editar/excluir movimentações (com alerta).
- **RF-065 – Alertas de Metas:** Notificações desktop quando: meta atinge 100%, faltam 30/15/7 dias para a Data Alvo sem conclusão, ou aporte médio está abaixo do sugerido por 2 meses consecutivos.
- **RF-066 – Fundo de Emergência Inteligente:** Ao criar meta com este tipo, calcular automaticamente o valor ideal com base na média de despesas dos últimos 6 meses (multiplicado por 3, 6 ou 12 meses, conforme configurado) e sugerir como meta total; alertar se saldo atual for insuficiente.
- **RF-067 – Ordenação e Agrupamento:** Na tela principal de metas, permitir ordenação por Prioridade, Data Alvo, Progresso (%) ou Valor Restante; filtrar por status (Em andamento/Concluídas/Arquivadas).
- **RF-068 – Correção Monetária e Rendimentos:** Definir rendimento anual (%) para a meta (ex: 100% do CDI); o sistema aplica o rendimento proporcional ao saldo atual no fim de cada mês, registrando como "Rendimento" no extrato da meta. Esta rotina será executada por um agendador no backend Node.js.
- **RF-069 – Relatório de Metas:** Gerar relatório consolidado com total comprometido em metas vs. patrimônio líquido, percentual geral de conclusão (média ponderada), e exportar em PDF/CSV.
- **RF-070 – Ações em Lote (Aporte Rápido):** No menu do tray icon do Electron, disponibilizar "Adicionar Aporte Rápido" – modal simplificado para selecionar meta, digitar valor e salvar sem abrir o app completo.

**Telas e Comportamentos Esperados:** A tela principal de "Metas" é um **kanban visual** com cards dispostos em colunas (Em andamento, Concluídas, Atrasadas) ou em grade, conforme preferência do usuário. Cada card exibe um círculo de progresso (tipo anel) com a porcentagem central, o nome da meta, o valor atual e o total. Ao clicar em um card, o usuário é levado à **tela de detalhamento**, que possui três abas: (1) **Visão Geral** – gráfico de evolução do saldo da meta ao longo do tempo, a barra de progresso, a projeção "Se você continuar assim, terminará em..." e o botão "Novo Aporte"; (2) **Extrato da Meta** – tabela com todas as movimentações, filtros e opção de exportar; (3) **Ajustes** – para editar nome, valor total, data alvo, tipo e vínculo com contas. A funcionalidade "Troco Poupança" é ativada nas configurações globais; quando ativa, ao salvar uma despesa, o sistema exibe um pequeno balão informando "R$ 0,30 foram destinados à meta [X]" e o usuário pode desfazer a ação ali mesmo. O cálculo de rendimento é executado por um agendador interno (verificado a cada 24h ou na inicialização) que aplica a taxa proporcional ao saldo do último dia do mês.

---

### Módulo 10: Dashboard (Painel de Controle)

- **RF-026 – Resumo do Mês:** Exibir saldo atual, total de receitas, total de despesas e saldo líquido do mês, além de um card exclusivo "Suas Metas" com total guardado e a meta mais próxima da conclusão.
- **RF-027 – Comparativo Mensal:** Gráfico de barras comparando o mês atual com o anterior (receitas/despesas).
- **RF-028 – Top Categorias:** Gráfico de pizza/rosca com as 5 principais categorias de despesa do mês.
- **RF-029 – Últimas Transações:** Tabela com as 10 últimas transações, com acesso rápido para edição/exclusão.
- **RF-030 – Evolução Patrimonial:** Gráfico de linha da evolução do Net Worth nos últimos 6 meses.

**Telas e Comportamentos Esperados:** O **Dashboard** é a tela inicial pós-login. Organizado em um layout de grade responsiva: no topo, quatro cards grandes (Saldo Total, Receitas do Mês, Despesas do Mês, Saldo Líquido), com cores e setas indicando variação em relação ao mês anterior. Abaixo, uma linha com dois gráficos lado a lado (Barras do Comparativo Mensal e Pizza das Top Categorias). Em seguida, um card "Suas Metas" resume o progresso da meta mais próxima de ser concluída e o total acumulado em todas as metas. Por fim, a tabela "Últimas Transações" ocupa a largura total, onde cada linha tem botões de ação (editar/excluir) que abrem os respectivos modais. O Dashboard é totalmente interativo: clicar em uma fatia do gráfico de pizza filtra automaticamente as transações exibidas na tabela inferior; clicar em uma barra do gráfico mensal navega para a tela de Extrato já filtrada por aquele mês.

---

### Módulo 11: Relatórios e Extratos

- **RF-031 – Filtro Avançado de Transações:** Tela de extrato com filtros combinados por Período, Contas (múltiplas), Categorias, Tags (com lógica AND/OR), Tipo, Faixa de Valor e Palavra-chave (busca textual com FTS5 do SQLite).
- **RF-032 – Relatório de Despesas por Categoria:** Agrupamento por categoria com valor gasto e percentual do total.
- **RF-033 – Relatório de Fluxo de Caixa (DRE):** Demonstrativo Receitas – Despesas = Resultado do Período.
- **RF-034 – Projeção de Gastos:** Com base na média dos últimos 3 meses, projetar o gasto total até o fim do mês atual.

**Telas e Comportamentos Esperados:** A tela de **Extrato** é acessada pelo menu "Extrato" ou via atalho `Ctrl+E`. Ela é composta por três painéis: (1) **Painel de Filtros** à esquerda (colapsável), com campos interligados – ao selecionar uma conta, as categorias disponíveis são filtradas para mostrar apenas aquelas usadas naquela conta; (2) **Tabela de Resultados** no centro, com colunas Data, Descrição (com chips de tags), Categoria, Conta, Valor e Ações; (3) **Resumo Estatístico** na parte inferior, exibindo total de registros, soma de receitas, despesas e saldo do período. Um botão "Gerar Relatório" abre um submenu com as opções: "Despesas por Categoria" (gera um gráfico de barras e tabela detalhada em uma nova aba), "DRE" (demonstrativo formatado em estilo contábil) e "Projeção" (exibe um alerta com o valor estimado para o fim do mês, com base na média diária de gastos). Todos os relatórios podem ser exportados para PDF ou CSV através de botões nativos na barra de ferramentas de cada relatório.

---

### Módulo 12: Importação e Exportação de Dados

- **RF-035 – Exportar Extrato (PDF):** Gerar PDF do extrato filtrado com cabeçalho (conta/período) e rodapé com totais, incluindo as tags associadas. A geração será feita no backend Node.js com bibliotecas como `pdfkit` ou `puppeteer`.
- **RF-036 – Exportar para CSV/Excel:** Exportar tabela de transações para .CSV (via `csv-writer`) ou .XLSX (via `xlsx`) com coluna dedicada para tags.
- **RF-037 – Importar Extrato Bancário (OFX/CSV):** Upload de arquivo .OFX ou .CSV com mapeamento de colunas; sistema detecta duplicatas (Data, Valor, Descrição) para evitar repetição; permitir mapear coluna de tags.
- **RF-038 – Importar de Outros Apps:** Mapear colunas padrão de apps como Mobills e Organizze, incluindo o campo de tags quando disponível.

**Telas e Comportamentos Esperados:** Este módulo é acessado via menu "Importar/Exportar". A **tela de Exportação** exibe um seletor de formato (PDF, CSV, XLSX), um checkbox "Incluir tags" e um botão "Exportar" que dispara o download via navegador (ou salva em pasta definida nas configurações). A **tela de Importação** é um assistente passo a passo: (1) selecionar o arquivo (arrastar e soltar ou navegar); (2) escolher o tipo de arquivo (OFX, CSV Mobills, CSV Genérico); (3) para CSVs genéricos, exibe um mapeador visual onde o usuário associa colunas do arquivo aos campos do sistema (Data, Descrição, Valor, Tags, etc.) através de comboboxes; (4) pré-visualização dos dados com indicação de duplicatas encontradas (linhas destacadas em amarelo); (5) confirmação final com resumo de quantas transações serão importadas. Importações em lote são processadas em background com barra de progresso.

---

### Módulo 13: Backup e Manutenção do Banco

- **RF-039 – Backup Manual:** Botão "Fazer Backup Agora" – copia o arquivo `.db` para pasta escolhida pelo usuário com sufixo da data.
- **RF-040 – Backup Automático:** Ao fechar o aplicativo, gerar backup automático em `Documents/Sertin/Backups` (mantendo os últimos 5 backups).
- **RF-041 – Restaurar Backup:** Selecionar um arquivo `.db` antigo e restaurá-lo (substituindo o atual, com dupla confirmação).
- **RF-042 – Limpeza de Dados (Purge):** Funcionalidade "Resetar Dados" – excluir todas as transações (mantendo contas/categorias/tags) ou excluir tudo.

**Telas e Comportamentos Esperados:** A tela "Manutenção" (menu Configurações > Manutenção) exibe informações do banco (tamanho, número de transações, última data de backup). O botão "Backup Manual" abre o diálogo nativo do sistema para escolher a pasta de destino; ao concluir, uma notificação confirma o sucesso. A lista dos últimos 5 backups automáticos é exibida com data/hora e tamanho, cada um com um botão "Restaurar" ao lado; ao clicar em restaurar, o sistema exibe uma mensagem de alerta ("Isso substituirá todos os dados atuais. Deseja continuar?") e, após confirmação, recarrega o aplicativo automaticamente. A opção "Resetar Dados" é protegida por uma senha (reautenticação) e oferece dois níveis: "Limpar apenas transações" (mantém contas, categorias e tags) ou "Apagar tudo" (formata completamente o banco e reinicia o onboarding).

---

### Módulo 14: Configurações e Personalização (Settings)

- **RF-043 – Preferências Gerais:** Moeda padrão, formato de número (separadores), formato de data/hora, primeiro dia da semana.
- **RF-044 – Tema (Dark/Light):** Alternar entre temas escuro e claro, sincronizado com a API nativa do Electron (`nativeTheme`).
- **RF-045 – Notificações:** Habilitar/desabilitar notificações de vencimento de contas e estouro de orçamento.
- **RF-046 – Atalhos de Teclado:** Configurar atalhos (ex: `Ctrl+N` para nova transação, `Ctrl+F` para busca) utilizando o módulo `globalShortcut` do Electron.
- **RF-047 – Iniciar com o Sistema:** Opção para iniciar o Sertin minimizado junto com o sistema operacional (via `app.setLoginItemSettings` do Electron).

**Telas e Comportamentos Esperados:** A tela de **Configurações** é organizada em abas verticais (sidebar esquerda): "Geral", "Aparência", "Notificações", "Atalhos" e "Sistema". Na aba "Geral", todos os campos de formato são comboboxes com atualização instantânea – ao mudar a moeda, todo o sistema é re-renderizado com os novos símbolos. Na aba "Aparência", há um toggle para Dark/Light e um preview ao vivo do tema. A aba "Atalhos" lista todos os comandos disponíveis com seus atalhos atuais; o usuário pode clicar em um atalho e pressionar uma nova combinação de teclas para remapeá-lo (validando para evitar conflitos). A opção "Iniciar com o Sistema" adiciona uma entrada no registro do Windows ou no LaunchAgents do macOS (via Electron). Todas as configurações são salvas em um arquivo JSON local (`settings.json`) e sincronizadas com o banco de dados para evitar perda em caso de corrupção.

---

### Módulo 15: Integração com Electron (Interface Desktop)

- **RF-048 – Janela Nativa:** O Electron carrega a URL do servidor Node (ex: `http://127.0.0.1:5000`) ou, em produção, carrega os arquivos estáticos diretamente. A janela é frameless com barra de título personalizada.
- **RF-049 – Tray Icon (Bandeja):** Ícone na bandeja do sistema; clique direito → opções "Abrir" e "Sair"; clique esquerdo → restaurar a janela.
- **RF-050 – Monitoramento do Servidor Node:** O Electron deve monitorar se o servidor Node está ativo; em caso de queda, tentar reiniciá-lo automaticamente via `child_process.fork` ou `spawn`.
- **RF-051 – Comunicação IPC:** Utilizar `ipcMain` e `ipcRenderer` para comunicação entre o renderer e o main process, acionando notificações nativas, ações do tray, e escuta de eventos do sistema.

**Telas e Comportamentos Esperados:** Ao iniciar, o Electron inicia o servidor Node em um subprocesso e aguarda até que a porta esteja respondendo (com retry a cada 500ms). A janela principal do aplicativo é uma **janela frameless** (sem bordas padrão do SO), com uma barra de título personalizada que contém os botões de minimizar, maximizar e fechar (estilizados conforme o tema). O ícone da bandeja (tray) fica visível permanentemente; ao fechar a janela (clicar no "X"), o aplicativo não é encerrado, mas sim minimizado para a bandeja (comportamento padrão de aplicativos desktop). Para sair completamente, o usuário deve clicar com o botão direito no ícone da bandeja e selecionar "Sair". Se o servidor Node travar por algum motivo, o Electron detecta a falha na próxima requisição (via timeout) e tenta reiniciar o processo, exibindo um alerta nativo "O servidor foi reiniciado" para o usuário.

---

### Módulo 16: Notificações e Alertas (Push Desktop)

- **RF-052 – Contas a Vencer:** Ao iniciar, verificar transações recorrentes ou parcelas que vencem nos próximos 3 dias e exibir notificação desktop via `new Notification()` do Electron.
- **RF-053 – Lembrete Manual:** Permitir que o usuário agende lembretes avulsos ("Lembrar de pagar a internet amanhã") com disparo via notificação, gerenciado pelo backend Node.js com `node-schedule`.

**Telas e Comportamentos Esperados:** As notificações são entregues pelo **sistema nativo de notificações do Electron** (`new Notification()`). Ao abrir o Sertin, uma verificação em background é executada; se houver faturas ou parcelas a vencer em até 72 horas, uma notificação é disparada para cada uma (agrupadas por dia, ex: "Você tem 3 contas vencendo amanhã"). O usuário pode clicar na notificação, o que traz a janela do Sertin para o primeiro plano e navega automaticamente para a tela de Extrato com o filtro "Vencimento nos próximos 3 dias". Os **Lembretes Manuais** são criados em uma tela simples (botão "+" na barra superior), com campos Data/Hora, Título e Descrição; o sistema possui um verificador interno (checagem a cada minuto) que dispara notificações exatamente no horário agendado, mesmo que o aplicativo esteja minimizado.

---

### Módulo 17: Auditoria e Logs

- **RF-054 – Histórico de Ações (Audit Log):** Registrar em tabela `logs` todas as ações críticas: login, logout, exclusão de transação, edição de valor > R$ 1.000, associação/desassociação de tags em massa, etc., com data/hora e usuário responsável.

**Telas e Comportamentos Esperados:** A tela de "Auditoria" (acessível apenas pelo menu Configurações, em uma seção separada) exibe uma tabela paginada com colunas: Data/Hora, Usuário, Ação (ex: "Exclusão de transação"), Detalhes (ex: "ID 152 - Supermercado - R$ 350,00") e Endereço IP (local, para rastreamento interno). Um campo de busca permite filtrar por ação ou palavra-chave. Os logs são mantidos por 90 dias por padrão (configurável), e há um botão "Exportar Logs" para CSV. O comportamento é totalmente passivo: o usuário não interage com a criação de logs, apenas os consulta para fins de rastreamento e segurança, sendo especialmente útil em ambientes multi-usuário (ou para recuperar informações de transações deletadas acidentalmente).

---

### Requisitos Não-Funcionais (Infraestrutura e Qualidade)

- **RNF-01 – API RESTful:** Backend Node.js + Express deve expor rotas prefixadas (ex: `/api/v1/...`) com respostas JSON padronizadas e códigos HTTP adequados.
- **RNF-02 – Comunicação Frontend-Backend:** O frontend (renderer Electron) consome a API via `fetch` ou axios, com tratamento de erros e timeouts.
- **RNF-03 – Performance e Índices:** O SQLite deve utilizar WAL (Write-Ahead Logging) e índices nos campos `date`, `category_id`, `account_id` e `tag_id` (na tabela de relacionamento) para garantir performance com até 50.000 transações.
- **RNF-04 – Segurança:** Senhas hasheadas com bcrypt; uso de HTTPS local (self-signed) entre Electron e Node, ou validação de origem (CORS restrito a `localhost`).
- **RNF-05 – Portabilidade:** O banco SQLite deve ser armazenado na pasta do usuário (ex: `~/Documents/Sertin/`) para facilitar backup e migração.
- **RNF-06 – Logs de Erro:** O sistema deve gerar arquivos de log (para o servidor Node e para o Electron) com níveis (INFO, WARNING, ERROR) para facilitar diagnósticos (usar bibliotecas como `winston` ou `pino`).
- **RNF-07 – Responsividade:** A interface desktop deve suportar resoluções a partir de 1366x768 e ser redimensionável sem quebrar os layouts.
- **RNF-08 – Inicialização do Servidor:** O Electron, ao iniciar, deve levantar o servidor Node como um processo filho e aguardar até que a porta esteja ouvindo antes de carregar a janela principal.
- **RNF-09 – Empacotamento:** Toda a aplicação (backend + frontend) será empacotada em um único executável para Windows, macOS e Linux usando `electron-builder`, com o servidor Node embutido na distribuição.
- **RNF-10 – Banco de Dados:** Utilizar `better-sqlite3` (síncrono, alta performance) com extensão de criptografia (SQLCipher) para proteger os dados, ou `sqlite3` com wrapper assíncrono conforme necessidade.
