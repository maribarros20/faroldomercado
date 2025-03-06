
-- Adicionar o campo source_url à tabela market_news
ALTER TABLE IF EXISTS public.market_news
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Criar índice para pesquisas mais rápidas
CREATE INDEX IF NOT EXISTS market_news_category_idx 
ON public.market_news (category);

CREATE INDEX IF NOT EXISTS market_news_publication_date_idx 
ON public.market_news (publication_date);
