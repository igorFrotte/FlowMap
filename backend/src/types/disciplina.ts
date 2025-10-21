export type DisciplinaComDeps = {
  id: number
  nome: string
  periodo: number
  dificuldade: number | null
  informacao: string | null
  reqcreditos: number | null
  reqperiodo: number | null
  aprovado: boolean
  periodoplan: number | null
  requisitos: { id: number; nome: string }[]
  dependentes: { id: number; nome: string }[]
  correquisitos: { id: number; nome: string }[]
  credito: number
};

export type DisciplinaFormatoCriacao = {
  id?: number | null;
  nome: string;
  periodo: number;
  credito?: number | null;
  dificuldade?: number | null;
  informacao?: string | null;
  reqCreditos?: number | null;
  reqPeriodos?: number | null;
  preRequisitos?: string[]; // ["1-0"]
  coRequisitos?: string[];
};

export type PeriodoDTO = {
  numero: number;
  disciplinas: Array<DisciplinaFormatoCriacao>;
};
  