-- Evraklar tablosuna link desteği ekleme
-- ELT Arena - Link Support for Documents

-- 1. Source type enum'ı ekle
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source_type') THEN
        CREATE TYPE source_type AS ENUM ('file', 'link');
    END IF;
END $$;

-- 2. Documents tablosuna yeni kolonları ekle
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS source_type source_type DEFAULT 'file',
ADD COLUMN IF NOT EXISTS external_url VARCHAR(500);

-- 3. Mevcut kayıtları file olarak işaretle
UPDATE documents SET source_type = 'file' WHERE source_type IS NULL;

-- 4. Source type'ı not null yap
ALTER TABLE documents ALTER COLUMN source_type SET NOT NULL;

-- 5. İndeksler ekle
CREATE INDEX IF NOT EXISTS idx_documents_source_type ON documents(source_type);
CREATE INDEX IF NOT EXISTS idx_documents_external_url ON documents(external_url) WHERE external_url IS NOT NULL;

-- 6. Constraint'ler ekle
ALTER TABLE documents 
ADD CONSTRAINT chk_documents_source_consistency 
CHECK (
    (source_type = 'file' AND file_url IS NOT NULL) OR
    (source_type = 'link' AND external_url IS NOT NULL)
);

COMMENT ON COLUMN documents.source_type IS 'Evrakın kaynağı: file (yüklenmiş dosya) veya link (harici bağlantı)';
COMMENT ON COLUMN documents.external_url IS 'Harici link evrakları için orijinal URL';
