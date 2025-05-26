DROP TABLE IF EXISTS subscriptors_newsletters;
DROP TABLE IF EXISTS subscriptors_empreses;
DROP TABLE IF EXISTS subscriptors_persones;
DROP TABLE IF EXISTS subscriptors;
DROP TABLE IF EXISTS newsletters;
DROP TABLE IF EXISTS persones_coopera;
DROP TABLE IF EXISTS empreses_coopera;
DROP TABLE IF EXISTS persones_activitats;
DROP TABLE IF EXISTS empreses_activitats;
DROP TABLE IF EXISTS transaccions;
DROP TABLE IF EXISTS productes_materials;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS productes;
DROP TABLE IF EXISTS persones;
DROP TABLE IF EXISTS ubicacions;
DROP TABLE IF EXISTS empreses;
DROP TABLE IF EXISTS activitats;
DROP TABLE IF EXISTS coopera;

CREATE TABLE empreses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    telefon TEXT,
    email TEXT,
    web TEXT,
    data_alta TEXT,
    segueix_instagram TEXT,
    segueix_linkedin TEXT,
    tipus TEXT,
    rol TEXT
);

CREATE TABLE ubicacions (
    empresa_id INT,
    adreça TEXT,
    municipi TEXT,
    codi_postal TEXT,
    poligon TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empreses(id)
);

CREATE TABLE persones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT ,
    cognoms TEXT,
    telefon TEXT,
    email TEXT,
    carrec TEXT,
    segueix_instagram TEXT,
    segueix_linkedin TEXT,
    empresa_id INT,
    FOREIGN KEY (empresa_id) REFERENCES empreses(id)
);

CREATE TABLE activitats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    descripcio TEXT,
    data_inici TEXT,
    data_fi TEXT,
    tipus TEXT
);

CREATE TABLE empreses_activitats (
    empresa_id INT,
    activitat_id INTEGER,
    FOREIGN KEY (empresa_id) REFERENCES empreses(id),
    FOREIGN KEY (activitat_id) REFERENCES activitats(id)
);

CREATE TABLE persones_activitats (
    persona_id INTEGER,
    activitat_id INTEGER,
    FOREIGN KEY (persona_id) REFERENCES persones(id),
    FOREIGN KEY (activitat_id) REFERENCES activitats(id)
);

CREATE TABLE productes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT ,
    estat TEXT,
    descripcio TEXT,
    data_publicacio TEXT,
    tipus TEXT,
    empresa_id INT,
    FOREIGN KEY (empresa_id) REFERENCES empreses(id)
);

CREATE TABLE transaccions (
    producte_id INT,
    empresa_receptora INT,
    data_lliurament TEXT,
    estat_transaccio TEXT,
    observacions TEXT,
    quantitat INT,
    impacte_CO2 TEXT,
    impacte_economic TEXT,
    estat_aprofitament TEXT,
    publicat_GRID TEXT,
    espai_GRID TEXT,
    GRIDees TEXT,
    FOREIGN KEY (producte_id) REFERENCES productes(id),
    FOREIGN KEY (empresa_receptora) REFERENCES empreses(id)
);

CREATE TABLE materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT
);

CREATE TABLE productes_materials (
    producte_id INT,
    material_id INT,
    FOREIGN KEY (producte_id) REFERENCES productes(id),
    FOREIGN KEY (material_id) REFERENCES materials(id)
);


CREATE TABLE newsletters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    data_publicacio TEXT,
    descripcio TEXT
);

CREATE TABLE subscriptors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    data_alta TEXT,
    es_representant TEXT,
    inscrit_newsletter TEXT
);

CREATE TABLE subscriptors_persones (
    persona_id INTEGER,
    subscriptor_id INTEGER,
    FOREIGN KEY (persona_id) REFERENCES persones(id),
    FOREIGN KEY (subscriptor_id) REFERENCES subscriptors(id)
);

CREATE TABLE subscriptors_empreses (
    empresa_id INTEGER,
    subscriptor_id INTEGER,
    FOREIGN KEY (empresa_id) REFERENCES empreses(id),
    FOREIGN KEY (subscriptor_id) REFERENCES subscriptors(id)
);

CREATE TABLE subscriptors_newsletters (
    newsletter_id INTEGER,
    subscriptor_id INTEGER,
    FOREIGN KEY (newsletter_id) REFERENCES newsletters(id),
    FOREIGN KEY (subscriptor_id) REFERENCES subscriptors(id)
);

CREATE TABLE coopera (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titol TEXT,
    data_inici TEXT,
    impacte_energia TEXT, 
    impacte_aigua TEXT, 
    impacte_emissions TEXT, 
    impacte_economic TEXT,
    detalls TEXT
);

