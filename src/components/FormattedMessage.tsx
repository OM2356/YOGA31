import React from 'react';

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-[#18221D] dark:text-[#EEF2EE]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export const FormattedMessage: React.FC<{ text: string; isUser?: boolean }> = ({
  text,
  isUser = false,
}) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap leading-relaxed">{text}</div>;
  }

  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((raw, idx) => {
        const line = raw.trim();
        if (!line) {
          return <div key={idx} className="h-1" aria-hidden="true" />;
        }

        if (line.startsWith('### ') || line.startsWith('## ')) {
          const clean = line.replace(/^#{2,3}\s+/, '');
          return (
            <p
              key={idx}
              className="pt-1 text-sm font-semibold text-[#18221D] dark:text-[#EEF2EE]"
            >
              {renderInlineFormatting(clean)}
            </p>
          );
        }

        const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2F5D46] dark:bg-[#84B89B]" />
              <span>{renderInlineFormatting(bulletMatch[1])}</span>
            </div>
          );
        }

        const numberedMatch = line.match(/^(\d+\.)\s+(.+)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="font-mono text-xs font-semibold tabular-nums text-[#2F5D46] dark:text-[#84B89B] pt-0.5">
                {numberedMatch[1]}
              </span>
              <span>{renderInlineFormatting(numberedMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
};
