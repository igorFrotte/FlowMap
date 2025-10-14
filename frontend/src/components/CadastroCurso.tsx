import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import axiosService from "../services/axiosService";

interface Universidade {
  id: number;
  nome: string;
}

interface Disciplina {
  id?: number;
  nome: string;
  periodo: number;
  credito: number;
  dificuldade?: number;
  informacao?: string;
  reqCreditos?: number;
  reqPeriodos?: number;
  preRequisitos?: number[]; // ids das disciplinas
  coRequisitos?: number[];  // ids das disciplinas
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
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState<Curso>({
    nome: "",
    idUniversidade: 0,
    periodos: [],
  });
  const [universidades, setUniversidades] = useState<Universidade[]>([]);
  const [novaUniversidade, setNovaUniversidade] = useState("");
  const [error, setError] = useState("");

  const [openIndex, setOpenIndex] = useState<{ periodo: number; disciplina: number } | null>(null);

  useEffect(() => {
    axiosService.mostrarUniversidades().then(res => setUniversidades(res.data));
    // if (id) axiosService.buscarCurso(id).then(res => setCurso(res.data));
  }, [id]);

  const adicionarPeriodo = () => {
    const novoPeriodo = {
      numero: curso.periodos.length + 1,
      disciplinas: [],
    };
    setCurso(prev => ({
      ...prev,
      periodos: [...prev.periodos, novoPeriodo],
    }));
  };

  const adicionarDisciplina = (numPeriodo: number) => {
    const novosPeriodos = [...curso.periodos];
    const periodo = novosPeriodos.find(p => p.numero === numPeriodo);
    if (!periodo) return;

    periodo.disciplinas.push({
      nome: "",
      periodo: numPeriodo,
      credito: 1,
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
    periodo.disciplinas.splice(index, 1);
    setCurso({ ...curso, periodos: novosPeriodos });
    if (openIndex?.periodo === numPeriodo && openIndex?.disciplina === index) setOpenIndex(null);
  };

  const salvarCurso = async () => {
    try {
      setError("");
      let universidadeId = curso.idUniversidade;

      if (novaUniversidade.trim()) {
        // const res = await axiosService.criarUniversidade({ nome: novaUniversidade });
        // universidadeId = res.data.id;
      }

      const dados = {
        ...curso,
        idUniversidade: universidadeId,
        nPeriodos: curso.periodos.length,
      };

      // if (id) await axiosService.atualizarCurso(id, dados);
      // else await axiosService.criarCurso(dados);

      navigate("/adm");
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar curso.");
    }
  };

  // Função auxiliar: busca nome da disciplina pelo id (base simplificada)
  const getDisciplinaNome = (periodoNum: number, idx: number) => {
    const periodo = curso.periodos.find(p => p.numero === periodoNum);
    if (!periodo) return `Disciplina ${idx}`;
    const disc = periodo.disciplinas[idx];
    return disc?.nome || `Disciplina ${idx + 1}`;
  };

  return (
    <Container>
      <Form>
        <Title>{id ? "Editar Curso" : "Novo Curso"}</Title>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        {/* Curso */}
        <Input
          type="text"
          placeholder="Nome do curso"
          value={curso.nome}
          onChange={e => setCurso({ ...curso, nome: e.target.value })}
        />

        {/* Universidade */}
        <Select
          value={curso.idUniversidade}
          onChange={e => setCurso({ ...curso, idUniversidade: +e.target.value })}
        >
          <option value={0}>Selecione uma universidade</option>
          {universidades.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </Select>

        <Input
          type="text"
          placeholder="Ou criar nova universidade"
          value={novaUniversidade}
          onChange={e => setNovaUniversidade(e.target.value)}
        />

        {/* Períodos e Disciplinas */}
        <SectionTitle>Períodos</SectionTitle>

        {curso.periodos.map((p, pi) => (
          <PeriodoCard key={pi}>
            <PeriodoHeader>Período {p.numero}</PeriodoHeader>

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
                      placeholder="Nome da disciplina"
                      value={d.nome}
                      onChange={e => atualizarDisciplina(p.numero, di, "nome", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Créditos"
                      value={d.credito}
                      onChange={e => atualizarDisciplina(p.numero, di, "credito", +e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Dificuldade"
                      value={d.dificuldade || ""}
                      onChange={e => atualizarDisciplina(p.numero, di, "dificuldade", +e.target.value)}
                    />
                    <Input
                      type="text"
                      placeholder="Informações"
                      value={d.informacao || ""}
                      onChange={e => atualizarDisciplina(p.numero, di, "informacao", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Créditos mínimos exigidos"
                      value={d.reqCreditos || ""}
                      onChange={e => atualizarDisciplina(p.numero, di, "reqCreditos", +e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Período mínimo exigido"
                      value={d.reqPeriodos || ""}
                      onChange={e => atualizarDisciplina(p.numero, di, "reqPeriodos", +e.target.value)}
                    />

                    {/* Pré-Requisitos */}
                    <RequisitoContainer>
                      <RequisitoTitle>Pré-Requisitos</RequisitoTitle>
                      <RequisitoAddRow>
                        <Select
                          value=""
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!value) return;
                            const [periodoNum, idxStr] = value.split("-");
                            const idComposto = `${periodoNum}-${idxStr}`;
                            const jaExiste = d.preRequisitos?.includes(idComposto as any);
                            if (!jaExiste) {
                              atualizarDisciplina(p.numero, di, "preRequisitos", [
                                ...(d.preRequisitos || []),
                                idComposto,
                              ]);
                            }
                          }}
                        >
                          <option value="">Selecionar disciplina</option>
                          {curso.periodos
                            .filter(pp => pp.numero < p.numero)
                            .flatMap(pp =>
                              pp.disciplinas.map((disc, idx) => (
                                <option key={`${pp.numero}-${idx}`} value={`${pp.numero}-${idx}`}>
                                  {`P${pp.numero}: ${disc.nome || `Disciplina ${idx + 1}`}`}
                                </option>
                              ))
                            )}
                        </Select>
                      </RequisitoAddRow>

                      <RequisitoList>
                        {d.preRequisitos?.map((idComp, idx) => {
                          const [per, ind] = idComp.toString().split("-");
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
                            const [periodoNum, idxStr] = value.split("-");
                            const idComposto = `${periodoNum}-${idxStr}`;
                            const jaExiste = d.coRequisitos?.includes(idComposto as any);
                            if (!jaExiste) {
                              atualizarDisciplina(p.numero, di, "coRequisitos", [
                                ...(d.coRequisitos || []),
                                idComposto,
                              ]);
                            }
                          }}
                        >
                          <option value="">Selecionar disciplina</option>
                          {p.disciplinas
                            .filter((_, idx) => idx !== di)
                            .map((disc, idx) => (
                              <option key={`co-${p.numero}-${idx}`} value={`${p.numero}-${idx}`}>
                                {disc.nome || `Disciplina ${idx + 1}`}
                              </option>
                            ))}
                        </Select>
                      </RequisitoAddRow>

                      <RequisitoList>
                        {d.coRequisitos?.map((idComp, idx) => {
                          const [per, ind] = idComp.toString().split("-");
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
        <Button type="button" onClick={salvarCurso}>Salvar Curso</Button>
      </Form>
    </Container>
  );
}

/* ======== STYLES ========= */
const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  background: #f8f9fa;
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
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  margin-bottom: 0.5rem;
  &:focus {
    border-color: #007bff;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
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
  &:hover {
    background: #0056b3;
  }
`;

const ErrorMsg = styled.p`
  color: #e63946;
  font-size: 0.9rem;
  text-align: center;
`;

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
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
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