CREATE TABLE empreses_coopera (
    empresa_id INT,
    coopera_id INTEGER,
    FOREIGN KEY (empresa_id) REFERENCES empreses(id),
    FOREIGN KEY (coopera_id) REFERENCES coopera(id)
);

CREATE TABLE persones_coopera (
    persona_id INT,
    coopera_id INTEGER,
    FOREIGN KEY (persona_id) REFERENCES persones(id),
    FOREIGN KEY (coopera_id) REFERENCES coopera(id)
);

-- Insert into empreses
INSERT INTO empreses (nom, telefon, email, web, data_alta, segueix_instagram, segueix_linkedin, tipus, rol) VALUES
('Wonder', '123456789', 'wonder@gmail.com', 'http://wonder.com', '2024-01-01', 'Si', 'No', 'Empresa', 'donadora'),
('Zara', '987654321', 'zara@hotmail.com', 'http://zara.com', '2025-02-01', 'Si', 'Si', 'Empresa', 'ambdues');

-- Insert into ubicacions
INSERT INTO ubicacions (empresa_id, adreça, municipi, codi_postal, poligon) VALUES
(1, 'Carrer 1, 1', 'Granollers', '08001', 'Poligon A'),
(1, 'Carrer 2, 2', 'Barcelona', '08002', 'Poligon B'),
(2, 'Carrer 3, 1', 'França', '08003', 'Poligon C'),
(2, 'Carrer 4, 2', 'Girona', '08004', 'Poligon D');
;

-- Insert into persones
INSERT INTO persones (nom, cognoms, telefon, email, carrec, segueix_instagram, segueix_linkedin, empresa_id) VALUES
('Gabriela', 'Martín', '123456789', 'gabrielamartin@gmail.com', 'Gerent', 'Si', 'Si', 1),
('Glòria', 'Estapé', '987654321', 'gloriaestape@gmail.com', 'Directora', 'No', 'Si', 2);


--Insert into activitats
INSERT INTO activitats (nom, descripcio, data_inici, data_fi, tipus) VALUES
('esmorzar divendres', 'labbb', '2025-03-01', '2025-03-01', 'Esmorzars GRID'),
('evccc', 'charla', '2024-04-01', '2024-04-01', 'Evc Labs');

-- Insert into empreses_activitats
INSERT INTO empreses_activitats (empresa_id, activitat_id) VALUES
(1, 1),
(2, 2);

-- Insert into persones_activitats
INSERT INTO persones_activitats (persona_id, activitat_id) VALUES
(1, 1),
(2, 1),
(2, 2);

-- Insert into productes
INSERT INTO productes (nom, estat, descripcio, data_publicacio, tipus, empresa_id) VALUES
('Ordinador', 'parcialment reaprofitat', 'ordinador taula', '2025-01-15', 'tecnològic', 1),
('Sabates', 'Disponible', 'sabates treballar', '2024-02-15', 'roba', 2);

-- Insert into transaccions
INSERT INTO transaccions (producte_id, empresa_receptora, data_lliurament, estat_transaccio, observacions, quantitat, impacte_CO2, impacte_economic, estat_aprofitament, publicat_GRID, espai_GRID, GRIDees) VALUES
(1, 2, '2025-03-10', 'Completa', 'Observacions A', 10, '25', '100€', 'Aprofitat', 'Sí', 'no', 'si'),
(2, 1, '2025-04-10', 'Pendent', 'Observacions B', 5, '40', '200€', 'No Aprofitat', 'No', 'No', 'no');

-- Insert into materials
INSERT INTO materials (nom) VALUES
('Coto'),
('Llana'),
('Seda'),
('Poliester'),
('Fusta'),
('Plastic'),
('Polietile'),
('Vidre'),
('Ceramica/Porcellana'),
('Acer'),
('Alumini'),
('Aparells electronics'),
('Televisors'),
('Telefons');

-- Insert into productes_materials
INSERT INTO productes_materials (producte_id, material_id) VALUES
(1, 1),
(2, 2);

-- Insert into newsletters
INSERT INTO newsletters (nom, data_publicacio, descripcio) VALUES
('Revista', '2025-01-01', 'Revista Impacte'),
('Periodic', '2025-02-01', 'Periodic');

-- Insert into coopera
INSERT INTO coopera (titol, data_inici, impacte_energia, impacte_aigua, impacte_emissions, impacte_economic, detalls) VALUES
('panels solars', '2025-01-01', '10', '5', '9', '100', 'panels solars a barcelona'),
('Projecte granollers', '2025-02-01', '6', '7', '200', 'Negatiu', 'granollers');

-- Insert into empreses_coopera
INSERT INTO empreses_coopera (empresa_id, coopera_id) VALUES
(1, 1),
(2, 2);

-- Insert into persones_coopera
INSERT INTO persones_coopera (persona_id, coopera_id) VALUES
(1, 1),
(2, 2);

