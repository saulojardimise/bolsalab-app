// Termos de Uso e Política de Privacidade do BolsaLab.
// Ao mudar algo importante, aumente TERMOS_VERSAO: todo mundo vai precisar aceitar de novo.
export const TERMOS_VERSAO = 1;
export const TERMOS_DATA = '10 de novembro de 2026';
export const CONTATO = 'profsaulojardim@gmail.com';

export const TERMOS = [
  {
    titulo: '1. O que é o BolsaLab',
    texto: [
      'O BolsaLab é um simulador de investimentos com fins exclusivamente educacionais, criado e mantido pelo '
      + 'Prof. Dr. Saulo Jardim para apoiar disciplinas de Economia, Administração e Finanças. O uso é gratuito.',
      'O BolsaLab é um projeto independente do Prof. Saulo Jardim e não é oferecido por nenhuma instituição de ensino. '
      + 'O responsável pelo app e pelos seus dados é o próprio professor.',
      'Ao criar uma conta ou continuar usando o app, você declara que leu e concorda com estes termos.',
    ],
  },
  {
    titulo: '2. Dinheiro virtual, sem recomendação de investimento',
    itens: [
      'Todo o dinheiro no app é virtual. Nenhuma operação envolve dinheiro real, e os resultados não podem ser sacados, trocados ou transferidos.',
      'Os preços vêm de fontes públicas de dados da B3 (fechamento e cotações com atraso) e podem ter atrasos ou erros. '
      + 'Corretagem, aluguel, margem, horários e outras regras são simplificações da realidade.',
      'Nada no BolsaLab é recomendação de compra ou venda, consultoria ou oferta de investimento. Antes de investir dinheiro de verdade, '
      + 'estude e, se precisar, procure um profissional certificado.',
      'O desempenho no simulador não garante resultado no mercado real.',
    ],
  },
  {
    titulo: '3. Sua conta',
    itens: [
      'Use seu nome verdadeiro e um e-mail que seja seu. A conta é pessoal: não compartilhe a sua senha.',
      'Você é responsável pelo que for feito com a sua conta.',
      'Se você tem menos de 18 anos, use o app com o conhecimento do seu responsável.',
    ],
  },
  {
    titulo: '4. Regras de convivência',
    texto: ['Na comunidade, nos comentários e nas discussões:'],
    itens: [
      'Respeite colegas e professores. Não são permitidos ofensas, discriminação, assédio, conteúdo sexual ou violento, '
      + 'spam, propaganda nem a divulgação de dados pessoais de outras pessoas.',
      'Não tente burlar o simulador: explorar falhas, automatizar ordens ou usar mais de uma conta.',
      'O professor pode apagar publicações e comentários, tirar pessoas de grupos e excluir contas que descumprirem estas regras. '
      + 'Viu algo impróprio? Use o botão Denunciar.',
    ],
  },
  {
    titulo: '5. Uso nas aulas',
    itens: [
      'O professor pode usar seu desempenho, suas operações e sua participação no app em atividades e avaliações da disciplina, '
      + 'conforme combinado em sala.',
      'O professor pode criar grupos, publicar avisos, registrar eventos das empresas e ajustar regras do simulador '
      + '(como corretagem e horários), sempre com aviso no app.',
    ],
  },
  {
    titulo: '6. Quais dados coletamos',
    itens: [
      'No cadastro: nome, e-mail, senha (guardada de forma criptografada; ninguém consegue lê-la), escolaridade, '
      + 'situação do curso, curso e universidade.',
      'Se você quiser informar: foto de perfil e respostas do questionário de perfil de investidor.',
      'Do uso do app: ordens, carteira, patrimônio, grupos, publicações, reações, comentários e discussões, com as datas em que aconteceram.',
      'No seu aparelho: o app guarda a sessão de login e algumas preferências (como o tipo de gráfico) no armazenamento do navegador. '
      + 'Não usamos cookies de propaganda nem rastreadores de terceiros.',
    ],
  },
  {
    titulo: '7. Para que usamos os dados',
    itens: [
      'Fazer o simulador funcionar: executar ordens e calcular patrimônio, ranking e notificações.',
      'Fins pedagógicos: acompanhamento das turmas pelo professor e atividades de aula.',
      'Pesquisa e melhoria do ensino, sempre com estatísticas agregadas e sem identificar ninguém. '
      + 'Se algum estudo precisar de dados que identifiquem você, você será consultado antes.',
      'Enviar e-mails do próprio app, como redefinição de senha e confirmação de cadastro. Não enviamos propaganda.',
    ],
    texto2: ['Base legal (LGPD): o seu consentimento, ao aceitar estes termos, e o interesse legítimo educacional.'],
  },
  {
    titulo: '8. Quem vê o quê',
    itens: [
      'Os outros participantes veem: seu nome, sua foto, seu curso e sua universidade, seus grupos, há quanto tempo você está no app, seu desempenho em '
      + 'percentual, sua posição e seu patrimônio no ranking, seu ativo favorito, as operações que você faz (ativo, tipo, quantidade e preço) '
      + 'e o que você publica na comunidade.',
      'Só o professor vê: seu e-mail, sua escolaridade e a situação do curso, seu saldo em reais, seu perfil de investidor e os detalhes da sua carteira.',
      'Ninguém vê a sua senha.',
      'Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais.',
    ],
  },
  {
    titulo: '9. Onde os dados ficam',
    itens: [
      'Os dados ficam na Supabase (banco de dados e login). Os e-mails do app são enviados pela Resend e o app é hospedado no '
      + 'GitHub Pages. Esses serviços podem guardar dados em servidores fora do Brasil.',
      'As cotações vêm da brapi, que não recebe nenhum dado seu.',
      'Adotamos medidas de segurança razoáveis, mas nenhum sistema é totalmente seguro.',
    ],
  },
  {
    titulo: '10. Seus direitos',
    texto: [
      'Pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode: confirmar quais dados temos sobre você, pedir uma cópia, '
      + 'corrigir dados, pedir a exclusão da conta e dos dados e retirar o seu consentimento. Para isso, escreva para o contato no fim desta página.',
      'A foto e o perfil de investidor você mesmo altera em Meu perfil.',
      'Mantemos os dados enquanto a conta existir. Quando a conta é excluída, os dados são apagados; estatísticas já sem identificação podem ser mantidas.',
    ],
  },
  {
    titulo: '11. Disponibilidade',
    texto: [
      'O BolsaLab é um projeto educacional gratuito, oferecido como está. Ele pode ficar fora do ar, ter erros, mudar regras ou ser encerrado. '
      + 'Carteiras, rankings e dados podem ser reiniciados entre semestres, com aviso prévio no app.',
    ],
  },
  {
    titulo: '12. Mudanças nestes termos',
    texto: ['Se estes termos mudarem de forma importante, avisaremos no app e pediremos um novo aceite.'],
  },
  {
    titulo: '13. Contato',
    texto: [`Prof. Dr. Saulo Jardim · ${CONTATO}`],
  },
];

