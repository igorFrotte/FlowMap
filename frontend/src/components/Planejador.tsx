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

/* ------------------ FUNÇÃO DE CAMINHOS CRÍTICOS (PERT/CPM) ------------------ */
/* Cada disciplina tem duração 1.
   Marca como críticos todos os nós que pertencem a pelo menos um
   caminho de comprimento máximo (pode haver vários caminhos). */
/* reqperiodo: todas as disciplinas do conjunto analisado com periodo <= reqperiodo
   são consideradas predecessoras daquela disciplina. */

function calcularCaminhoCritico(disciplinas: Disciplina[]): number[] {
  if (disciplinas.length === 0) return [];

  // Mapa id -> disciplina
  const map = new Map<number, Disciplina>();
  disciplinas.forEach((d) => map.set(d.id, d));

  // Mapas de predecessores/sucessores e indegree
  const predecessores = new Map<number, number[]>();
  const sucessores = new Map<number, number[]>();
  const indegree = new Map<number, number>();

  disciplinas.forEach((d) => {
    // Requisitos explícitos (requisitos)
    const predsExplicitos = [
      ...d.requisitos.map((r) => r.id),
    ];

    // Requisitos implícitos por reqperiodo:
    // todas as disciplinas do conjunto analisado com periodo <= reqperiodo
    let predsPeriodo: number[] = [];
    if (typeof d.reqperiodo === "number") {
      predsPeriodo = disciplinas
        .filter(
          (disc) =>
            disc.id !== d.id && disc.periodo <= (d.reqperiodo as number)
        )
        .map((disc) => disc.id);
    }

    // Une e filtra apenas ids presentes no conjunto analisado
    const predsSet = new Set<number>([
      ...predsExplicitos,
      ...predsPeriodo,
    ]);
    const preds = Array.from(predsSet).filter((id) => map.has(id));

    predecessores.set(d.id, preds);
    indegree.set(d.id, preds.length);

    preds.forEach((p) => {
      if (!sucessores.has(p)) sucessores.set(p, []);
      sucessores.get(p)!.push(d.id);
    });
  });

  // Ordenação topológica (Kahn)
  const indegreeWork = new Map<number, number>();
  indegree.forEach((v, k) => indegreeWork.set(k, v));

  const fila: number[] = [];
  indegreeWork.forEach((grau, id) => {
    if (grau === 0) fila.push(id);
  });

  const ordemTopologica: number[] = [];
  while (fila.length > 0) {
    const u = fila.shift()!;
    ordemTopologica.push(u);
    const sucs = sucessores.get(u) || [];
    sucs.forEach((v) => {
      const g = (indegreeWork.get(v) || 0) - 1;
      indegreeWork.set(v, g);
      if (g === 0) fila.push(v);
    });
  }

  // Se houver ciclo, não há DAG → não calculamos caminho crítico clássico
  if (ordemTopologica.length !== disciplinas.length) {
    return [];
  }

  // forward[u] = maior comprimento de caminho (em número de nós) que termina em u
  const forward = new Map<number, number>();
  disciplinas.forEach((d) => {
    forward.set(d.id, 1); // cada disciplina dura 1 unidade
  });

  ordemTopologica.forEach((id) => {
    const preds = predecessores.get(id) || [];
    if (preds.length === 0) {
      forward.set(id, 1);
    } else {
      let melhor = 1;
      preds.forEach((p) => {
        const cand = (forward.get(p) || 1) + 1;
        if (cand > melhor) melhor = cand;
      });
      forward.set(id, melhor);
    }
  });

  // backward[u] = maior comprimento de caminho (em número de nós) que começa em u
  const backward = new Map<number, number>();
  disciplinas.forEach((d) => {
    backward.set(d.id, 1);
  });

  const ordemReversa = [...ordemTopologica].reverse();
  ordemReversa.forEach((id) => {
    const sucs = sucessores.get(id) || [];
    if (sucs.length === 0) {
      backward.set(id, 1);
    } else {
      let melhor = 1;
      sucs.forEach((v) => {
        const cand = (backward.get(v) || 1) + 1;
        if (cand > melhor) melhor = cand;
      });
      backward.set(id, melhor);
    }
  });

  // Comprimento total do "projeto" (em número de nós)
  let L = 0;
  forward.forEach((valor) => {
    if (valor > L) L = valor;
  });

  if (L <= 0) return [];

  // Nó é crítico se estiver em pelo menos um caminho de comprimento L:
  // forward[u] + backward[u] - 1 === L
  const criticos = new Set<number>();
  disciplinas.forEach((d) => {
    const f = forward.get(d.id) || 0;
    const b = backward.get(d.id) || 0;
    if (f + b - 1 === L) {
      criticos.add(d.id);
    }
  });

  return Array.from(criticos);
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

const DraggableBox = styled.div<{
  $disabled?: boolean;
  $critical?: boolean;
  $difficulty?: number;
  $show?: boolean;
}>`
  padding: 8px 20px 8px 8px;
  margin: 4px;
  background-color: #d5e2f1;
  border: 2px solid ${({ $critical }) => ($critical ? "#d9534f" : "#5C8EC8")};
  border-radius: 8px;
  cursor: ${({ $disabled }) => ($disabled ? "pointer" : "grab")};
  position: relative;

  div {
    width: 20px;
    height: 100%;
    border-radius: 0 7px 7px 0;
    right: 0;
    top: 0;
    position: absolute;
    background-color: ${({ $show, $difficulty }) => {
      if (!$show) return "#d5e2f1";

      switch ($difficulty) {
        case 0:
          return "#c3ddff"; 
        case 1:
          return "#ffe5e5";
        case 2:
          return "#ffcccc";
        case 3:
          return "#f49a9a";
        case 4:
          return "#f96a6a";
        case 5:
          return "#ee3131"; 
        default:
          return "#d5e2f1"; 
      }
    }};
  }
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
  margin-bottom: 20px;
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

const PreviousDiscItem = styled.div<{ 
  $critical?: boolean; 
  $difficulty?: number; 
  $show?: boolean; 
}>`

  padding: 8px 20px 8px 8px;
  margin: 4px;
  border: 2px solid ${({ $critical }) => ($critical ? "#d9534f" : "#5C8EC8")};
  border-radius: 8px;
  background: #d5e2f1;
  position: relative;

  div {
    width: 20px;
    height: 100%;
    border-radius: 0 7px 7px 0;
    right: 0;
    top: 0;
    position: absolute;
    background-color: ${({ $show, $difficulty }) => {
      if (!$show) return "#d5e2f1";

      switch ($difficulty) {
        case 0:
          return "#c3ddff"; 
        case 1:
          return "#ffe5e5";
        case 2:
          return "#ffcccc";
        case 3:
          return "#f49a9a";
        case 4:
          return "#f96a6a";
        case 5:
          return "#ee3131"; 
        default:
          return "#d5e2f1"; 
      }
    }};
  }
`;

/* ------------------ ITEM ARRASTÁVEL ------------------ */
function DraggableItem({
  id,
  children,
  disabled = false,
  critical = false,
  difficulty,
  show
}: {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  critical?: boolean;
  difficulty?: number;
  show?: boolean;
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
      $critical={critical}
      $difficulty={difficulty}
      $show = {show}
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
  const [disciplinas, setDisciplinas] = useState<Record<string, Disciplina>>({});
  const [iniciado, setIniciado] = useState(false);
  const [planoAnterior, setPlanoAnterior] = useState<Disciplina[][]>([]);
  const [criticalPathIds, setCriticalPathIds] = useState<number[]>([]); // caminho crítico, em vermelho
  const [showDiff, setShowDiff] = useState<boolean>(false);

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

        // Já calcula caminho crítico das não aprovadas para exibir no Planejamento Anterior
        const todasNaoAprovadas = todas.filter(
          (d) => !d.aprovado
        ) as Disciplina[];

        if (todasNaoAprovadas.length > 0) {
          const caminho = calcularCaminhoCritico(todasNaoAprovadas);
          setCriticalPathIds(caminho);
        } else {
          setCriticalPathIds([]);
        }
      })
      .catch((e) => console.log(e.message));
  }, []);

  // IDs de disciplinas aprovadas
  const idsAprovadas = Object.values(disciplinas)
    .filter((d) => d.aprovado)
    .map((d) => d.id);

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

          const reqPeriodoOK =
            typeof d.reqperiodo !== "number"
              ? true
              : Object.values(disciplinas)
                  .filter((disc) => disc.periodo <= d.reqperiodo!)
                  .every((disc) => disc.aprovado);

          return (
            !iniciais.includes(d) && // não está disponível
            !(
              requisitosOK &&
              creditosOK &&
              reqPeriodoOK
            )
          );
        });

        setBacklog(iniciais);
        setBacklogTotal(bloqueadas);
        setPlan([[]]);
        setBloqueados([false]);
        setIniciado(true);
        setPlanoAnterior([]);

        // Caminho crítico inicial: todas não aprovadas (ainda não há alocadas)
        if (naoAprovadas.length > 0) {
          const caminho = calcularCaminhoCritico(naoAprovadas as Disciplina[]);
          setCriticalPathIds(caminho);
        } else {
          setCriticalPathIds([]);
        }
      })
      .catch((e) => console.log(e.message));
  };

  /* ------------------ CANCELAR PLANEJAMENTO ------------------ */
  const verPlanejamento = () => {
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

    // Recalcula caminho crítico para todas as disciplinas não aprovadas,
    // para também destacar no Planejamento Anterior
    const todasNaoAprovadas = todas.filter(
      (d) => !d.aprovado
    ) as Disciplina[];

    if (todasNaoAprovadas.length > 0) {
      const caminho = calcularCaminhoCritico(todasNaoAprovadas);
      setCriticalPathIds(caminho);
    } else {
      setCriticalPathIds([]);
    }

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
    // Caminho crítico é recalculado apenas em addPeriodo, como solicitado
  };

  /* ------------------ ADICIONAR NOVO PERÍODO ------------------ */
  const addPeriodo = () => {
    const lastPeriodo = plan[plan.length - 1];
    if (!lastPeriodo || lastPeriodo.length === 0) {
      alert("Você precisa adicionar disciplinas antes de criar um novo período.");
      return;
    }

    // IDs de disciplinas planejadas em períodos anteriores
    const idsPlanejadosAntes = plan
      .slice(0, -1)
      .flat()
      .map((d) => d.id);

    const idsDisponiveis = [...new Set([...idsAprovadas, ...idsPlanejadosAntes])];

    // Verifica correquisitos do último período
    for (const disc of lastPeriodo) {
      if (disc.correquisitos.length > 0) {
        const idsCorreq = disc.correquisitos.map((c) => c.id);

        const correqOK = idsCorreq.every(
          (id) =>
            idsDisponiveis.includes(id) ||
            lastPeriodo.some((d) => d.id === id)
        );

        if (!correqOK) {
          alert(
            `A disciplina "${disc.nome}" possui correquisitos que não estão no mesmo período ou ainda não foram cursados.`
          );
          return;
        }
      }
    }

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
              .every(
                (disc) =>
                  disc.aprovado || disciplinasAlocadasIds.includes(disc.id)
              );

      return (
        !disciplinasAlocadasIds.includes(d.id) &&
        !(requisitosOK && creditosOK && reqPeriodoOK)
      );
    });

    setBacklog(novasDisciplinas);
    setBacklogTotal(bloqueadas);
    setPlan([...plan, []]);
    setBloqueados([...newBloqueados, false]);

    // Conjunto de disciplinas restantes (disponíveis + bloqueadas),
    // excluindo o que já foi planejado
    const restantesMap = new Map<number, Disciplina>();

    novasDisciplinas.forEach((d) => restantesMap.set(d.id, d));
    bloqueadas.forEach((d) => restantesMap.set(d.id, d));

    const restantes = Array.from(restantesMap.values());

    // Recalcula caminho crítico com base nas disciplinas restantes
    if (restantes.length > 0) {
      const caminho = calcularCaminhoCritico(restantes);
      setCriticalPathIds(caminho);
    } else {
      setCriticalPathIds([]);
    }
  };

  /* ------------------ SALVAR PLANEJAMENTO ------------------ */
  const salvarPlanejamento = () => {
    if (backlog.length === 0 && backlogTotal.length === 0) {
      let objs = plan.map((el, i) => ({
        idsDisciplinas: el.map((e) => e.id),
        periodoPlan: (i + 1) as number | null,
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
          setCriticalPathIds([]);
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

              // após recarregar, recalcula caminho crítico das não aprovadas
              const todasNaoAprovadas = todas.filter(
                (d) => !d.aprovado
              ) as Disciplina[];
              if (todasNaoAprovadas.length > 0) {
                const caminho = calcularCaminhoCritico(todasNaoAprovadas);
                setCriticalPathIds(caminho);
              } else {
                setCriticalPathIds([]);
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
                const totalCreditos = periodo.reduce(
                  (acc, d) => acc + d.credito,
                  0
                );

                return (
                  <PreviousPeriodCard key={idx}>
                    <PreviousPeriodTitle>
                      Período Planejado {idx + 1}
                    </PreviousPeriodTitle>

                    {periodo.map((d) => (
                      <PreviousDiscItem
                        key={d.id}
                        $critical={criticalPathIds.includes(d.id)}
                        $difficulty={Number(d.dificuldade ?? 0)}
                        $show={showDiff}
                      >
                        {d.nome + " - " + d.periodo + "º"}
                        <div></div>
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
          <Button onClick={() => setShowDiff(!showDiff)}>Mostrar Dificuldades</Button>
          <Button onClick={resetPlanejamento}>Iniciar Planejamento</Button>
          <Link to="/fluxograma">
            <Button>Fluxograma</Button>
          </Link>
        </BottomActions>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PreviousPlanTitle>Planejar Períodos</PreviousPlanTitle>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <ColumnsWrapper>
          <DroppableColumn
            id="backlog-total"
            title="Disciplinas Indisponíveis"
            disabled
          >
            {backlogTotal.map((d) => (
              <DraggableItem
                key={d.id}
                id={`block-${d.id}`}
                disabled
                critical={criticalPathIds.includes(d.id)}
                difficulty={Number(d.dificuldade ?? 0)}
                show={showDiff}
              >
                <span
                  title={
                    d.reqcreditos
                      ? `Requisito: ${d.reqcreditos} créditos`
                      : "Requisito: " + d.requisitos.map((r) => r.nome).join(", ")
                  }
                >
                  {d.nome + " - " + d.periodo + "º"}
                  <div></div>
                </span>
              </DraggableItem>
            ))}
          </DroppableColumn>

          <DroppableColumn id="backlog" title="Disciplinas Disponíveis">
            {backlog.map((d) => (
              <DraggableItem
                key={d.id}
                id={`backlog-${d.id}`}
                critical={criticalPathIds.includes(d.id)}
                difficulty={Number(d.dificuldade ?? 0)}
                show={showDiff}
              >
                {d.nome + " - " + d.periodo + "º"}
                <div></div>
              </DraggableItem>
            ))}
          </DroppableColumn>

          {plan.map((periodo, idx) => {
            const totalCreditos = periodo.reduce(
              (acc, d) => acc + d.credito,
              0
            );

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
                    critical={criticalPathIds.includes(d.id)}
                    difficulty={Number(d.dificuldade ?? 0)}
                    show={showDiff}
                  >
                    {d.nome + " - " + d.periodo + "º"}
                    <div></div>
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
        <Button onClick={() => setShowDiff(!showDiff)}>Mostrar Dificuldades</Button>
        <Button onClick={resetPlanejamento}>Reiniciar Planejamento</Button>
        <Button onClick={verPlanejamento}>Cancelar Planejamento</Button>
        <Button onClick={salvarPlanejamento}>Salvar Planejamento</Button>
      </BottomActions>
    </PageContainer>
  );
}
