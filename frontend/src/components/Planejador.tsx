import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  DragEndEvent,
} from "@dnd-kit/core";

interface Disciplina {
  id: number;
  nome: string;
  periodo: number;
  dificuldade?: string | null;
  informacao?: string | null;
  reqcreditos?: number | null;
  requisitos: { id: number; nome: string }[];
  dependentes: { id: number; nome: string }[];
  aprovado: boolean;
  periodoplan?: number | null;
  borda?: string;
}

interface PlanejadorProps {
  dadosBackend: Record<string, Disciplina>;
}

/* ------------------ ITEM ARRASTÁVEL ------------------ */
function DraggableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style: React.CSSProperties = {
    padding: "8px",
    margin: "4px",
    background: "#eee",
    border: "1px solid #aaa",
    borderRadius: "8px",
    cursor: "grab",
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
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
export default function Planejador({ dadosBackend }: PlanejadorProps) {
  const disciplinas: Disciplina[] = Object.values(dadosBackend);

  const [backlog, setBacklog] = useState<Disciplina[]>([]);
  const [plan, setPlan] = useState<Disciplina[][]>([[]]);
  const [bloqueados, setBloqueados] = useState<boolean[]>([false]);

  /* Inicializa backlog com disciplinas sem requisitos */
  useEffect(() => {
    const iniciais = disciplinas.filter((d) => d.requisitos.length === 0);
    setBacklog(iniciais);
  }, []);

  /* Função de drag & drop */
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
      if (mPeriod) return { type: "periodo" as const, periodoIndex: Number(mPeriod[1]) };
      return { type: "unknown" as const };
    };

    const src = parseActive(activeId);
    const dest = parseOver(overId);
    if (!src || dest.type === "unknown") return;

    // se não mudou de container
    if (src.from === "backlog" && dest.type === "backlog") return;
    if (
      src.from === "periodo" &&
      dest.type === "periodo" &&
      src.periodoIndex === dest.periodoIndex
    )
      return;

    // Bloqueio do período: impede drop
    if (dest.type === "periodo" && bloqueados[dest.periodoIndex]) return;

    // clona estados
    let newBacklog = [...backlog];
    let newPlan = plan.map((p) => [...p]);

    // pega e remove o item da origem
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

    // insere no destino
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

  /* Adicionar novo período e bloquear o anterior */
  const addPeriodo = () => {
    const lastIdx = plan.length - 1;

    // Bloqueia o último período
    const newBloqueados = [...bloqueados];
    newBloqueados[lastIdx] = true;
    setBloqueados(newBloqueados);

    // Atualiza backlog: inclui disciplinas cujo pré-requisito já está no plano
    const disciplinasAlocadasIds = plan.flat().map((d) => d.id);
    const novasDisciplinas = disciplinas.filter(
      (d) =>
        !disciplinasAlocadasIds.includes(d.id) &&
        d.requisitos.every((r) => disciplinasAlocadasIds.includes(r.id))
    );
    setBacklog(novasDisciplinas);

    // Adiciona novo período vazio
    setPlan([...plan, []]);
    setBloqueados([...newBloqueados, false]);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {/* Backlog */}
        <DroppableColumn id="backlog" title="Backlog">
          {backlog.map((d) => (
            <DraggableItem key={d.id} id={`backlog-${d.id}`}>
              {d.nome}
            </DraggableItem>
          ))}
        </DroppableColumn>

        {/* Períodos */}
        {plan.map((periodo, idx) => (
          <DroppableColumn
            key={idx}
            id={`periodo-${idx}`}
            title={`Período ${idx + 1}`}
            disabled={bloqueados[idx]}
          >
            {periodo.map((d) => (
              <DraggableItem key={d.id} id={`periodo-${idx}-${d.id}`}>
                {d.nome}
              </DraggableItem>
            ))}
          </DroppableColumn>
        ))}
      </DndContext>

      <div style={{ width: "100%" }}>
        <button onClick={addPeriodo}>+ Adicionar Período</button>
      </div>
    </div>
  );
}
