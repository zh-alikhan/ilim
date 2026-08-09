import { Fragment, type ReactNode } from 'react';

/**
 * Renders the preserved knowledge-base strings, which may contain
 * **bold** and *italic* markdown emphasis, as safe React nodes.
 *
 * We deliberately avoid dangerouslySetInnerHTML: the KB content is
 * trusted, but parsing to React elements keeps it XSS-safe and lets us
 * style emphasis consistently via the .kb-rich class.
 *
 * Supported tokens: **bold**, *italic*. Everything else is literal text.
 */
export function RichText({
  text,
  className,
}: {
  text: string;
  className?: string;
}): ReactNode {
  return <span className={className}>{parse(text)}</span>;
}

function parse(input: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Match **bold** or *italic* (bold checked first via alternation length)
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={key++}>{input.slice(lastIndex, match.index)}</Fragment>,
      );
    }
    if (match[2] !== undefined) {
      nodes.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      nodes.push(<em key={key++}>{match[3]}</em>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    nodes.push(<Fragment key={key++}>{input.slice(lastIndex)}</Fragment>);
  }

  return nodes;
}
