
import React from "react";

export const formatMarkdownContent = (content: string): JSX.Element[] => {
  const lines = content.split('\n');
  
  const formattedContent: JSX.Element[] = [];
  
  lines.forEach((line, i) => {
    const processLinks = (text: string) => {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = linkRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        
        parts.push(
          <a 
            key={`link-${i}-${match.index}`}
            href={match[2]} 
            className="text-blue-500 hover:underline"
          >
            {match[1]}
          </a>
        );
        
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }
      
      return parts.length > 1 ? <>{parts}</> : text;
    };
    
    if (line.startsWith('# ')) {
      formattedContent.push(
        <h1 key={i} className="text-2xl font-bold mt-6 mb-4">{processLinks(line.substring(2))}</h1>
      );
    } else if (line.startsWith('## ')) {
      formattedContent.push(
        <h2 key={i} className="text-xl font-bold mt-5 mb-3">{processLinks(line.substring(3))}</h2>
      );
    } else if (line.startsWith('### ')) {
      formattedContent.push(
        <h3 key={i} className="text-lg font-bold mt-4 mb-2">{processLinks(line.substring(4))}</h3>
      );
    } else if (line.startsWith('- ')) {
      formattedContent.push(
        <li key={i} className="ml-6 mb-2">{processLinks(line.substring(2))}</li>
      );
    } else if (line.trim()) {
      formattedContent.push(
        <p key={i} className="mb-4">{processLinks(line)}</p>
      );
    } else {
      formattedContent.push(<br key={i} />);
    }
  });
  
  return formattedContent;
};
