export type DisciplinaComDeps = {
    id: number
    nome: string
    periodo: number
    dificuldade: number | null
    informacao: string | null
    reqcreditos: number | null
    aprovado: boolean
    periodoplan: number | null
    requisitos: { id: number; nome: string }[]
    dependentes: { id: number; nome: string }[]
    credito: number
  }
  