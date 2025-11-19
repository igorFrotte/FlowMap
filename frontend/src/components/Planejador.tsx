import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  DragEndEvent,
} from "@dnd-kit/core";
import styled from "styled-components";
import axiosService from "../services/axiosService";
import { Link } from "react-router-dom";

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

/* ------------------ STYLED COMPONENTS ------------------ */

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ColumnsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const ColumnContainer = styled.div<{ $disabled?: boolean }>`
  min-height: 120px;
  width: 350px;
  padding: 10px;
  margin: 10px;
  background: ${({ $disabled }) => ($disabled ? "#f0f0f0" : "#fafafa")};
  border: ${({ $disabled }) =>
    $disabled ? "3px solid #5C8EC8" : "3px dashed #5C8EC8"};
  border-radius: 10px;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  display: flex;             
  flex-direction: column;    
`;

const ColumnTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
`;

const DraggableBox = styled.div<{ $disabled?: boolean }>`
  padding: 8px;
  margin: 4px;
  background: ${({ $disabled }) => ($disabled ? "#ddd" : "#d5e2f1")};
  border: 1px solid #5C8EC8;
  border-radius: 8px;
  z-index: 3;
  cursor: ${({ $disabled }) => ($disabled ? "pointer" : "grab")};
`;

const BottomActions = styled.div`
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const Button = styled.button`
  width: 180px;
  height: 40px;
  border-radius: 10px;
  background: #0056b3;
  cursor: pointer;
  color: white;
  font-size: 15px;
`;

const PreviousPlanWrapper = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PreviousPlanTitle = styled.h2`
  margin: 20px;
  font-size: 20px;
  text-align: center;
`;

const PreviousPlanColumns = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const PreviousPeriodCard = styled.div`
  width: 350px;
  margin: 10px;
  padding: 10px;
  border: 3px solid #5C8EC8;
  border-radius: 10px;
  background: #fafafa;
  display: flex;             
  flex-direction: column;    
`;

const PeriodTotal = styled.div`
  margin-top: auto;          
  align-self: flex-end;      
  font-size: 12px;
  font-weight: bold;
`;

const PreviousPeriodTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
`;

const PreviousDiscItem = styled.div`
  padding: 10px;
  margin: 4px;
  border: 1px solid #5C8EC8;
  border-radius: 6px;
  background: #d5e2f1;
