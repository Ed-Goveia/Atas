/**
 * ============================================================
 *  CONFIGURAÇÕES DE BRANDING — Revisor de Atas
 * ============================================================
 *  Altere aqui o nome, subtítulo, favicon e cores da aplicação.
 *  Este arquivo é importado em App.tsx e index.html.
 * ============================================================
 */

export const BRANDING = {
  /** Nome exibido no header e na aba do navegador */
  appName: 'Revisor de Atas',

  /** Sigla/badge exibida ao lado do nome (ex: PRO, CASP, BETA) */
  badge: 'CASP',

  /** Subtítulo exibido abaixo do nome no header */
  tagline: 'Auto-Save, Time Machine e Edição Seletiva.',

  /** Título completo da aba do navegador — edite também o index.html */
  pageTitle: 'Revisor de Atas | CASP',

  /**
   * Ícone do header.
   * Pode ser uma string de emoji simples, ou você pode trocar
   * o componente <Wand2> em App.tsx por uma <img src="..."> aqui.
   * Exemplos: '📋', '⚖️', '🏛️'
   */
  icon: '📋',

  /** Cor primária da interface (usada no botão do logo e badges) */
  primaryColor: '#1d4ed8', // blue-700

  /**
   * Informações do rodapé / créditos (não visível atualmente,
   * mas disponível para uso futuro)
   */
  organization: 'Comissão de Administração e Serviço Público',
  shortOrg: 'CASP',
};
