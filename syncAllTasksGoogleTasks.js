function sincronizarTodasAsTarefas() {
  const nomeListaCentral = "♾️ Todas as tarefas";

  const listas = Tasks.Tasklists.list().items || [];

  const listaCentral = listas.find(
    lista => lista.title === nomeListaCentral
  );

  if (!listaCentral) {
    throw new Error(
      `Lista "${nomeListaCentral}" não encontrada.`
    );
  }

  const tarefasCentral = Tasks.Tasks.list(
    listaCentral.id,
    {
      showCompleted: true,
      showHidden: true
    }
  ).items || [];

  const tarefasOrdenadas = [];

  listas.forEach(lista => {
    if (lista.id === listaCentral.id) return;

    const emojiLista = obterEmojiLista(lista.title);

    const tarefas = Tasks.Tasks.list(lista.id, {
      showCompleted: false,
      showHidden: false
    }).items || [];

    tarefas.forEach(tarefa => {
      if (!tarefa.title) return;

      const tituloLimpo = limparPrefixo(taskTitle = tarefa.title);

      tarefasOrdenadas.push({
        title: `${emojiLista} ${tituloLimpo}`,
        notes: tarefa.notes || "",
        due: tarefa.due || null
      });
    });
  });

  // Ordenação por data
  tarefasOrdenadas.sort((a, b) => {
    const prioridadeA = obterPrioridadeData(a.due);
    const prioridadeB = obterPrioridadeData(b.due);

    if (prioridadeA !== prioridadeB) {
      return prioridadeA - prioridadeB;
    }

    if (!a.due && !b.due) return 0;
    if (!a.due) return 1;
    if (!b.due) return -1;

    return new Date(a.due) - new Date(b.due);
  });

  // Remove tarefas antigas
  tarefasCentral.forEach(tarefa => {
    Tasks.Tasks.remove(
      listaCentral.id,
      tarefa.id
    );
  });

  // Insere novamente na ordem correta
  tarefasOrdenadas.forEach(tarefa => {
    Tasks.Tasks.insert(
      {
        title: tarefa.title,
        notes: tarefa.notes,
        due: tarefa.due
      },
      listaCentral.id
    );
  });
}

function obterEmojiLista(tituloLista) {
  return tituloLista.trim().split(/\s+/)[0] || "📌";
}

function limparPrefixo(texto) {
  let titulo = texto.trim();

  // remove emojis no início
  titulo = titulo.replace(
    /^(\p{Extended_Pictographic}\s*)+/u,
    ""
  );

  // remove prefixo antigo no formato emoji |
  titulo = titulo.replace(
    /^\s*\|\s*/,
    ""
  );

  return titulo.trim();
}

function obterPrioridadeData(data) {
  if (!data) return 4;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataTask = new Date(data);
  dataTask.setHours(0, 0, 0, 0);

  if (dataTask < hoje) return 1;
  if (dataTask.getTime() === hoje.getTime()) return 2;

  return 3;
}