`;

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

  const isDragging = !disabled && !!transform;

  const style: React.CSSProperties = {
    transform:
      !disabled && transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    position: isDragging ? "relative" : undefined, 
    zIndex: isDragging ? 999 : undefined, 
  };

  return (
    <DraggableBox
      ref={setNodeRef}
      style={style}
      $disabled={disabled}
      {...(!disabled ? { ...listeners, ...attributes } : {})}
    >
      {children}
    </DraggableBox>
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

  return (
    <ColumnContainer ref={setNodeRef} $disabled={disabled}>
      <ColumnTitle>{title}</ColumnTitle>
      {children}
    </ColumnContainer>
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

  /* ------------------ CANCELAR PLANEJAMENTO ------------------ */
  const verPlanejamento = () => {
    // Reconstroi o planejamento anterior a partir das disciplinas já carregadas
    const todas = Object.values(disciplinas) as Disciplina[];

    const maxPeriodo = Math.max(
      0,
      ...todas
        .filter((d) => d.periodoplan)
        .map((d) => d.periodoplan ?? 0)
    );

    if (maxPeriodo > 0) {
      const plano: Disciplina[][] = Array.from(
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

    // Volta para o estado inicial do planejador
    setIniciado(false);
    setBacklog([]);
    setBacklogTotal([]);
    setPlan([[]]);
    setBloqueados([false]);
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

  // 🔹 Pega IDs de disciplinas cursadas (aprovadas)
  const idsAprovadas = Object.values(disciplinas)
    .filter((d) => d.aprovado)
    .map((d) => d.id);

/* ------------------ ADICIONAR NOVO PERÍODO ------------------ */
  const addPeriodo = () => {
    // 🔹 Pega o último período planejado
    const lastPeriodo = plan[plan.length - 1];
    if (!lastPeriodo || lastPeriodo.length === 0) {
      alert("Você precisa adicionar disciplinas antes de criar um novo período.");
      return;
    }

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
        periodoPlan: i + 1 as number | null,
      }));

      objs.push({
        idsDisciplinas: idsAprovadas,
        periodoPlan: null,
      });

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
      <PageContainer>
        {planoAnterior.length > 0 && (
          <PreviousPlanWrapper>
            <PreviousPlanTitle>Planejamento Anterior</PreviousPlanTitle>
            <PreviousPlanColumns>
              {planoAnterior.map((periodo, idx) => {
                const totalCreditos = periodo.reduce((acc, d) => acc + d.credito, 0);

                return (
                  <PreviousPeriodCard key={idx}>
                    <PreviousPeriodTitle>
                      Período Planejado {idx + 1}
                    </PreviousPeriodTitle>

                    {periodo.map((d) => (
                      <PreviousDiscItem key={d.id}>
                        {d.nome + " - " + d.periodo + "º"}
                      </PreviousDiscItem>
                    ))}

                    <PeriodTotal>
                      Carga horária: {totalCreditos}h
                    </PeriodTotal>
                  </PreviousPeriodCard>
                );
              })}
            </PreviousPlanColumns>
          </PreviousPlanWrapper>
        )}
        <BottomActions>
          <Button onClick={resetPlanejamento}>Iniciar Planejamento</Button>
          <Link to="/fluxograma"><Button>Fluxograma</Button></Link>
        </BottomActions>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PreviousPlanTitle>Planejar Períodos</PreviousPlanTitle>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <ColumnsWrapper>
          <DroppableColumn id="backlog-total" title="Disciplinas Indisponíveis" disabled>
            {backlogTotal.map((d) => (
              <DraggableItem key={d.id} id={`block-${d.id}`} disabled>
                <span
                  title={
                    d.reqcreditos
                      ? `Requisito: ${d.reqcreditos} créditos`
                      : "Requisito: " + d.requisitos.map((r) => r.nome).join(", ")
                  }
                >
                  {d.nome + " - " + d.periodo + "º"}
                </span>
              </DraggableItem>
            ))}
          </DroppableColumn>

          <DroppableColumn id="backlog" title="Disciplinas Disponíveis">
            {backlog.map((d) => (
              <DraggableItem key={d.id} id={`backlog-${d.id}`}>
                {d.nome + " - " + d.periodo + "º"}
              </DraggableItem>
            ))}
          </DroppableColumn>

          {plan.map((periodo, idx) => {
            const totalCreditos = periodo.reduce((acc, d) => acc + d.credito, 0);

            return (
              <DroppableColumn
                key={idx}
                id={`periodo-${idx}`}
                title={`Período Planejado ${idx + 1}`}
                disabled={bloqueados[idx]}
              >
                {periodo.map((d) => (
                  <DraggableItem
                    key={d.id}
                    id={`periodo-${idx}-${d.id}`}
                    disabled={bloqueados[idx]}
                  >
                    {d.nome + " - " + d.periodo + "º"}
                  </DraggableItem>
                ))}

                <PeriodTotal>
                  Carga horária: {totalCreditos}h
                </PeriodTotal>
              </DroppableColumn>
            );
          })}
        </ColumnsWrapper>
      </DndContext>

      <BottomActions>
        <Button onClick={addPeriodo}>+ Adicionar Período</Button>
        <Button onClick={salvarPlanejamento}>Salvar Planejamento</Button>
        <Button onClick={resetPlanejamento}>Reiniciar Planejamento</Button>
        <Button onClick={verPlanejamento}>Cancelar Planejamento</Button>
      </BottomActions>
    </PageContainer>
  );
}