export const ESCOLARIDADES = [
  ['medio', 'Ensino médio'],
  ['graduacao', 'Graduação'],
  ['especializacao', 'Especialização ou MBA'],
  ['mestrado', 'Mestrado'],
  ['doutorado', 'Doutorado'],
];
export const SITUACOES = [['em_andamento', 'Em andamento'], ['concluido', 'Concluído'], ['trancado', 'Trancado']];
export const pedeSituacao = (e) => ['graduacao', 'mestrado', 'doutorado'].includes(e);
export const pedeUniversidade = (e) => Boolean(e) && e !== 'medio';
export const CURSOS_SUGERIDOS = ['Administração', 'Ciências Contábeis', 'Direito', 'Economia', 'Engenharia Civil', 'Engenharia de Produção', 'Finanças', 'Gestão Financeira'];
export const UNIVERSIDADES_SUGERIDAS = ['ISECENSA', 'UFF', 'UENF', 'IFF', 'UCAM', 'UNIFLU', 'Estácio', 'UFRJ', 'UERJ', 'UNIRIO'];

// o que os colegas veem no perfil: "Administração · ISECENSA"
export const cursoEUniversidade = (p) => [p?.curso, p?.universidade].filter(Boolean).join(' · ');

// texto curto para o professor: "Graduação em andamento · ISECENSA"
export function descreverEscolaridade({ escolaridade, escolaridade_situacao: sit, curso, universidade } = {}) {
  if (!escolaridade) return '';
  const nivel = ESCOLARIDADES.find(([id]) => id === escolaridade)?.[1] ?? escolaridade;
  const s = SITUACOES.find(([id]) => id === sit)?.[1]?.toLowerCase();
  return [s ? `${nivel} ${s}` : nivel, curso, universidade].filter(Boolean).join(' · ');
}

// precisa (re)aceitar os termos ou completar a escolaridade?
export const precisaCompletarCadastro = (perfil) =>
  Boolean(perfil) && (!perfil.termos_aceitos_em || (perfil.termos_versao ?? 0) < TERMOS_VERSAO || !perfil.escolaridade
    || (pedeUniversidade(perfil.escolaridade) && !perfil.curso));

// mensagem de erro, ou '' se está tudo respondido
export function conferirEscolaridade({ escolaridade, situacao, curso = '', universidade }) {
  if (!escolaridade) return 'Escolha sua escolaridade.';
  if (pedeSituacao(escolaridade) && !situacao) return 'Diga se o curso está em andamento, concluído ou trancado.';
  if (pedeUniversidade(escolaridade) && !curso.trim()) return 'Digite o nome do seu curso.';
  if (pedeUniversidade(escolaridade) && !universidade.trim()) return 'Digite o nome da sua universidade ou faculdade.';
  return '';
}
