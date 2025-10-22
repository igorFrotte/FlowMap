import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  DragEndEvent,
} from "@dnd-kit/core";
import axiosService from "../services/axiosService";

interface Disciplina {
  id: number;
  nome: string;
  periodo: number;
  dificuldade?: string | null;
  informacao?: string | null;
  reqcreditos?: number | null;
  reqperiodo?: number | null;
  correquisitos: { id: number; nome: string }[];
  requisitos: { id: number; nome: string }[];
  dependentes: { id: number; nome: string }[];
  aprovado: boolean;
  periodoplan?: number | null;
  borda?: string;
  credito: number;
}

/* ------------------ ITEM ARRASTÁVEL ------------------ */
function DraggableItem({
  id,
  children,
  disabled = false,
}: {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    padding: "8px",
    margin: "4px",
    background: disabled ? "#ddd" : "#eee",
    border: "1px solid #aaa",
    borderRadius: "8px",
    cursor: disabled ? "pointer" : "grab",
    transform:
      !disabled && transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!disabled ? { ...listeners, ...attributes } : {})}
    >
      {children}
    </div>
  );
}

/* ------------------ COLUNA DESTINO ------------------ */
function DroppableColumn({
  id,
  title,
  children,
  disabled = false,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { setNodeRef } = useDroppable({ id, disabled });

  const style: React.CSSProperties = {
    minHeight: "120px",
    minWidth: "220px",
    padding: "10px",
    margin: "10px",
    background: disabled ? "#f0f0f0" : "#fafafa",
    border: disabled ? "2px solid #999" : "2px dashed #ccc",
    borderRadius: "10px",
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

/* ------------------ COMPONENTE PRINCIPAL ------------------ */
export default function Planejador() {
  const [backlog, setBacklog] = useState<Disciplina[]>([]);
  const [backlogTotal, setBacklogTotal] = useState<Disciplina[]>([]);
  const [plan, setPlan] = useState<Disciplina[][]>([[]]);
  const [bloqueados, setBloqueados] = useState<boolean[]>([false]);
  const [disciplinas, setDisciplinas] = useState<Record<string, Disciplina>>(
    {}
  );
  const [iniciado, setIniciado] = useState(false);
  const [planoAnterior, setPlanoAnterior] = useState<Disciplina[][]>([]);

  useEffect(() => {
    axiosService
      .mostrarDisciplinasDoAluno()
      .then((r) => {
        setDisciplinas(r.data);
        const todas = Object.values(r.data) as Disciplina[];
        const maxPeriodo = Math.max(
          0,
          ...todas.filter((d) => d.periodoplan).map((d) => d.periodoplan ?? 0)
        );
        if (maxPeriodo > 0) {
          let plano: Disciplina[][] = Array.from({ length: maxPeriodo }, () => []);
          todas.forEach((d) => {
            if (d.periodoplan) {
              plano[d.periodoplan - 1].push(d);
            }
          });
          setPlanoAnterior(plano);
        }
      })
      .catch((e) => console.log(e.message));
  }, []);

  /* ------------------ REINICIAR PLANEJAMENTO ------------------ */
  const resetPlanejamento = () => {
    axiosService
      .mostrarDisciplinasDoAluno()
      .then((r) => {
        setDisciplinas(r.data);
        const todas = Object.values(r.data) as Disciplina[];
        const aprovadas = todas.filter((d) => d.aprovado);
        const aprovadasIds = aprovadas.map((d) => d.id);
        const naoAprovadas = todas.filter((d) => !d.aprovado);

        const creditosConcluidos = aprovadas.reduce(
          (acc, d) => acc + d.credito,
          0
        );

        const periodoOK = (disciplina: Disciplina): boolean => {
          if (!disciplina.reqperiodo) return true;

          const reqPeriodo = disciplina.reqperiodo;

          const disciplinasRequeridas = todas.filter(
            (d) => d.periodo <= reqPeriodo
          );
          return disciplinasRequeridas.every((d) => d.aprovado);
        };

        const iniciais = naoAprovadas.filter((d) => {
          const requisitosOK = d.requisitos.every((r) =>
            aprovadasIds.includes(r.id)
          );
          const creditosOK =
            !d.reqcreditos || creditosConcluidos >= d.reqcreditos;
          const periodoPermitido = periodoOK(d);
          return requisitosOK && creditosOK && periodoPermitido;
        });

        const bloqueadas = naoAprovadas.filter((d) => {
          const requisitosOK = d.requisitos.every((r) =>
            aprovadasIds.includes(r.id)
          );
          const creditosOK =
            !d.reqcreditos || creditosConcluidos >= d.reqcreditos;
          const periodoPermitido = periodoOK(d);
          return !(requisitosOK && creditosOK && periodoPermitido);
        });

        setBacklog(iniciais);
        setBacklogTotal(bloqueadas);
        setPlan([[]]);
        setBloqueados([false]);
        setIniciado(true);
        setPlanoAnterior([]);
      })
      .catch((e) => console.log(e.message));
  };

  /* ------------------ DRAG & DROP ------------------ */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const parseActive = (id: string) => {
      const mBack = id.match(/^backlog-(\d+)$/);
      if (mBack) return { from: "backlog" as const, itemId: Number(mBack[1]) };
      const mPeriodItem = id.match(/^periodo-(\d+)-(\d+)$/);
      if (mPeriodItem)
        return {
          from: "periodo" as const,
          periodoIndex: Number(mPeriodItem[1]),
          itemId: Number(mPeriodItem[2]),
        };
      return null;
    };

    const parseOver = (id: string) => {
      if (id === "backlog") return { type: "backlog" as const };
      const mPeriod = id.match(/^periodo-(\d+)(?:-\d+)?$/);
      if (mPeriod)
        return {
          type: "periodo" as const,
          periodoIndex: Number(mPeriod[1]),
        };
      return { type: "unknown" as const };
    };

    const src = parseActive(activeId);
    const dest = parseOver(overId);
    if (!src || dest.type === "unknown") return;
    if (src.from === "backlog" && dest.type === "backlog") return;
    if (
      src.from === "periodo" &&
      dest.type === "periodo" &&
      src.periodoIndex === dest.periodoIndex
    )
      return;
    if (dest.type === "periodo" && bloqueados[dest.periodoIndex]) return;
    if (src.from === "periodo" && bloqueados[src.periodoIndex]) return;

    let newBacklog = [...backlog];
    let newPlan = plan.map((p) => [...p]);

    let item: Disciplina | undefined;
    if (src.from === "backlog") {
      item = newBacklog.find((d) => d.id === src.itemId);
      newBacklog = newBacklog.filter((d) => d.id !== src.itemId);
    } else {
      const sIdx = src.periodoIndex!;
      item = newPlan[sIdx].find((d) => d.id === src.itemId);
      newPlan[sIdx] = newPlan[sIdx].filter((d) => d.id !== src.itemId);
    }
    if (!item) return;
    if (dest.type === "backlog") {
      newBacklog.push(item);
    } else {
      const dstIdx = dest.periodoIndex;
      if (!newPlan[dstIdx]) newPlan[dstIdx] = [];
      newPlan[dstIdx] = [...newPlan[dstIdx], item];
    }
    setBacklog(newBacklog);
    setPlan(newPlan);
  };

  /* ------------------ ADICIONAR NOVO PERÍODO ------------------ */
  const addPeriodo = () => {
  // 🔹 Pega o último período planejado
  const lastPeriodo = plan[plan.length - 1];
  if (!lastPeriodo || lastPeriodo.length === 0) {
    alert("Você precisa adicionar disciplinas antes de criar um novo período.");
    return;
  }

  // 🔹 Pega IDs de disciplinas cursadas (aprovadas)
  const idsAprovadas = Object.values(disciplinas)
    .filter((d) => d.aprovado)
    .map((d) => d.id);

  // 🔹 Pega IDs de disciplinas já planejadas em períodos anteriores
  const idsPlanejadosAntes = plan
    .slice(0, -1)
    .flat()
    .map((d) => d.id);

  // 🔹 Conjunto de disciplinas disponíveis (aprovadas + anteriores)
  const idsDisponiveis = [...new Set([...idsAprovadas, ...idsPlanejadosAntes])];

  // 🔹 Verifica cada disciplina do último período
  for (const disc of lastPeriodo) {
    if (disc.correquisitos.length > 0) {
      const idsCorreq = disc.correquisitos.map((c) => c.id);

      const correqOK = idsCorreq.every(
        (id) =>
          idsDisponiveis.includes(id) || // já cursada ou planejada antes
          lastPeriodo.some((d) => d.id === id) // ou está no mesmo período
      );

      if (!correqOK) {
        alert(
          `A disciplina "${disc.nome}" possui correquisitos que não estão no mesmo período ou ainda não foram cursados.`
        );
        return; // Impede a criação do novo período
      }
    }
  }

  // 🔹 Se passou na verificação, continua normalmente
  const lastIdx = plan.length - 1;
  const newBloqueados = [...bloqueados];
  newBloqueados[lastIdx] = true;
  setBloqueados(newBloqueados);

  const disciplinasAlocadasIds = plan.flat().map((d) => d.id);
  const disciplinasCumpridasIds = [
    ...disciplinasAlocadasIds,
    ...Object.values(disciplinas)
      .filter((d) => d.aprovado)
      .map((d) => d.id),
  ];
  const todasNaoAprovadas = Object.values(disciplinas).filter(
    (d) => !d.aprovado
  ) as Disciplina[];

  const creditosCumpridos = Object.values(disciplinas)
    .filter((d) => d.aprovado || disciplinasAlocadasIds.includes(d.id))
    .reduce((acc, d) => acc + d.credito, 0);

  const novasDisciplinas = todasNaoAprovadas.filter((d) => {
    const requisitosOK = d.requisitos.every((r) =>
      disciplinasCumpridasIds.includes(r.id)
    );

    const creditosOK = !d.reqcreditos || creditosCumpridos >= d.reqcreditos;

    const reqPeriodoOK =
      typeof d.reqperiodo !== "number"
        ? true
        : Object.values(disciplinas)
            .filter((disc) => disc.periodo <= d.reqperiodo!)
            .every(
              (disc) =>
                disc.aprovado || disciplinasAlocadasIds.includes(disc.id)
            );

    return (
      !disciplinasAlocadasIds.includes(d.id) &&
      requisitosOK &&
      creditosOK &&
      reqPeriodoOK
    );
  });

  const bloqueadas = todasNaoAprovadas.filter((d) => {
    const requisitosOK = d.requisitos.every((r) =>
      disciplinasCumpridasIds.includes(r.id)
    );

    const creditosOK = !d.reqcreditos || creditosCumpridos >= d.reqcreditos;

    const reqPeriodoOK =
      typeof d.reqperiodo !== "number"
        ? true
        : Object.values(disciplinas)
            .filter((disc) => disc.periodo <= d.reqperiodo!)
            .every((disc) => disc.aprovado);

    return (
      !disciplinasAlocadasIds.includes(d.id) &&
      !(requisitosOK && creditosOK && reqPeriodoOK)
    );
  });

  setBacklog(novasDisciplinas);
  setBacklogTotal(bloqueadas);
  setPlan([...plan, []]);
  setBloqueados([...newBloqueados, false]);
};


  /* ------------------ SALVAR PLANEJAMENTO ------------------ */
  const salvarPlanejamento = () => {
    if (backlog.length === 0 && backlogTotal.length === 0) {
      let objs = plan.map((el, i) => ({
        idsDisciplinas: el.map((e) => e.id),
        periodoPlan: i + 1,
      }));

      axiosService
        .mudarPlanejamento(objs)
        .then(() => {
          alert("Planejamento salvo!");
          setIniciado(false);
          setBacklog([]);
          setBacklogTotal([]);
          setPlan([[]]);
          setBloqueados([false]);
          axiosService
            .mostrarDisciplinasDoAluno()
            .then((r) => {
              setDisciplinas(r.data);
              const todas = Object.values(r.data) as Disciplina[];
              const maxPeriodo = Math.max(
                0,
                ...todas
                  .filter((d) => d.periodoplan)
                  .map((d) => d.periodoplan ?? 0)
              );
              if (maxPeriodo > 0) {
                let plano: Disciplina[][] = Array.from(
                  { length: maxPeriodo },
                  () => []
                );
                todas.forEach((d) => {
                  if (d.periodoplan) {
                    plano[d.periodoplan - 1].push(d);
                  }
                });
                setPlanoAnterior(plano);
              } else {
                setPlanoAnterior([]);
              }
            })
            .catch((e) => console.log(e.message));
        })
        .catch((e) => console.log(e.message));
    } else {
      alert("Não é possível salvar enquanto houver disciplinas no backlog.");
    }
  };

  /* ------------------ RENDERIZAÇÃO ------------------ */
  if (!iniciado) {
    return (
      <div>
        {planoAnterior.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2>Planejamento Anterior</h2>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {planoAnterior.map((periodo, idx) => (
                <div
                  key={idx}
                  style={{
                    minWidth: "220px",
                    margin: "10px",
                    padding: "10px",
                    border: "2px solid #ccc",
                    borderRadius: "10px",
                    background: "#fafafa",
                  }}
                >
                  <h3>Período {idx + 1}</h3>
                  {periodo.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        padding: "6px",
                        margin: "4px",
                        border: "1px solid #aaa",
                        borderRadius: "6px",
                        background: "#eee",
                      }}
                    >
                      {d.nome + " | " + d.periodo}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={resetPlanejamento}>Iniciar Planejamento</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <DroppableColumn id="backlog-total" title="Backlog Total" disabled>
          {backlogTotal.map((d) => (
            <DraggableItem key={d.id} id={`block-${d.id}`} disabled>
              <span
                title={
                  d.reqcreditos
                    ? `Requisito: ${d.reqcreditos} créditos`
                    : "Requisito: " + d.requisitos.map((r) => r.nome).join(", ")
                }
              >
                {d.nome + " | " + d.periodo}
              </span>
            </DraggableItem>
          ))}
        </DroppableColumn>

        <DroppableColumn id="backlog" title="Backlog">
          {backlog.map((d) => (
            <DraggableItem key={d.id} id={`backlog-${d.id}`}>
              {d.nome + " | " + d.periodo}
            </DraggableItem>
          ))}
        </DroppableColumn>

        {plan.map((periodo, idx) => (
          <DroppableColumn
            key={idx}
            id={`periodo-${idx}`}
            title={`Período ${idx + 1}`}
            disabled={bloqueados[idx]}
          >
            {periodo.map((d) => (
              <DraggableItem
                key={d.id}
                id={`periodo-${idx}-${d.id}`}
                disabled={bloqueados[idx]}
              >
                {d.nome + " | " + d.periodo}
              </DraggableItem>
            ))}
          </DroppableColumn>
        ))}
      </DndContext>

      <div style={{ width: "100%", marginTop: "20px" }}>
        <button onClick={addPeriodo}>+ Adicionar Período</button>
        <button onClick={salvarPlanejamento} style={{ marginLeft: "10px" }}>
          Salvar Planejamento
        </button>
        <button
          onClick={resetPlanejamento}
          style={{ marginLeft: "10px", backgroundColor: "#f66", color: "#fff" }}
        >
          Reiniciar Planejamento
        </button>
      </div>
    </div>
  );
}
