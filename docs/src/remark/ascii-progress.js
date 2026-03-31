/**
 * Remark plugin — ASCII Progress Bars
 *
 * Converte blocos de código com linguagem "progress" em barras de progresso ASCII.
 *
 * Sintaxe nos arquivos .md:
 *
 * ```progress
 * Clique > Cadastro: 15
 * Cadastro > Trial: 60
 * Trial > Assinado: 11
 * ```
 *
 * Resultado renderizado:
 *
 * Clique > Cadastro  ███░░░░░░░░░░░░░░░░░░░  15%
 * Cadastro > Trial   ████████████░░░░░░░░░░  60%
 * Trial > Assinado   ██░░░░░░░░░░░░░░░░░░░░  11%
 *
 * Opções (via meta do bloco, ex: ```progress title="Funil" max=200):
 *   title  — título exibido acima do gráfico
 *   max    — valor máximo da escala (padrão: 100)
 */

const BAR_WIDTH = 22;

function renderBar(value, max) {
  const ratio = Math.min(value / max, 1);
  const filled = Math.round(ratio * BAR_WIDTH);
  const half = ratio * BAR_WIDTH - Math.floor(ratio * BAR_WIDTH) >= 0.5;
  const fullBlocks = Math.min(filled, BAR_WIDTH);
  const halfBlock = half && fullBlocks < BAR_WIDTH ? '▌' : '';
  const empty = BAR_WIDTH - fullBlocks - (halfBlock ? 1 : 0);
  return '█'.repeat(fullBlocks) + halfBlock + '░'.repeat(empty);
}

function parseMetaOptions(meta) {
  const opts = { title: null, max: 100 };
  if (!meta) return opts;
  const titleMatch = meta.match(/title="([^"]+)"/);
  if (titleMatch) opts.title = titleMatch[1];
  const maxMatch = meta.match(/max=(\d+)/);
  if (maxMatch) opts.max = parseInt(maxMatch[1], 10);
  return opts;
}

function walkTree(node, type, visitor) {
  if (node.type === type) visitor(node);
  if (node.children) {
    node.children.forEach((child) => walkTree(child, type, visitor));
  }
}

export default function remarkAsciiProgress() {
  return (tree) => {
    walkTree(tree, 'code', (node) => {
      if (node.lang !== 'progress') return;

      const { title, max } = parseMetaOptions(node.meta);
      const lines = node.value.trim().split('\n');

      const items = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        // aceita "Label: 85" ou "Label: 85%" ou "Label: 85.5"
        const match = trimmed.match(/^(.+?):\s*(\d+(?:[.,]\d+)?)\s*%?$/);
        if (match) {
          const value = parseFloat(match[2].replace(',', '.'));
          items.push({ label: match[1].trim(), value });
        }
      }

      if (items.length === 0) return;

      const maxLabel = Math.max(...items.map((i) => i.label.length));
      const rows = items.map(({ label, value }) => {
        const padded = label.padEnd(maxLabel);
        const bar = renderBar(value, max);
        const pct = max === 100 ? `${value}%` : `${value} / ${max}`;
        return `${padded}  ${bar}  ${pct}`;
      });

      const header = title
        ? [`── ${title} ${'─'.repeat(Math.max(0, BAR_WIDTH + maxLabel + 8 - title.length - 4))}`, '']
        : [];

      node.lang = 'text';
      node.meta = null;
      node.value = [...header, ...rows].join('\n');
    });
  };
}
