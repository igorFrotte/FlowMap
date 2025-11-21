import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import axiosService from "../services/axiosService";

interface Universidade {
  id: number;
  nome: string;
}

interface Disciplina {
  id: number;
  nome: string;
  periodo: number;
  credito?: number;
  dificuldade?: number;
  informacao?: string;
  reqCreditos?: number;
  reqPeriodos?: number;
  preRequisitos?: string[]; 
  coRequisitos?: string[];
}

interface Periodo {
  numero: number;
  disciplinas: Disciplina[];
}

interface Curso {
  id?: number;
  nome: string;
  idUniversidade: number;
  periodos: Periodo[];
}

export default function CursoForm() {
  const { idCurso } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState<Curso>({
    nome: "",
    idUniversidade: 0,
    periodos: [],
  });
  const [universidades, setUniversidades] = useState<Universidade[]>([]);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState<{ periodo: number; disciplina: number } | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [novaUniversidadeNome, setNovaUniversidadeNome] = useState("");
  const [notificacao, setNotificacao] = useState("");

  const [nextId, setNextId] = useState(0.5);

  useEffect(() => {
    carregarUniversidades();
    if (idCurso != "novo") 
      axiosService.buscarCursoPeloId(Number(idCurso)).then(res => setCurso(res.data));
  }, [idCurso]);

  const carregarUniversidades = async () => {
    try {
      const res = await axiosService.mostrarUniversidades();
      setUniversidades(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setModalAberto(false);
    setNovaUniversidadeNome("");
  };

  const criarNovaUniversidade = () => {
    if (!novaUniversidadeNome.trim()) return;

    axiosService
      .criarUniversidade({nome: novaUniversidadeNome})
      .then(res => {
        carregarUniversidades();
        setCurso(prev => ({ ...prev, idUniversidade: res.data.id }));
        setNotificacao("Universidade criada com sucesso!");
        fecharModal();
      })
      .catch(err => {
        console.log(err);
        setNotificacao("Erro ao criar a Universidade"); //mudar
      });
  };

  const adicionarPeriodo = () => {
    const qtdPeriodos = curso.periodos.length;
    if (qtdPeriodos > 0) {
      const ultimoPeriodo = curso.periodos[qtdPeriodos - 1];
      if (ultimoPeriodo.disciplinas.length === 0) {
        setNotificacao("O período anterior deve ter pelo menos uma disciplina antes de adicionar outro.");
        return;
      }
    }

    const novoPeriodo = { numero: qtdPeriodos + 1, disciplinas: [] };
    setCurso(prev => ({ ...prev, periodos: [...prev.periodos, novoPeriodo] }));
  };

  const idGenerate = () => {
    setNextId(nextId + 1);
    return nextId;
  };

  const adicionarDisciplina = (numPeriodo: number) => {
    const novosPeriodos = [...curso.periodos];
    const periodo = novosPeriodos.find(p => p.numero === numPeriodo);
    if (!periodo) return;

    
    periodo.disciplinas.push({
      id: idGenerate(),
      nome: "",
      periodo: numPeriodo,
      credito: undefined,
      dificuldade: undefined,
      informacao: "",
      reqCreditos: undefined,
      reqPeriodos: undefined,
      preRequisitos: [],
      coRequisitos: [],
    });

    setCurso({ ...curso, periodos: novosPeriodos });
    setOpenIndex({ periodo: numPeriodo, disciplina: periodo.disciplinas.length - 1 });
  };

  const atualizarDisciplina = (numPeriodo: number, index: number, campo: string, valor: any) => {
    const novosPeriodos = [...curso.periodos];
    const periodo = novosPeriodos.find(p => p.numero === numPeriodo);
    if (!periodo) return;
    (periodo.disciplinas[index] as any)[campo] = valor;
    setCurso({ ...curso, periodos: novosPeriodos });
  };

  const removerDisciplina = (numPeriodo: number, index: number) => {
    const novosPeriodos = [...curso.periodos];
    const periodo = novosPeriodos.find(p => p.numero === numPeriodo);
    if (!periodo) return;

    const disciplinaRemovida = periodo.disciplinas[index];

    // Remove a disciplina do período
    periodo.disciplinas.splice(index, 1);

    // Remove como pré e co-requisito em todas as disciplinas
    novosPeriodos.forEach(p => {
      p.disciplinas.forEach(d => {
        if (d.preRequisitos) {
          d.preRequisitos = d.preRequisitos.filter(
            idComp => idComp !== `${numPeriodo}-${disciplinaRemovida.id}`
          );
        }
        if (d.coRequisitos) {
          d.coRequisitos = d.coRequisitos.filter(
            idComp => idComp !== `${numPeriodo}-${disciplinaRemovida.id}`
          );
        }
      });
    });

    setCurso({ ...curso, periodos: novosPeriodos });

    // Fecha o accordion caso a disciplina aberta seja removida
    if (openIndex?.periodo === numPeriodo && openIndex?.disciplina === index) setOpenIndex(null);
  };


  const salvarCurso = async () => {
    try {
      setError("");
      const dados = { ...curso, nPeriodos: curso.periodos.length };
      console.log(dados)
      if (idCurso != "novo") await axiosService.atualizarCurso(idCurso || "", dados);
      else await axiosService.criarCurso(dados);
      navigate("/adm");
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar curso.");
    }
  };

  const getDisciplinaNome = (periodoNum: number, idx: number) => {
    const periodo = curso.periodos.find(p => p.numero === periodoNum);
    if (!periodo) return `Disciplina ${idx}`;
    const disc = periodo.disciplinas.filter((e) => e.id == idx)[0];
    return disc?.nome || `Disciplina ${idx}`;
  };

  const removerUltimoPeriodo = () => {
    if (curso.periodos.length === 0) return;
    const novosPeriodos = curso.periodos.slice(0, -1); 
    setCurso({ ...curso, periodos: novosPeriodos });
  };


  return (
    <Container>
      <Form>
        <Title>{idCurso != "novo" ? "Editar Curso" : "Novo Curso"}</Title>

        {error && <ErrorMsg>{error}</ErrorMsg>}
        {notificacao && <Notificacao>{notificacao}</Notificacao>}

        <Input
          type="text"
          placeholder="Nome do curso"
          value={curso.nome}
          onChange={e => setCurso({ ...curso, nome: e.target.value })}
        />

        <Select
          value={curso.idUniversidade}
          onChange={e => setCurso({ ...curso, idUniversidade: +e.target.value })}
        >
          <option value={0}>Selecione uma universidade</option>
          {universidades.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </Select>

        <Button type="button" onClick={abrirModal}>+ Criar Nova Universidade</Button>

        <SectionTitle>Períodos</SectionTitle>
        {curso?.periodos?.map(p => (
          <PeriodoCard key={p.numero}>
            <PeriodoHeader>
              <div>Período {p.numero}</div>
              {p.numero === curso.periodos.length && (
                <RemoveButton
                      onClick={(e) => {
                        e.stopPropagation();
                        removerUltimoPeriodo();
                      }}
                    >
                      ✕
                </RemoveButton>
              )}
            </PeriodoHeader>

            {p.disciplinas.map((d, di) => (
              <DisciplinaCard key={di}>
                <AccordionHeader
                  onClick={() =>
                    setOpenIndex(
                      openIndex?.periodo === p.numero && openIndex?.disciplina === di
                        ? null
                        : { periodo: p.numero, disciplina: di }
                    )
                  }
                >
                  {d.nome || `Disciplina ${di + 1}`}
                  <RemoveButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removerDisciplina(p.numero, di);
                    }}
                  >
                    ✕
                  </RemoveButton>
                </AccordionHeader>

                {openIndex?.periodo === p.numero && openIndex?.disciplina === di && (
                  <AccordionBody>
                    <Input
                      type="text"
                      placeholder="Nome da Disciplina"
                      value={d.nome}
                      onChange={e => atualizarDisciplina(p.numero, di, "nome", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Número de Créditos"
                      value={d.credito || ""}
                      onChange={e => atualizarDisciplina(p.numero, di, "credito", +e.target.value)}
                    />
                    <Select
                      value={d.dificuldade || ""}
                      onChange={e => atualizarDisciplina(p.numero, di, "dificuldade", +e.target.value)}
                    >
                      <option value="">Selecione a dificuldade</option>
                      <option value={5}>5 - Disciplina muito complexa, exige estudo diário e atenção constante</option>
                      <option value={4}>4 - Conteúdo avançado, exige prática e compreensão sólida de matérias anteriores</option>
                      <option value={3}>3 - Conteúdo moderado, exige estudo consistente, mas não intenso</option>
                      <option value={2}>2 - Conceitos fundamentais, introdutórios, baixo esforço</option>
                      <option value={1}>1 - Aprendizado rápido, baixa carga prática ou teórica</option>
                    </Select>
                    
                    {/* Requisitos em créditos */}
                    <RequisitoContainer>
                      <label>
                        <input
                          type="checkbox"
                          checked={d.reqCreditos != null}
                          onChange={(e) =>
                            atualizarDisciplina(
                              p.numero,
                              di,
                              "reqCreditos",
                              e.target.checked ? "" : null // <-- valor vazio, não zero
                            )
                          }
                        />
                        Possui requisitos em créditos cursados
                      </label>
                      {d.reqCreditos != null && (
                        <Input
                          type="number"
                          placeholder="Digite o número mínimo de créditos"
                          autoFocus // <-- foca automaticamente
                          value={d.reqCreditos}
                          onChange={(e) =>
                            atualizarDisciplina(p.numero, di, "reqCreditos", +e.target.value)
                          }
                        />
                      )}
                    </RequisitoContainer>

                    {/* Requisitos em períodos */}
                    <RequisitoContainer>
                      <label>
                        <input
                          type="checkbox"
                          checked={d.reqPeriodos != null}
                          onChange={(e) =>
                            atualizarDisciplina(
                              p.numero,
                              di,
                              "reqPeriodos",
                              e.target.checked ? "" : null // <-- valor vazio
                            )
                          }
                        />
                        Possui requisito de período mínimo
                      </label>
                      {d.reqPeriodos != null && (
                        <Input
                          type="number"
                          placeholder="Digite o período mínimo exigido"
                          autoFocus
                          value={d.reqPeriodos}
                          onChange={(e) =>
                            atualizarDisciplina(p.numero, di, "reqPeriodos", +e.target.value)
                          }
                        />
                      )}
                    </RequisitoContainer>

                    {/* Pré-Requisitos */}
                    <RequisitoContainer>
                      <RequisitoTitle>Pré-Requisitos</RequisitoTitle>
                      <RequisitoAddRow>
                        <Select
                          value=""
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!value) return;
                            const jaExiste = d.preRequisitos?.includes(value);
                            if (!jaExiste) {
                              atualizarDisciplina(p.numero, di, "preRequisitos", [
                                ...(d.preRequisitos || []),
                                value,
                              ]);
                            }
                          }}
                        >
                          <option value="">Selecionar disciplina</option>
                          {curso.periodos
                            .filter(pp => pp.numero < p.numero)
                            .flatMap(pp =>
                              pp.disciplinas.map((disc, idx) => (
                                <option key={`${pp.numero}-${disc.id}`} value={`${pp.numero}-${disc.id}`}>
                                  {`P${pp.numero}: ${disc.nome}`}
                                </option>
                              ))
                            )}
                        </Select>
                      </RequisitoAddRow>

                      <RequisitoList>
                        {d.preRequisitos?.map((idComp, idx) => {
                          const [per, ind] = idComp.split("-");
                          const nome = getDisciplinaNome(Number(per), Number(ind));
                          return (
                            <RequisitoItem key={idx}>
                              <span>{`P${per}: ${nome}`}</span>
                              <RemoveButton
                                onClick={() =>
                                  atualizarDisciplina(
                                    p.numero,
                                    di,
                                    "preRequisitos",
                                    d.preRequisitos!.filter((_, i) => i !== idx)
                                  )
                                }
                              >
                                ✕
                              </RemoveButton>
                            </RequisitoItem>
                          );
                        })}
                      </RequisitoList>
                    </RequisitoContainer>

                    {/* Co-Requisitos */}
                    <RequisitoContainer>
                      <RequisitoTitle>Co-Requisitos</RequisitoTitle>
                      <RequisitoAddRow>
                        <Select
                          value=""
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!value) return;
                            const jaExiste = d.coRequisitos?.includes(value);
                            if (!jaExiste) {
                              atualizarDisciplina(p.numero, di, "coRequisitos", [
                                ...(d.coRequisitos || []),
                                value,
                              ]);
                            }
                          }}
                        >
                          <option value="">Selecionar disciplina</option>
                          {p.disciplinas
                            .filter((_, idx) => idx !== di)
                            .map((disc, idx) => (
                              <option key={`co-${p.numero}-${disc.id}`} value={`${p.numero}-${disc.id}`}>
                                {disc.nome}
                              </option>
                            ))}
                        </Select>
                      </RequisitoAddRow>

                      <RequisitoList>
                        {d.coRequisitos?.map((idComp, idx) => {
                          const [per, ind] = idComp.split("-");
                          const nome = getDisciplinaNome(Number(per), Number(ind));
                          return (
                            <RequisitoItem key={idx}>
                              <span>{`P${per}: ${nome}`}</span>
                              <RemoveButton
                                onClick={() =>
                                  atualizarDisciplina(
                                    p.numero,
                                    di,
                                    "coRequisitos",
                                    d.coRequisitos!.filter((_, i) => i !== idx)
                                  )
                                }
                              >
                                ✕
                              </RemoveButton>
                            </RequisitoItem>
                          );
                        })}
                      </RequisitoList>
                    </RequisitoContainer>
                  </AccordionBody>
                )}
              </DisciplinaCard>
            ))}

            <Button type="button" onClick={() => adicionarDisciplina(p.numero)}>+ Adicionar Disciplina</Button>
          </PeriodoCard>
        ))}

        <Button type="button" onClick={adicionarPeriodo}>+ Adicionar Período</Button>
        <Buttons>
          <Button type="button" onClick={() => navigate("/adm")}>Voltar</Button>
          <Button type="button" onClick={salvarCurso}>Salvar Curso</Button>
        </Buttons>
      </Form>

      {/* Modal de criação de universidade */}
      {modalAberto && (
        <ModalOverlay>
          <ModalContainer>
            <h3>Criar Nova Universidade</h3>
            <Input
              type="text"
              placeholder="Nome da universidade"
              value={novaUniversidadeNome}
              onChange={e => setNovaUniversidadeNome(e.target.value)}
            />
            <Button type="button" onClick={criarNovaUniversidade}>Criar</Button>
            <Button type="button" onClick={fecharModal}>Cancelar</Button>
          </ModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
}

/* ===== STYLES ===== */
const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  min-height: 100vh;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  gap: 1rem;
`;

const Title = styled.h2`
  text-align: center; 
  color: #333;
  font-size: 24px;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  margin-bottom: 0.5rem;
  &:focus { border-color: #007bff; }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
`;

const Buttons = styled.div`
  display: flex;
  gap: 10%;

  button {
    width: 45%;
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
  &:hover { background: #0056b3; }
`;
const ErrorMsg = styled.p`color: #e63946; font-size: 0.9rem; text-align: center;`;
const Notificacao = styled.p`color: #2a9d8f; font-size: 0.9rem; text-align: center; margin-bottom: 0.5rem;`;

const SectionTitle = styled.h3`
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
`;

const PeriodoCard = styled.div`
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 1rem;
  background: #fefefe;
  margin-bottom: 1rem;
`;

const PeriodoHeader = styled.h4`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const DisciplinaCard = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const AccordionHeader = styled.div`
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
`;

const AccordionBody = styled.div`
  padding: 1rem;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: #e63946;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
`;

const RequisitoContainer = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
`;

const RequisitoTitle = styled.span`
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const RequisitoAddRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RequisitoList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const RequisitoItem = styled.div`
  background: #e9ecef;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

// ===== Modal =====
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
`;

