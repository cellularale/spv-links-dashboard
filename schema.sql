DROP TABLE IF EXISTS links;

CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT DEFAULT '',
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

-- Dati esempio (opzionali)
INSERT INTO links (title, category, url, sort_order, active) VALUES
('Sito principale', 'General', 'https://example.com', 1, 1),
('Documentazione', 'General', 'https://example.com/docs', 2, 1);
