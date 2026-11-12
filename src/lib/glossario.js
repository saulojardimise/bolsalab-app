// Glossário: o que aparece ao tocar no "?" ao lado de um termo.
// Linguagem simples; quando ajuda, um exemplo com números redondos.

export const GLOSSARIO = {
  bdr: {
    titulo: 'BDR',
    texto: 'Brazilian Depositary Receipt: um recibo, negociado na B3 em reais, que representa ações de uma empresa listada em outra bolsa, '
      + 'como Apple ou Nvidia. Cada BDR equivale a uma fração da ação lá fora, por isso o preço não é igual ao da ação convertido em reais. '
      + 'Ele sobe e desce com a empresa e também com o dólar.',
    exemplo: 'Se a ação da Apple fica igual em Nova York e o dólar sobe 5%, o AAPL34 sobe cerca de 5%.',
  },
  selic: {
    titulo: 'Selic',
    texto: 'A taxa básica de juros da economia, definida pelo Copom a cada 45 dias. Ela serve de piso para os juros do país: '
      + 'empréstimos, financiamentos e o rendimento da renda fixa. O Banco Central sobe a Selic para frear a inflação e corta para estimular a economia.',
  },
  copom: {
    titulo: 'Copom',
    texto: 'O Comitê de Política Monetária do Banco Central. Reúne-se oito vezes por ano e decide se a Selic sobe, cai ou fica igual, '
      + 'olhando principalmente para a inflação.',
  },
  ipca: {
    titulo: 'IPCA',
    texto: 'O índice oficial de inflação do Brasil, medido pelo IBGE todo mês. Mostra quanto subiram os preços de uma cesta de produtos '
      + 'e serviços que as famílias consomem.',
    exemplo: 'IPCA de 4,5% em 12 meses: o que custava R$ 100 há um ano custa, em média, R$ 104,50 hoje.',
  },
  meta_inflacao: {
    titulo: 'Meta de inflação',
    texto: 'O objetivo de inflação definido pelo Conselho Monetário Nacional: 3% ao ano, com tolerância de 1,5 ponto para cima ou para baixo. '
      + 'Quando a inflação foge do intervalo, o Banco Central precisa explicar por quê e como vai trazê-la de volta.',
  },
  juro_real: {
    titulo: 'Juro real',
    texto: 'Quanto os juros rendem acima da inflação, ou seja, o ganho de poder de compra. Aqui é calculado com a Selic de hoje e o IPCA dos '
      + 'últimos 12 meses. Juro real alto atrai investidores para a renda fixa.',
    exemplo: 'Selic de 14% e inflação de 4,5%: juro real de cerca de 9% ao ano.',
  },
  pib: {
    titulo: 'PIB',
    texto: 'O Produto Interno Bruto: tudo o que o país produz de bens e serviços. A variação do PIB mostra se a economia está crescendo ou encolhendo. '
      + 'O IBGE divulga o PIB de cada trimestre cerca de dois meses depois.',
  },
  focus: {
    titulo: 'Boletim Focus',
    texto: 'Pesquisa do Banco Central com mais de cem bancos e consultorias sobre o que eles esperam para a inflação, a Selic, o PIB e o dólar. '
      + 'Sai toda segunda-feira e mostra a mediana das projeções: o "palpite do mercado".',
  },
  tesouro_direto: {
    titulo: 'Tesouro Direto',
    texto: 'Programa do governo federal para vender títulos públicos a pessoas físicas. Ao comprar um título, você empresta dinheiro '
      + 'ao governo e recebe de volta com juros. É considerado o investimento mais seguro do país. Dá para comprar a partir de 0,01 título.',
  },
  tesouro_selic: {
    titulo: 'Tesouro Selic',
    texto: 'Título que rende a taxa Selic, os juros básicos da economia. O preço sobe um pouquinho todo dia e quase nunca cai, '
      + 'por isso é usado como reserva de emergência.',
    exemplo: 'Com a Selic a 15% ao ano, R$ 1.000 viram cerca de R$ 1.150 em um ano.',
  },
  tesouro_prefixado: {
    titulo: 'Tesouro Prefixado',
    texto: 'Título com taxa fixa, combinada na compra. No vencimento, paga R$ 1.000 por título. Antes disso, o preço muda com os juros: '
      + 'se os juros do mercado sobem, o título cai; se caem, ele sobe.',
    exemplo: 'Comprou a 14% ao ano e levou até o vencimento: recebe exatamente os 14% ao ano, aconteça o que acontecer com os juros.',
  },
  tesouro_ipca: {
    titulo: 'Tesouro IPCA+',
    texto: 'Título que paga a inflação (IPCA) mais uma taxa fixa. Protege o poder de compra: o dinheiro cresce acima da inflação '
      + 'se for levado até o vencimento. Os prazos são longos e o preço oscila com os juros.',
    exemplo: 'IPCA + 7% com inflação de 4% no ano: rende cerca de 11,3% naquele ano.',
  },
  taxa_tesouro: {
    titulo: 'Rentabilidade do título',
    texto: 'Quanto o título rende por ano se você comprar hoje e ficar com ele até o vencimento. No Selic, é a Selic mais um pouco; '
      + 'no Prefixado, uma taxa fixa; no IPCA+, a inflação mais uma taxa.',
  },
  spread_tesouro: {
    titulo: 'Preço de compra e de venda',
    texto: 'O Tesouro vende o título um pouco mais caro do que paga para recomprá-lo. Por isso, logo depois de comprar, o título vale '
      + 'um pouco menos do que você pagou. Essa diferença (o spread) é pequena no Selic e maior nos títulos longos.',
  },
  marcacao_mercado: {
    titulo: 'Marcação a mercado',
    texto: 'O preço dos títulos muda todo dia conforme os juros do mercado. Quando os juros sobem, títulos com taxa fixa (Prefixado e IPCA+) '
      + 'perdem valor; quando caem, ganham. Quem leva até o vencimento recebe a taxa combinada; quem vende antes pode ganhar ou perder.',
    exemplo: 'Você comprou um Prefixado a 13%. Os juros sobem para 15%: novos títulos pagam mais, então o seu vale menos se vendido hoje.',
  },
  patrimonio: {
    titulo: 'Patrimônio virtual',
    texto: 'Tudo o que a sua conta vale hoje: o saldo em dinheiro, mais as ações compradas pelo preço de fechamento, '
      + 'mais o resultado das vendas a descoberto. É ele que decide a sua posição no ranking. Durante o pregão, o valor '
      + 'na tela é uma estimativa com a cotação do dia; o ranking usa sempre o fechamento.',
    exemplo: 'Saldo de R$ 4.000 + ações que valem R$ 6.200 = patrimônio de R$ 10.200.',
  },
  saldo: {
    titulo: 'Saldo disponível',
    texto: 'O dinheiro livre na conta, que você pode usar para comprar ações. Compras e corretagens tiram dele; '
      + 'vendas devolvem. O valor bloqueado como garantia não entra no saldo.',
  },
  rentabilidade: {
    titulo: 'Rentabilidade',
    texto: 'Quanto o seu patrimônio cresceu (ou caiu) em relação ao que você tinha no começo, em porcentagem.',
    exemplo: 'Começou com R$ 10.000 e hoje tem R$ 10.500: rentabilidade de +5%.',
  },
  preco_medio: {
    titulo: 'Preço médio',
    texto: 'Quanto você pagou, em média, por cada ação de uma empresa, somando todas as compras. '
      + 'Aqui ele não inclui a corretagem, como no home broker. Vender não muda o preço médio.',
    exemplo: 'Comprou 100 a R$ 10 e depois 100 a R$ 12: preço médio de R$ 11.',
  },
  corretagem: {
    titulo: 'Corretagem',
    texto: 'Taxa que a corretora cobra por cada ordem executada, de compra ou de venda. No simulador é R$ 7,90 por ordem de ações e ETFs e R$ 10 por ordem de minicontratos, '
      + 'qualquer que seja a quantidade. Por isso, muitas ordens pequenas saem caro.',
  },
  venda_descoberto: {
    titulo: 'Venda a descoberto',
    texto: 'Vender ações que você não tem. Você "aluga" as ações de outro investidor, vende pelo preço de hoje '
      + 'e depois precisa comprá-las de volta (recompra) para devolver. Ganha se o preço cair; perde se subir.',
    exemplo: 'Vende 100 a R$ 20 (R$ 2.000) e recompra a R$ 17 (R$ 1.700): lucro de R$ 300, menos aluguel e corretagem.',
  },
  recompra: {
    titulo: 'Recompra',
    texto: 'Comprar de volta as ações vendidas a descoberto, para devolvê-las a quem as emprestou. '
      + 'É o que encerra a operação e define o lucro ou o prejuízo.',
  },
  garantia: {
    titulo: 'Garantia',
    texto: 'O dinheiro da venda a descoberto fica bloqueado: não entra no saldo e não pode ser usado em outras compras. '
      + 'Ele é liberado na recompra, e é dele que sai o pagamento das ações compradas de volta.',
  },
  aluguel: {
    titulo: 'Aluguel de ações',
    texto: 'Quem vende a descoberto paga uma taxa a quem emprestou as ações, enquanto a posição estiver aberta. '
      + 'Como na B3, a taxa é anual e cobrada só em dias úteis (base de 252 dias úteis por ano). No simulador é 5% ao ano, '
      + 'para ações e ETFs, sobre o valor atual das ações vendidas: cerca de R$ 1,94 por dia útil a cada R$ 10.000.',
  },
  limite_descoberto: {
    titulo: 'Limite da venda a descoberto',
    texto: 'Você pode vender a descoberto até 40% do seu saldo disponível, somando todas as posições vendidas. '
      + 'O limite existe porque o prejuízo de uma venda a descoberto não tem teto: o preço pode subir sem parar.',
  },
  resultado_acumulado: {
    titulo: 'Prejuízo com custos',
    texto: 'Na venda a descoberto, o resultado mostrado é só o efeito do preço: valor da venda menos o custo para recomprar hoje. '
      + 'Para o encerramento automático, o simulador soma também o aluguel e a corretagem já pagos, '
      + 'porque eles também saíram do seu saldo.',
    exemplo: 'Vendeu por R$ 2.000, recomprar hoje custa R$ 2.100 (−R$ 100) e já pagou R$ 7,90 de corretagem e R$ 6 de aluguel: '
      + 'prejuízo com custos de R$ 113,90.',
  },
  encerramento: {
    titulo: 'Encerramento automático',
    texto: 'Uma proteção (parecida com um "stop loss"): se o prejuízo acumulado de uma venda a descoberto chegar a 80% '
      + 'do seu saldo disponível, o simulador faz a recompra sozinho, para o prejuízo não crescer mais.',
  },
  candlestick: {
    titulo: 'Candlestick (candle)',
    texto: 'Gráfico em que cada dia vira uma "vela". O corpo vai do preço de abertura ao de fechamento: verde se a ação '
      + 'fechou acima de onde abriu, vermelho se fechou abaixo. Os traços finos (pavios) mostram a máxima e a mínima do dia. '
      + 'Num olhar, dá para ver se o dia foi de alta ou de queda e o quanto o preço oscilou.',
    exemplo: 'Abriu a R$ 30, foi até R$ 31,50, caiu até R$ 29,80 e fechou a R$ 31: vela verde de 30 a 31, pavio de 29,80 a 31,50.',
  },
  cotacao_do_dia: {
    titulo: 'Cotação do dia',
    texto: 'Durante o pregão, o simulador atualiza três vezes (11h, 14h e 17h), com cerca de 30 minutos de atraso, os preços '
      + 'dos ativos que estão na carteira de alguém, além do Ibovespa e do dólar. Os outros ficam com o preço de fechamento. Com eles, o app estima o seu patrimônio e a sua carteira ao longo do dia. As ordens continuam '
      + 'sendo feitas à noite e no fim de semana, pelo preço de fechamento, e o ranking só muda com o fechamento.',
  },
  fechamento: {
    titulo: 'Preço de fechamento',
    texto: 'O preço do último negócio do dia na bolsa. O simulador usa o fechamento de cada pregão: '
      + 'as ordens feitas à noite e no fim de semana usam o fechamento mais recente.',
  },
  abertura: {
    titulo: 'Abertura',
    texto: 'O preço do primeiro negócio do dia na bolsa, quando o pregão começa.',
  },
  maxima: {
    titulo: 'Máxima',
    texto: 'O maior preço pelo qual a ação foi negociada durante o dia.',
  },
  minima: {
    titulo: 'Mínima',
    texto: 'O menor preço pelo qual a ação foi negociada durante o dia.',
  },
  variacao: {
    titulo: 'Variação',
    texto: 'Quanto o preço de fechamento subiu ou caiu em relação ao fechamento do pregão anterior, em porcentagem.',
  },
  volume: {
    titulo: 'Volume',
    texto: 'Quantas ações foram negociadas no dia. Volume alto mostra muito interesse dos investidores e facilita '
      + 'comprar ou vender sem mexer muito no preço (liquidez).',
  },
  setor: {
    titulo: 'Setor e diversificação',
    texto: 'Setor é a área de atuação da empresa (bancos, energia, varejo...). Diversificar é espalhar o dinheiro '
      + 'entre setores diferentes: se um vai mal, os outros podem compensar.',
  },
  fluxo_caixa: {
    titulo: 'Fluxo de caixa',
    texto: 'O registro de todo dinheiro que entrou e saiu do seu saldo: compras, vendas, corretagens, aluguel e ajustes. '
      + 'Somando tudo a partir do saldo inicial, você chega ao saldo disponível de hoje.',
  },
  ibovespa: {
    titulo: 'Ibovespa',
    texto: 'O principal índice da bolsa brasileira: uma carteira teórica com as ações mais negociadas da B3 (as mesmas '
      + '76 do simulador). Se a sua carteira rendeu menos que o Ibovespa, teria sido melhor comprar "o mercado inteiro".',
  },
  cdi: {
    titulo: 'CDI',
    texto: 'A taxa dos empréstimos de um dia entre bancos, quase igual à Selic. É a referência da renda fixa: um CDB que '
      + 'rende "100% do CDI" acompanha essa taxa sem o sobe e desce das ações. Render menos que o CDI significa que '
      + 'o risco da bolsa não compensou no período.',
  },
  etf: {
    titulo: 'ETF (fundo de índice)',
    texto: 'Um fundo que copia um índice ou um ativo e é negociado na bolsa como uma ação. Comprando uma cota, você '
      + 'leva de uma vez todos os ativos do índice: por exemplo, as ações do Ibovespa, as 500 maiores empresas dos EUA, '
      + 'o ouro ou títulos do Tesouro. É um jeito simples de diversificar.',
    exemplo: 'Com uma cota de BOVA11 você tem um pedacinho de todas as ações do Ibovespa. Se o Ibovespa sobe 2%, '
      + 'o BOVA11 sobe perto de 2% (um pouco menos, por causa da taxa do fundo).',
  },
  minicontrato: {
    titulo: 'Minicontrato futuro',
    texto: 'Um acordo de comprar ou vender um ativo numa data futura, por um preço combinado hoje. Você não paga o valor '
      + 'inteiro: deposita só uma margem de garantia, e o ganho ou a perda entra no saldo todo dia (ajuste diário). '
      + 'Por isso o minicontrato é alavancado: com pouco dinheiro, você fica exposto a um valor bem maior.',
    exemplo: 'Um mini índice com o Ibovespa em 166.000 pontos vale R$ 33.200, mas exige só R$ 900 de margem. '
      + 'Se o Ibovespa subir 1%, você ganha R$ 332, mais de um terço da margem. Se cair 1%, perde o mesmo.',
  },
  mini_indice: {
    titulo: 'Mini índice (WIN)',
    texto: 'Contrato futuro sobre o Ibovespa. Cada ponto vale R$ 0,20 por contrato, e o preço anda de 5 em 5 pontos. '
      + 'Comprado, você ganha se o Ibovespa subir; vendido, ganha se cair. Vence nos meses pares.',
  },
  mini_dolar: {
    titulo: 'Mini dólar (WDO)',
    texto: 'Contrato futuro de US$ 10.000, cotado em reais por mil dólares (5.500 pontos = R$ 5,50 por dólar). '
      + 'Cada ponto vale R$ 10 por contrato e o preço anda de 0,5 em 0,5 ponto. Usado para se proteger da alta do dólar '
      + 'ou para apostar nela. Vence todo mês.',
  },
  ptax: {
    titulo: 'PTAX',
    texto: 'A taxa oficial do dólar, calculada pelo Banco Central todo dia útil a partir das negociações do mercado de câmbio. '
      + 'É ela que liquida os contratos futuros de dólar no vencimento.',
  },
  valor_ponto: {
    titulo: 'Valor do ponto',
    texto: 'Quanto você ganha ou perde, por contrato, a cada ponto que o preço anda. No mini índice é R$ 0,20; '
      + 'no mini dólar, R$ 10,00.',
    exemplo: 'Comprado em 3 mini índices, o Ibovespa sobe 500 pontos: 500 × R$ 0,20 × 3 = R$ 300 de ganho.',
  },
  tick: {
    titulo: 'Variação mínima (tick)',
    texto: 'O menor passo que o preço pode dar. No mini índice o preço anda de 5 em 5 pontos (R$ 1,00 por contrato); '
      + 'no mini dólar, de 0,5 em 0,5 ponto (R$ 5,00 por contrato).',
  },
  margem_garantia: {
    titulo: 'Margem de garantia',
    texto: 'Dinheiro que sai do saldo e fica depositado enquanto a posição está aberta, para garantir que você consiga '
      + 'pagar as perdas. Continua sendo seu: volta ao saldo quando você zera a posição. No simulador é R$ 900 por contrato '
      + 'no mini índice e R$ 1.500 por contrato no mini dólar.',
  },
  ajuste_diario: {
    titulo: 'Ajuste diário',
    texto: 'No mercado futuro, o ganho ou a perda não espera você vender: todo dia, depois do fechamento, a diferença entre '
      + 'o preço de hoje e o de ontem entra ou sai do seu saldo. É assim que a B3 evita que as perdas se acumulem.',
    exemplo: 'Vendido em 1 mini dólar, o preço vai de 5.400 para 5.450 pontos: −50 × R$ 10 = −R$ 500 no saldo.',
  },
  chamada_margem: {
    titulo: 'Chamada de margem',
    texto: 'Quando as perdas consomem o seu dinheiro, a corretora pede mais garantia. Se você não deposita, ela zera a '
      + 'posição. No simulador: se o saldo ficar negativo depois do ajuste diário, os seus minicontratos são zerados e '
      + 'a margem cobre o que faltar.',
  },
  vencimento_futuro: {
    titulo: 'Vencimento e rolagem',
    texto: 'Todo contrato futuro tem data para acabar. O código mostra qual é: WIN + letra do mês + ano (WINZ26 = dezembro '
      + 'de 2026). No último dia de negociação a posição é liquidada pelo preço do dia e a margem volta ao saldo. Quem quer '
      + 'continuar abre o contrato seguinte: isso se chama rolagem.',
    exemplo: 'Letras: F jan, G fev, H mar, J abr, K mai, M jun, N jul, Q ago, U set, V out, X nov, Z dez.',
  },
  fato_relevante: {
    titulo: 'Fato relevante',
    texto: 'Comunicado oficial que a empresa é obrigada a divulgar, ao mesmo tempo para todos os investidores, sempre que '
      + 'acontece algo que pode mexer no preço das ações: resultados, fusões, aquisições, dividendos, mudança de comando. '
      + 'É publicado na CVM e é a fonte mais confiável, antes de qualquer jornal.',
  },
  suitability: {
    titulo: 'Suitability',
    texto: 'Em português, "adequação". É a obrigação das corretoras de conhecer o perfil do cliente (objetivos, prazo, '
      + 'tolerância a perdas e experiência) antes de recomendar investimentos. Quem regula é a CVM.',
  },
  perfil_investidor: {
    titulo: 'Perfil de investidor',
    texto: 'Conservador prioriza a segurança; moderado aceita algum risco por um ganho maior; arrojado tolera quedas '
      + 'fortes buscando ganhos maiores no longo prazo. O perfil é declarado no questionário.',
  },
};

// Rótulos da boleta (lib/regras.js) que têm explicação
export const TERMO_DO_ROTULO = {
  Corretagem: 'corretagem',
  'Corretagem (sai do saldo)': 'corretagem',
  'Aluguel estimado por dia útil': 'aluguel',
  'Limite livre para vender a descoberto': 'limite_descoberto',
  'Fica bloqueado como garantia': 'garantia',
  'Garantia liberada': 'garantia',
  'Custo da recompra': 'recompra',
};
