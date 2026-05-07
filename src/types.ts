export interface AtaHistory {
  timestamp: number;
  blocos: any;
  varsReuniao: any;
}

export interface AtaDocument {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  status: 'Rascunho' | 'Exportada';
  blocos: any;
  varsReuniao: any;
  history: AtaHistory[];
  rawContent?: string;
  tipoReuniao?: 'deliberativa' | 'audiencia';
}
