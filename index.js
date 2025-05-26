function authenticateUser(password) {
	const validPassword = 'securePassword'; // Replace with your actual password
	return password === validPassword;
}

export default {
	async fetch(request, env) { // HTTP handler 	
		const { pathname } = new URL(request.url);

		const url = new URL(request.url);

		const authCookie = request.headers.get('Cookie')?.split('; ').find(row => row.startsWith('auth='));

		if (authCookie) {
			const cookieValue = authCookie.split('=')[1];
			if (cookieValue === 'your_expected_value') {
				return fetch(request);
			}
		}

		const password = url.searchParams.get('password');
		console.log(password)
		const isAuthenticated = authenticateUser(password);

		if (isAuthenticated) {
			const response = new Response('Login successful', { status: 200 });
			response.headers.set('Set-Cookie', 'auth=your_expected_value; HttpOnly; Path=/; Secure; SameSite=Strict');
			return response;
		} else {
			return new Response('Unauthorized', { status: 401 });
		}


		// empreses
		if (pathname === "/empresa/afegir") {
			const body = await request.formData();
			const { nom, telefon, email, web, data_alta, segueix_instagram, segueix_linkedin, tipus, rol } = Object.fromEntries(body);

			const ubicacions = [];
			for (let i = 0; body.has(`ubicacions[${i}][adreça]`); i++) {
				ubicacions.push({
					adreça: body.get(`ubicacions[${i}][adreça]`),
					municipi: body.get(`ubicacions[${i}][municipi]`),
					codi_postal: body.get(`ubicacions[${i}][codi_postal]`),
					poligon: body.get(`ubicacions[${i}][poligon]`)
				});
			}

			const { results } = await env.DB.prepare(
				"INSERT INTO empreses (nom, telefon, email, web, data_alta, segueix_instagram, segueix_linkedin, tipus, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
			).bind(nom, telefon, email, web, data_alta, segueix_instagram, segueix_linkedin, tipus, rol).run();

			for (const ubicacio of ubicacions) {
				await env.DB.prepare(
					"INSERT INTO ubicacions (empresa_id, adreça, municipi, codi_postal, poligon) VALUES ((SELECT id FROM empreses WHERE nom = ?), ?, ?, ?, ?)"
				).bind(nom, ubicacio.adreça, ubicacio.municipi, ubicacio.codi_postal, ubicacio.poligon).run();
			}

			return Response.json(results);
		}

		if (pathname === "/empreses") {
			const { results } = await env.DB.prepare("SELECT * FROM empreses;").all();
			return Response.json(results);
		}



		// persones
		if (pathname === "/persona/afegir") {
			const body = await request.formData();
			const { nom, cognoms, telefon, email, carrec, segueix_instagram, segueix_linkedin, empresa_nom } = Object.fromEntries(body);

			const { results } = await env.DB.prepare(
				"INSERT INTO persones (nom, cognoms, telefon, email, carrec, segueix_instagram, segueix_linkedin, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?, (SELECT id FROM empreses WHERE nom = ?))"
			).bind(nom, cognoms, telefon, email, carrec, segueix_instagram, segueix_linkedin, empresa_nom).run();
			return Response.json(results);
		}

		if (pathname === "/persones") {
			const { results } = await env.DB.prepare("SELECT * FROM persones;").all();
			return Response.json(results);
		}



		// subscripcions
		if (pathname === "/subscripcio/afegir") {
			const body = await request.formData();
			const { data_alta, persona, newsletter } = Object.fromEntries(body);

			const { results } = await env.DB.prepare(
				"INSERT INTO subscripcions (persona_id, newsletter_id, data_alta) VALUES ((SELECT id FROM persones WHERE nom = ?), (SELECT id FROM newsletters WHERE nom = ?), ?)"
			).bind(persona, newsletter, data_alta).run();
			return Response.json(results);
		}

		if (pathname === "/subscripcions") {
			const { results } = await env.DB.prepare("SELECT * FROM subscripcions;").all();
			return Response.json(results);
		}



		// newsletters
		if (pathname === "/newsletter/afegir") {
			const body = await request.formData();
			console.log(body)
			const { nom, data_publicacio, descripcio } = Object.fromEntries(body);

			const { results } = await env.DB.prepare(
				"INSERT INTO newsletters (nom, data_publicacio, descripcio) VALUES (?, ?, ?)"
			).bind(nom, data_publicacio, descripcio).run();
			return Response.json(results);
		}

		if (pathname === "/newsletters") {
			const { results } = await env.DB.prepare("SELECT * FROM newsletters;").all();
			return Response.json(results);
		}



		// activitats
		if (pathname === "/activitat/afegir") {
			const body = await request.formData();
			const { nom, descripcio, data_inici, data_fi, tipus } = Object.fromEntries(body)

			const { results } = await env.DB.prepare(
				"INSERT INTO activitats (nom, descripcio, data_inici, data_fi, tipus) VALUES (?, ?, ?, ?, ?)"
			).bind(nom, descripcio, data_inici, data_fi, tipus).run();

			const empreses = [];
			for (let i = 0; body.has(`empreses[${i}][nom]`); i++) {
				empreses.push({
					nom: body.get(`empreses[${i}][nom]`),
				});
			}

			for (const empresa of empreses) {
				await env.DB.prepare(
					"INSERT INTO empreses_activitats (empresa_id, activitat_id) VALUES ((SELECT id FROM empreses WHERE nom = ?), (SELECT id FROM activitats WHERE nom = ?))"
				).bind(empresa.nom, nom).run();
			}

			const persones = [];
			for (let i = 0; body.has(`persones[${i}][nom]`); i++) {
				persones.push({
					nom: body.get(`persones[${i}][nom]`),
				});
			}

			for (const persona of persones) {
				await env.DB.prepare(
					"INSERT INTO persones_activitats (persona_id, activitat_id) VALUES ((SELECT id FROM persones WHERE nom = ?), (SELECT id FROM activitats WHERE nom = ?))"
				).bind(persona.nom, nom).run();
			}
			return Response.json(results);
		}

		if (pathname === "/activitats") {
			const { results } = await env.DB.prepare("SELECT * FROM activitats;").all();
			return Response.json(results);
		}




		// coopera
		if (pathname === "/coopera/afegir") {
			const body = await request.formData();
			console.log(body)
			const { titol, data_inici, impacte_energia, impacte_aigua, impacte_emissions, impacte_economic, detalls } = Object.fromEntries(body);

			const { results } = await env.DB.prepare(
				"INSERT INTO coopera (titol, data_inici, impacte_energia, impacte_aigua, impacte_emissions, impacte_economic, detalls) VALUES (?, ?, ?, ?, ?, ?, ?)"
			).bind(titol, data_inici, impacte_energia, impacte_aigua, impacte_emissions, impacte_economic, detalls).run();

			const empreses = [];
			for (let i = 0; body.has(`empreses[${i}][nom]`); i++) {
				empreses.push({
					nom: body.get(`empreses[${i}][nom]`),
				});
			}

			for (const empresa of empreses) {
				await env.DB.prepare(
					"INSERT INTO empreses_coopera (empresa_id, coopera_id) VALUES ((SELECT id FROM empreses WHERE nom = ?), (SELECT id FROM coopera WHERE titol = ?))"
				).bind(empresa.nom, titol).run();
			}

			const persones = [];
			for (let i = 0; body.has(`persones[${i}][nom]`); i++) {
				persones.push({
					nom: body.get(`persones[${i}][nom]`),
				});
			}

			for (const persona of persones) {
				await env.DB.prepare(
					"INSERT INTO persones_coopera (persona_id, coopera_id) VALUES ((SELECT id FROM persones WHERE nom = ?), (SELECT id FROM coopera WHERE titol = ?))"
				).bind(persona.nom, titol).run();
			}
			return Response.json(results);
		}

		if (pathname === "/coopera") {
			const { results } = await env.DB.prepare("SELECT * FROM coopera;").all();
			return Response.json(results);
		}



		// productes
		if (pathname === "/producte/afegir") {
			const body = await request.formData();
			const { nom, estat, descripcio, data_publicacio, tipus, empresa_nom } = Object.fromEntries(body);


			const { results } = await env.DB.prepare(
				"INSERT INTO productes (nom, estat, descripcio, data_publicacio, tipus, empresa_id) VALUES (?, ?, ?, ?, ?, (SELECT id FROM empreses WHERE nom = ?))"
			).bind(nom, estat, descripcio, data_publicacio, tipus, empresa_nom).run();

			const materials = [];
			for (let i = 0; body.has(`materials[${i}][nom]`); i++) {
				materials.push({
					nom: body.get(`materials[${i}][nom]`),
				});
			}

			for (const material of materials) {
				await env.DB.prepare(
					"INSERT INTO productes_materials (producte_id, material_id) VALUES ((SELECT id FROM productes WHERE nom = ?), (SELECT id FROM materials WHERE nom = ?))"
				).bind(nom, material.nom).run();
			}


			return Response.json(results);
		}

		if (pathname === "/productes") {
			const { results } = await env.DB.prepare("SELECT * FROM productes;").all();
			return Response.json(results);
		}



		// transaccions
		if (pathname === "/transaccio/afegir") {
			const body = await request.formData();
			const { producte_nom, empresa_receptora, data_lliurament, estat_transaccio, observacions, quantitat, impacte_CO2, impacte_economic, estat_aprofitament, publicat_GRID, espai_GRID, GRIDees } = Object.fromEntries(body);

			const { results } = await env.DB.prepare(
				"INSERT INTO transaccions (producte_id, empresa_receptora, data_lliurament, estat_transaccio, observacions, quantitat, impacte_CO2, impacte_economic, estat_aprofitament, publicat_GRID, espai_GRID, GRIDees) VALUES ((SELECT id FROM productes WHERE nom = ?), (SELECT id FROM empreses WHERE nom = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
			).bind(producte_nom, empresa_receptora, data_lliurament, estat_transaccio, observacions, quantitat, impacte_CO2, impacte_economic, estat_aprofitament, publicat_GRID, espai_GRID, GRIDees).run();

			return Response.json(results);
		}

		if (pathname === "/transaccions") {
			const { results } = await env.DB.prepare("SELECT * FROM transaccions;").all();
			return Response.json(results);
		}


		// Ubicacions

		if (pathname === "/ubicacions") {
			console.log('Ubicacions!')
			const { results } = await env.DB.prepare("SELECT * FROM ubicacions;").all();
			return Response.json(results);
		}




		// Specific queries:

		// esmorzars.html

		if (pathname === "/esmorzar1") {
			const { results } = await env.DB.prepare(`
				SELECT 
					e.nom AS "Empresa",
					u.municipi AS "Ubicació (municipi)",
					u.poligon AS "Ubicació (polígon)",
					a.data_inici AS "Data de realització de l'esmorzar",
					COUNT(DISTINCT pa.persona_id) AS "Nº de persones",
					strftime('%Y', a.data_inici) AS "Any de participació"
				FROM 
					activitats a
				JOIN 
					empreses_activitats ea ON a.id = ea.activitat_id
				JOIN 
					empreses e ON ea.empresa_id = e.id
				JOIN 
					ubicacions u ON e.id = u.empresa_id
				JOIN 
					persones_activitats pa ON a.id = pa.activitat_id
				WHERE 
					a.tipus = 'Esmorzars GRID'
				GROUP BY 
					e.nom, u.municipi, u.poligon, a.data_inici
				ORDER BY 
					a.data_inici DESC;			
			`).all();
			return Response.json(results);
		}

		if (pathname === "/esmorzar2") {
			const { results } = await env.DB.prepare(`
				SELECT 
					e.nom AS Empresa,
					u.municipi AS "Ubicació (municipi)",
					u.poligon AS "Ubicació (polígon)",
					a.data_inici AS "Data de realització de l'esmorzar",
					COUNT(DISTINCT pa.persona_id) AS "Nº de persones",
					strftime('%Y', a.data_inici) AS "Any de participació"
				FROM 
					persones_activitats pa
				JOIN 
					activitats a ON pa.activitat_id = a.id
				JOIN 
					empreses_activitats ea ON a.id = ea.activitat_id
				JOIN 
					empreses e ON ea.empresa_id = e.id
				JOIN 
					ubicacions u ON e.id = u.empresa_id
				WHERE 
					a.tipus = 'Esmorzars GRID'
				GROUP BY 
					e.nom, u.municipi, u.poligon, a.data_inici, strftime('%Y', a.data_inici)
				ORDER BY 
					a.data_inici DESC;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/esmorzar3") {
			const { results } = await env.DB.prepare(`
            SELECT 
                e.id AS 'Empresa ID',
                e.nom AS 'Empresa',
                COUNT(DISTINCT a.id) AS 'Activitats Participades'
            FROM empreses e
            LEFT JOIN empreses_activitats ea ON e.id = ea.empresa_id
            LEFT JOIN activitats a ON ea.activitat_id = a.id AND a.tipus = 'Esmorzars GRID'
            GROUP BY e.id
            ORDER BY e.nom;
        `).all();
			return Response.json(results);
		}

		if (pathname === "/esmorzar4") {
			const { results } = await env.DB.prepare(`
				SELECT 
					u.municipi,
					COUNT(DISTINCT e.id) AS total_empreses
				FROM empreses e
				JOIN ubicacions u ON e.id = u.empresa_id
				WHERE e.id IN (
					SELECT DISTINCT ea.empresa_id
					FROM empreses_activitats ea
					JOIN activitats a ON ea.activitat_id = a.id
					WHERE a.tipus = 'Esmorzars GRID'
				)
				GROUP BY u.municipi
				ORDER BY total_empreses DESC;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/esmorzar5") {
			const { results } = await env.DB.prepare(`
				SELECT 
					e.id AS id_empresa,
					e.nom AS nom_empresa,
					u.municipi,
					COUNT(DISTINCT p.id) AS num_treballadors_participants
				FROM empreses e
				JOIN ubicacions u ON e.id = u.empresa_id
				JOIN persones p ON e.id = p.empresa_id
				JOIN persones_activitats pa ON p.id = pa.persona_id
				JOIN activitats a ON pa.activitat_id = a.id
				WHERE a.tipus = 'Esmorzars GRID'
				GROUP BY e.id, e.nom, u.municipi
				ORDER BY num_treballadors_participants DESC, e.nom;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/esmorzar6") {
			const { results } = await env.DB.prepare(`
				WITH primera_participacio AS (
					SELECT 
						ea.empresa_id,
						MAX(a.data_inici) AS primera_participacio_data
					FROM empreses_activitats ea
					JOIN activitats a ON ea.activitat_id = a.id
					WHERE a.tipus = 'Esmorzars GRID'
					GROUP BY ea.empresa_id
				),
				ultim_esmorzar AS (
					SELECT MAX(data_inici) AS ultima_data
					FROM activitats
					WHERE tipus = 'Esmorzars GRID'
				)
				SELECT 
					e.id AS id_empresa,
					e.nom AS nom_empresa
				FROM empreses e
				JOIN primera_participacio fe ON e.id = fe.empresa_id
				JOIN ultim_esmorzar ee ON fe.primera_participacio_data = ee.ultima_data
				ORDER BY e.nom;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/esmorzar7") {
			const { results } = await env.DB.prepare(`
				SELECT 
					e.id AS id_empresa,
					e.nom AS empresa,
					COUNT(DISTINCT p.id) AS total_treballadors,
    				GROUP_CONCAT(DISTINCT p.nom || ' ' || p.cognoms ORDER BY p.nom) AS noms_treballadors				FROM empreses e
				JOIN persones p ON e.id = p.empresa_id
				JOIN persones_activitats pa ON p.id = pa.persona_id
				JOIN activitats a ON pa.activitat_id = a.id
				WHERE a.tipus = 'Esmorzars GRID'
				GROUP BY e.id, e.nom
				ORDER BY total_treballadors DESC;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/esmorzar8") {
			const { results } = await env.DbB.prepare(`
				SELECT 
					p.nom || ' ' || p.cognoms AS "Nom del treballador",
					p.carrec AS "Càrrec",
					p.email AS "Correu",
					e.nom AS "Empresa",
					a.nom AS "Esmorzar",
					a.data_inici AS "Data esmorzar"
				FROM activitats a
				JOIN persones_activitats pa ON a.id = pa.activitat_id
				JOIN persones p ON pa.persona_id = p.id
				JOIN empreses e ON p.empresa_id = e.id
				WHERE a.tipus = 'Esmorzars GRID'
			`).all();
			console.log(results)
			return Response.json(results);
		}

		if (pathname === "/esmorzar9") {
			const { results } = await env.DB.prepare(`
				WITH primer_participació AS (
					SELECT 
						p.id AS persona_id,
						CONCAT(p.nom, ' ', p.cognoms) AS nom_treballador,
						MAX(a.data_inici) AS primera_participacio
					FROM persones p
					JOIN persones_activitats pa ON p.id = pa.persona_id
					JOIN activitats a ON pa.activitat_id = a.id
					WHERE a.tipus = 'Esmorzars GRID'
					GROUP BY p.id, p.nom, p.cognoms
				),
				ultim_esmorzar AS (
					SELECT MAX(data_inici) AS última_data
					FROM activitats
					WHERE tipus = 'Esmorzars GRID'
				)
				SELECT 
					fp.persona_id,
					fp.nom_treballador
				FROM primer_participació fp
				JOIN ultim_esmorzar ee ON fp.primera_participacio = ee.última_data
				ORDER BY fp.nom_treballador;
			`).all();
			return Response.json(results);
		}




		// EVC

		if (pathname === "/EVC1") {
			console.log('EVC 1!')
			const { results } = await env.DB.prepare(`
				SELECT 
					e.nom AS Empresa,
					u.municipi AS "Ubicació (municipi)",
					u.poligon AS "Ubicació (polígon)",
					COUNT(DISTINCT pa.persona_id) AS "Nº de persones de la mateixa empresa",
					a.nom AS "Temàtica del taller/formació",
					(SELECT COUNT(DISTINCT e2.id) 
					 FROM empreses e2 
					 JOIN persones p2 ON e2.id = p2.empresa_id
					 JOIN persones_activitats pa2 ON p2.id = pa2.persona_id
					 JOIN activitats a2 ON pa2.activitat_id = a2.id
					 WHERE a2.tipus = 'EVC Labs') AS "Total d'empreses"
				FROM 
					empreses e
				JOIN 
					persones p ON e.id = p.empresa_id
				JOIN 
					persones_activitats pa ON p.id = pa.persona_id
				JOIN 
					activitats a ON pa.activitat_id = a.id
				JOIN
					ubicacions u ON e.id = u.empresa_id
				WHERE 
					a.tipus = 'EVC Labs'
				GROUP BY 
					e.id, u.municipi, u.poligon, a.id
				ORDER BY 
					e.nom;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/EVC2") {
			const { results } = await env.DB.prepare(`
				SELECT 
					p.nom AS Persona,
					u.municipi AS "Ubicació (municipi)",
					u.poligon AS "Ubicació (polígon)",
					COUNT(DISTINCT pa.persona_id) AS "Nº de persones de la mateixa empresa",
					a.nom AS "Temàtica del taller/formació",
					(SELECT COUNT(DISTINCT e2.id) 
					 FROM empreses e2 
					 JOIN persones p2 ON e2.id = p2.empresa_id
					 JOIN persones_activitats pa2 ON p2.id = pa2.persona_id
					 JOIN activitats a2 ON pa2.activitat_id = a2.id
					 WHERE a2.tipus = 'EVC Labs') AS "Total d'empreses"
				FROM 
					persones p
				JOIN 
					empreses e ON p.empresa_id = e.id
				JOIN 
					persones_activitats pa ON p.id = pa.persona_id
				JOIN 
					activitats a ON pa.activitat_id = a.id
				JOIN
					ubicacions u ON e.id = u.empresa_id
				WHERE 
					a.tipus = 'EVC Labs'
				GROUP BY 
					p.id, u.municipi, u.poligon, a.id
				ORDER BY 
					p.nom, a.nom;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/EVC3") {
			const { results } = await env.DB.prepare(`
				SELECT 
					e.nom AS Empresa,
					u.municipi AS "Ubicació (municipi)",
					u.poligon AS "Ubicació (polígon)",
					COUNT(DISTINCT pa.persona_id) AS "Nº de treballadors participants",
					(SELECT COUNT(DISTINCT pa2.persona_id) 
					 FROM persones_activitats pa2
					 JOIN activitats a2 ON pa2.activitat_id = a2.id
					 WHERE a2.tipus = 'EVC Labs') AS "Total general de participants"
				FROM 
					empreses e
				JOIN 
					persones p ON e.id = p.empresa_id
				JOIN 
					persones_activitats pa ON p.id = pa.persona_id
				JOIN
					ubicacions u ON e.id = u.empresa_id
				JOIN
					activitats a ON pa.activitat_id = a.id
				WHERE 
					a.tipus = 'EVC Labs'
				GROUP BY 
					e.id, u.municipi, u.poligon
				ORDER BY 
					COUNT(DISTINCT pa.persona_id) DESC;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/EVC4") {
			const { results } = await env.DB.prepare(`
				SELECT 
					p.nom AS "Nom treballador",
					p.cognoms AS "Cognoms treballador",
					e.nom AS Empresa,
					a.nom AS "Temàtica del taller/formació",
					a.data_inici AS "Data del taller",
					(SELECT COUNT(DISTINCT p2.id) 
					 FROM persones p2
					 JOIN persones_activitats pa2 ON p2.id = pa2.persona_id
					 JOIN activitats a2 ON pa2.activitat_id = a2.id
					 WHERE a2.tipus = 'EVC Labs') AS "Total de treballadors"
				FROM 
					persones p
				JOIN 
					empreses e ON p.empresa_id = e.id
				JOIN 
					persones_activitats pa ON p.id = pa.persona_id
				JOIN 
					activitats a ON pa.activitat_id = a.id
				WHERE 
					a.tipus = 'EVC Labs'
				ORDER BY 
					a.data_inici DESC, e.nom, p.cognoms, p.nom;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/EVC5") {
			const { results } = await env.DB.prepare(`
				WITH primera_participacio AS (
					SELECT 
						ea.empresa_id,
						MAX(a.data_inici) AS primera_participacio_data
					FROM empreses_activitats ea
					JOIN activitats a ON ea.activitat_id = a.id
					WHERE a.tipus = 'EVC Labs'
					GROUP BY ea.empresa_id
				),
				ultim_esmorzar AS (
					SELECT MAX(data_inici) AS ultima_data
					FROM activitats
					WHERE tipus = 'EVC Labs'
				)
				SELECT 
					e.id AS id_empresa,
					e.nom AS nom_empresa
				FROM empreses e
				JOIN primera_participacio fe ON e.id = fe.empresa_id
				JOIN ultim_esmorzar ee ON fe.primera_participacio_data = ee.ultima_data
				ORDER BY e.nom;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/EVC6") {
			const { results } = await env.DB.prepare(`
				WITH primera_participacio AS (
					SELECT 
						pa.persona_id,
						MAX(a.data_inici) AS primera_participacio_data
					FROM persones_activitats pa
					JOIN activitats a ON pa.activitat_id = a.id
					WHERE a.tipus = 'EVC Labs'
					GROUP BY pa.persona_id
				),
				ultim_esmorzar AS (
					SELECT MAX(data_inici) AS ultima_data
					FROM activitats
					WHERE tipus = 'EVC Labs'
				)
				SELECT 
					p.id AS id_persona,
					CONCAT(p.nom, ' ', p.cognoms) AS nom_persona
				FROM persones p
				JOIN primera_participacio fe ON p.id = fe.persona_id
				JOIN ultim_esmorzar ee ON fe.primera_participacio_data = ee.ultima_data
				ORDER BY p.nom;
			`).all();

			return Response.json(results);
		}




		// Cercle

		if (pathname === "/cercle1") {
			const { results } = await env.DB.prepare(`
			SELECT 
				e.nom AS Empresa,
				u.municipi AS 'Ubicació (municipi)',
				u.poligon AS 'Ubicació (polígon)',
				COUNT(DISTINCT pa.persona_id) AS 'Nº de persones de la mateixa empresa',
				a.nom AS 'Temàtica del taller/formació',
				(SELECT COUNT(DISTINCT e2.id) 
				FROM empreses e2 
				JOIN persones p2 ON e2.id = p2.empresa_id
				JOIN persones_activitats pa2 ON p2.id = pa2.persona_id
				JOIN activitats a2 ON pa2.activitat_id = a2.id
				WHERE a2.tipus = 'Cercle Grid') AS 'Total d\'empreses'
			FROM 
				empreses e
			JOIN 
				persones p ON e.id = p.empresa_id
			JOIN 
				persones_activitats pa ON p.id = pa.persona_id
			JOIN 
				activitats a ON pa.activitat_id = a.id
			JOIN
				ubicacions u ON e.id = u.empresa_id
			WHERE 
				a.tipus = 'Cercle Grid'
			GROUP BY 
				e.id, u.municipi, u.poligon, a.id
			ORDER BY 
				e.nom;
			`).all();

			return Response.json(results);
		}


		if (pathname === "/cercle2") {
			const { results } = await env.DB.prepare(`
			SELECT 
				p.nom AS Persona,
				u.municipi AS 'Ubicació (municipi)',
				u.poligon AS 'Ubicació (polígon)',
				COUNT(DISTINCT pa.persona_id) AS 'Nº de persones de la mateixa empresa',
				a.nom AS 'Temàtica del taller/formació',
				(SELECT COUNT(DISTINCT e2.id) 
				FROM empreses e2 
				JOIN persones p2 ON e2.id = p2.empresa_id
				JOIN persones_activitats pa2 ON p2.id = pa2.persona_id
				JOIN activitats a2 ON pa2.activitat_id = a2.id
				WHERE a2.tipus = 'Cercle Grid') AS 'Total d\'empreses'
			FROM 
				persones p
			JOIN 
				empreses e ON p.empresa_id = e.id
			JOIN 
				persones_activitats pa ON p.id = pa.persona_id
			JOIN 
				activitats a ON pa.activitat_id = a.id
			JOIN
				ubicacions u ON e.id = u.empresa_id
			WHERE 
				a.tipus = 'Cercle Grid'
			GROUP BY 
				p.id, u.municipi, u.poligon, a.id
			ORDER BY 
				p.nom, a.nom;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/cercle3") {
			const { results } = await env.DB.prepare(`
			SELECT 
				e.nom AS Empresa,
				u.municipi AS 'Ubicació (municipi)',
				u.poligon AS 'Ubicació (polígon)',
				COUNT(DISTINCT pa.persona_id) AS 'Nº de treballadors participants',
				(SELECT COUNT(DISTINCT pa2.persona_id) 
				FROM persones_activitats pa2
				JOIN activitats a2 ON pa2.activitat_id = a2.id
				WHERE a2.tipus = 'Cercle Grid') AS 'Total general de participants'
			FROM 
				empreses e
			JOIN 
				persones p ON e.id = p.empresa_id
			JOIN 
				persones_activitats pa ON p.id = pa.persona_id
			JOIN
				ubicacions u ON e.id = u.empresa_id
			JOIN
				activitats a ON pa.activitat_id = a.id
			WHERE 
				a.tipus = 'Cercle Grid'
			GROUP BY 
				e.id, u.municipi, u.poligon
			ORDER BY 
				COUNT(DISTINCT pa.persona_id) DESC;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/cercle4") {
			const { results } = await env.DB.prepare(`
			SELECT 
				e.nom AS Empresa,
				u.municipi AS 'Ubicació (municipi)',
				u.poligon AS 'Ubicació (polígon)',
				COUNT(DISTINCT pa.persona_id) AS 'Nº de treballadors participants',
				(SELECT COUNT(DISTINCT pa2.persona_id) 
				FROM persones_activitats pa2
				JOIN activitats a2 ON pa2.activitat_id = a2.id
				WHERE a2.tipus = 'Cercle Grid') AS 'Total general de participants'
			FROM 
				empreses e
			JOIN 
				persones p ON e.id = p.empresa_id
			JOIN 
				persones_activitats pa ON p.id = pa.persona_id
			JOIN
				ubicacions u ON e.id = u.empresa_id
			JOIN
				activitats a ON pa.activitat_id = a.id
			WHERE 
				a.tipus = 'Cercle Grid'
			GROUP BY 
				e.id, u.municipi, u.poligon
			ORDER BY 
				COUNT(DISTINCT pa.persona_id) DESC;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/cercle5") {
			const { results } = await env.DB.prepare(`
			SELECT 
				e.nom AS Empresa,
				u.municipi AS 'Ubicació (municipi)',
				u.poligon AS 'Ubicació (polígon)',
				COUNT(DISTINCT pa.persona_id) AS 'Nº de treballadors participants',
				(SELECT COUNT(DISTINCT pa2.persona_id) 
				FROM persones_activitats pa2
				JOIN activitats a2 ON pa2.activitat_id = a2.id
				WHERE a2.tipus = 'Cercle Grid') AS 'Total general de participants'
			FROM 
				empreses e
			JOIN 
				persones p ON e.id = p.empresa_id
			JOIN 
				persones_activitats pa ON p.id = pa.persona_id
			JOIN
				ubicacions u ON e.id = u.empresa_id
			JOIN
				activitats a ON pa.activitat_id = a.id
			WHERE 
				a.tipus = 'Cercle Grid'
			GROUP BY 
				e.id, u.municipi, u.poligon
			ORDER BY 
				COUNT(DISTINCT pa.persona_id) DESC;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/cercle6") {
			const { results } = await env.DB.prepare(`
					`).all();
			return Response.json(results);
		}




		// Reaprofitats

		if (pathname === "/reaprofitat1") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    COUNT(*) AS 'Total recursos reaprofitats',
                    SUM(quantitat) AS 'Volum reaprofitat'
                FROM 
                    transaccions
                WHERE 
                    estat_transaccio = 'completada';
			`).all();

			return Response.json(results);
		}

		if (pathname === "/reaprofitat2") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    COUNT(*) AS 'Recursos parcialment reaprofitats',
                    SUM(quantitat) AS 'Volum reaprofitat'
                FROM 
                    transaccions
                WHERE 
                    estat_aprofitament = 'parcialment reaprofitat';
			`).all();

			return Response.json(results);
		}

		if (pathname === "/reaprofitat3") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    p.nom AS 'Recurs',
                    p.tipus AS 'Tipus de recurs',
                    SUM(t.quantitat) AS 'Volum total reaprofitat',
                    COUNT(*) AS 'Nº de reaprofitaments'
                FROM 
                    transaccions t
                JOIN 
                    productes p ON t.producte_id = p.id
                WHERE 
                    t.estat_transaccio = 'completada'
                GROUP BY 
                    p.nom, p.tipus
                ORDER BY 
                    SUM(t.quantitat) DESC;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/reaprofitat4") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    COUNT(DISTINCT t.empresa_receptora) AS 'Total prenedors'
                FROM 
                    transaccions t
                WHERE 
                    t.estat_transaccio = 'completada';
			`).all();

			return Response.json(results);
		}

		if (pathname === "/reaprofitat5") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    e.nom AS 'Prenedor',
                    u.municipi AS 'Municipi',
                    COUNT(DISTINCT t.producte_id) AS 'Nº recursos reaprofitats',
                    SUM(t.quantitat) AS 'Volum total reaprofitat'
                FROM 
                    transaccions t
                JOIN 
                    empreses e ON t.empresa_receptora = e.id
                JOIN 
                    ubicacions u ON e.id = u.empresa_id
                WHERE 
                    t.estat_transaccio = 'completada'
                GROUP BY 
                    e.nom, u.municipi
                ORDER BY 
                    COUNT(DISTINCT t.producte_id) DESC;
			`).all();

			return Response.json(results);
		}


		if (pathname === "/reaprofitat6") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    e.nom AS 'Prenedor',
                    p.tipus AS 'Tipus de recurs',
                    COUNT(DISTINCT t.producte_id) AS 'Nº recursos',
                    SUM(t.quantitat) AS 'Volum reaprofitat'
                FROM 
                    transaccions t
                JOIN 
                    empreses e ON t.empresa_receptora = e.id
                JOIN 
                    productes p ON t.producte_id = p.id
                WHERE 
                    t.estat_transaccio = 'completada'
                GROUP BY 
                    e.nom, p.tipus
                ORDER BY 
                    e.nom, COUNT(DISTINCT t.producte_id) DESC;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/reaprofitat7") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    e.nom AS 'Prenedor',
                    p.tipus AS 'Tipus de recurs',
                    COUNT(DISTINCT t.producte_id) AS 'Nº recursos',
                    SUM(t.quantitat) AS 'Volum reaprofitat'
                FROM 
                    transaccions t
                JOIN 
                    empreses e ON t.empresa_receptora = e.id
                JOIN 
                    productes p ON t.producte_id = p.id
                WHERE 
                    t.estat_transaccio = 'completada'
                GROUP BY 
                    e.nom, p.tipus
                ORDER BY 
                    e.nom, COUNT(DISTINCT t.producte_id) DESC;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/reaprofitat8") {
			const { results } = await env.DB.prepare(`
				SELECT 
					COUNT(*) AS 'Prenedors recurrents'
				FROM (
					SELECT 
						empresa_receptora
					FROM 
						transaccions
					WHERE 
						estat_transaccio = 'completada'
						AND data_lliurament >= date('now', '-1 year')
					GROUP BY 
						empresa_receptora
					HAVING 
						COUNT(*) > 1
				) AS recurrents;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/reaprofitat9") {
			const { results } = await env.DB.prepare(`
                SELECT 
                    COUNT(DISTINCT empresa_receptora) AS 'Total donadors'
                FROM 
                    transaccions
                WHERE 
                    estat_transaccio = 'completada';
			`).all();

			return Response.json(results);
		}

		if (pathname === "/reaprofitat10") {
			const { results } = await env.DB.prepare(`
                SELECT 
                    e.nom AS 'Donador',
                    u.municipi AS 'Municipi',
                    COUNT(DISTINCT t.producte_id) AS 'Nº recursos donats',
                    SUM(t.quantitat) AS 'Volum total donat'
                FROM 
                    transaccions t
                JOIN 
                    empreses e ON t.empresa_receptora = e.id
                JOIN 
                    ubicacions u ON e.id = u.empresa_id
                WHERE 
                    t.estat_transaccio = 'completada'
                GROUP BY 
                    e.nom, u.municipi
                ORDER BY 
                    COUNT(DISTINCT t.producte_id) DESC;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/reaprofitat11") {
			const { results } = await env.DB.prepare(`
                SELECT 
                    e.nom AS 'Donador',
                    p.tipus AS 'Tipus de recurs',
                    COUNT(DISTINCT t.producte_id) AS 'Nº recursos',
                    SUM(t.quantitat) AS 'Volum donat'
                FROM 
                    transaccions t
                JOIN 
                    empreses e ON t.empresa_receptora = e.id
                JOIN 
                    productes p ON t.producte_id = p.id
                WHERE 
                    t.estat_transaccio = 'completada'
                GROUP BY 
                    e.nom, p.tipus
                ORDER BY 
                    e.nom, COUNT(DISTINCT t.producte_id) DESC;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/reaprofitat12") {
			const { results } = await env.DB.prepare(`
				SELECT 
					e.nom AS 'Donador nou',
					u.municipi AS 'Municipi',
					MIN(t.data_lliurament) AS 'Primera transacció'
				FROM 
					transaccions t
				JOIN 
					empreses e ON t.empresa_receptora = e.id
				JOIN 
					ubicacions u ON e.id = u.empresa_id
				WHERE 
					t.estat_transaccio = 'completada'
					AND t.data_lliurament >= DATE('now', '-1 year')
					AND NOT EXISTS (
						SELECT 1 
						FROM transaccions t2 
						WHERE t2.empresa_receptora = t.empresa_receptora 
						AND t2.data_lliurament < DATE('now', '-1 year')
						AND t2.estat_transaccio = 'completada'
					)
				GROUP BY 
					e.nom, u.municipi;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/reaprofitat13") {
			const { results } = await env.DB.prepare(`
				SELECT 
					COUNT(*) AS 'Donadors recurrents'
				FROM (
					SELECT 
						empresa_receptora
					FROM 
						transaccions
					WHERE 
						estat_transaccio = 'completada'
						AND data_lliurament >= DATE('now', '-1 year')
					GROUP BY 
						empresa_receptora
					HAVING 
						COUNT(*) > 1
				) AS recurrents;
			`).all();

			return Response.json(results);
		}




		// Ofertats

		if (pathname === "/ofertat1") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    COUNT(*) AS total_recursos_ofertats
                FROM 
                    productes;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/ofertat2") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    e.nom AS empresa,
                    COUNT(p.id) AS num_recursos_ofertats
                FROM 
                    productes p
                JOIN 
                    empreses e ON p.empresa_id = e.id
                GROUP BY 
                    e.nom
                ORDER BY 
                    num_recursos_ofertats DESC;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/ofertat3") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    m.nom AS material,
                    COUNT(p.id) AS num_recursos
                FROM 
                    productes p
                JOIN 
                    productes_materials pm ON p.id = pm.producte_id
                JOIN 
                    materials m ON pm.material_id = m.id
                GROUP BY 
                    m.nom
                ORDER BY 
                    num_recursos DESC;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/ofertat4") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    nom AS tipus,
                    COUNT(id) AS num_recursos
                FROM 
                    productes
                GROUP BY 
                    nom
                ORDER BY 
                    num_recursos DESC;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/ofertat5") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    estat,
                    COUNT(*) AS num_recursos
                FROM 
                    productes
                GROUP BY 
                    estat
                ORDER BY 
                    num_recursos DESC;
			`).all();

			return Response.json(results);
		}




		// Serveis

		if (pathname === "/servei1") {
			const { results } = await env.DB.prepare(`
				SELECT COUNT(DISTINCT ec.empresa_id) AS total_empreses_participants
                FROM empreses_coopera ec
                JOIN coopera c ON ec.coopera_id = c.id;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/servei2") {
			const { results } = await env.DB.prepare(`
				SELECT e.nom AS empresa, c.titol AS projecte, COUNT(ec.coopera_id) AS nombre_projectes
                FROM empreses e
                JOIN empreses_coopera ec ON e.id = ec.empresa_id
                JOIN coopera c ON ec.coopera_id = c.id
                GROUP BY e.nom, c.titol
                ORDER BY nombre_projectes DESC;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/servei3") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    SUM(CASE WHEN impacte_energia IS NOT NULL THEN 1 ELSE 0 END) AS total_impactes_energia,
                    SUM(CASE WHEN impacte_aigua IS NOT NULL THEN 1 ELSE 0 END) AS total_impactes_aigua,
                    SUM(CASE WHEN impacte_emissions IS NOT NULL THEN 1 ELSE 0 END) AS total_impactes_emissions,
                    SUM(CASE WHEN impacte_economic IS NOT NULL THEN 1 ELSE 0 END) AS total_impactes_economic
                FROM coopera;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/servei4") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    'Energia' AS vector,
                    COUNT(DISTINCT ec.empresa_id) AS nombre_empreses
                FROM coopera c
                JOIN empreses_coopera ec ON c.id = ec.coopera_id
                WHERE c.impacte_energia IS NOT NULL

                UNION ALL

                SELECT 
                    'Aigua' AS vector,
                    COUNT(DISTINCT ec.empresa_id) AS nombre_empreses
                FROM coopera c
                JOIN empreses_coopera ec ON c.id = ec.coopera_id
                WHERE c.impacte_aigua IS NOT NULL

                UNION ALL

                SELECT 
                    'Emissions' AS vector,
                    COUNT(DISTINCT ec.empresa_id) AS nombre_empreses
                FROM coopera c
                JOIN empreses_coopera ec ON c.id = ec.coopera_id
                WHERE c.impacte_emissions IS NOT NULL

                UNION ALL

                SELECT 
                    'Econòmic' AS vector,
                    COUNT(DISTINCT ec.empresa_id) AS nombre_empreses
                FROM coopera c
                JOIN empreses_coopera ec ON c.id = ec.coopera_id
                WHERE c.impacte_economic IS NOT NULL;

			`).all();

			return Response.json(results);
		}

		if (pathname === "/servei5") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    'Energia' AS vector,
                    GROUP_CONCAT(c.impacte_economic) AS detalls_estalvi
                FROM coopera c
                WHERE c.impacte_energia IS NOT NULL

                UNION ALL

                SELECT 
                    'Aigua' AS vector,
                    GROUP_CONCAT(c.impacte_economic) AS detalls_estalvi
                FROM coopera c
                WHERE c.impacte_aigua IS NOT NULL

                UNION ALL

                SELECT 
                    'Emissions' AS vector,
                    GROUP_CONCAT(c.impacte_economic) AS detalls_estalvi
                FROM coopera c
                WHERE c.impacte_emissions IS NOT NULL;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/servei6") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    c.id AS id_servei, 
                    c.titol AS titol_servei, 
                    c.impacte_economic AS estalvi_generat
                FROM coopera c
                WHERE c.impacte_economic IS NOT NULL
                ORDER BY c.titol;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/servei7") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    e.nom AS nom_empresa, 
                    c.titol AS titol_servei, 
                    c.impacte_economic AS estalvi_projecte
                FROM empreses e
                JOIN empreses_coopera ec ON e.id = ec.empresa_id
                JOIN coopera c ON ec.coopera_id = c.id
                WHERE c.impacte_economic IS NOT NULL
                ORDER BY e.nom, c.titol;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/servei8") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    e.nom AS nom_empresa, 
                    c.titol AS titol_servei, 
                    c.impacte_economic AS estalvi_projecte
                FROM empreses e
                JOIN empreses_coopera ec ON e.id = ec.empresa_id
                JOIN coopera c ON ec.coopera_id = c.id
                WHERE c.impacte_economic IS NOT NULL
                ORDER BY e.nom, c.titol;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/servei9") {
			const { results } = await env.DB.prepare(`
				SELECT 
					CONCAT(strftime('%Y', c.data_inici), '-', 
						CASE WHEN strftime('%m', c.data_inici) <= '06' THEN '1' ELSE '2' END) AS semestre,
					COUNT(DISTINCT ec.empresa_id) AS empreses_participants
				FROM coopera c
				JOIN empreses_coopera ec ON c.id = ec.coopera_id
				GROUP BY semestre
				ORDER BY semestre;			
			`).all();
			return Response.json(results);
		}

		if (pathname === "/servei10") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    strftime('%Y', c.data_inici) AS any,
                    'Energia' AS vector,
                    COUNT(c.id) AS nombre_projectes
                FROM coopera c
                WHERE c.impacte_energia IS NOT NULL
                GROUP BY any

                UNION ALL

                SELECT 
                    strftime('%Y', c.data_inici) AS any,
                    'Aigua' AS vector,
                    COUNT(c.id) AS nombre_projectes
                FROM coopera c
                WHERE c.impacte_aigua IS NOT NULL
                GROUP BY any

                UNION ALL

                SELECT 
                    strftime('%Y', c.data_inici) AS any,
                    'Emissions' AS vector,
                    COUNT(c.id) AS nombre_projectes
                FROM coopera c
                WHERE c.impacte_emissions IS NOT NULL
                GROUP BY any

                UNION ALL

                SELECT 
                    strftime('%Y', c.data_inici) AS any,
                    'Econòmic' AS vector,
                    COUNT(c.id) AS nombre_projectes
                FROM coopera c
                WHERE c.impacte_economic IS NOT NULL
                GROUP BY any;
			`).all();

			return Response.json(results);
		}




		// Taller

		if (pathname === "/taller1") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    e.nom AS Empresa,
                    u.municipi AS 'Ubicació (municipi)',
                    u.poligon AS 'Ubicació (polígon)',
                    COUNT(DISTINCT pa.persona_id) AS 'Nº de persones de la mateixa empresa',
                    a.nom AS 'Temàtica del taller/formació',
                    (SELECT COUNT(DISTINCT e2.id) 
                    FROM empreses e2 
                    JOIN persones p2 ON e2.id = p2.empresa_id
                    JOIN persones_activitats pa2 ON p2.id = pa2.persona_id
                    JOIN activitats a2 ON pa2.activitat_id = a2.id
                    WHERE a2.tipus = 'Tallers i cursos de formació') AS 'Total d\'empreses'
                FROM 
                    empreses e
                JOIN 
                    persones p ON e.id = p.empresa_id
                JOIN 
                    persones_activitats pa ON p.id = pa.persona_id
                JOIN 
                    activitats a ON pa.activitat_id = a.id
                JOIN
                    ubicacions u ON e.id = u.empresa_id
                WHERE 
                    a.tipus = 'Tallers i cursos de formació'
                GROUP BY 
                    e.id, u.municipi, u.poligon, a.id
                ORDER BY 
                    e.nom, a.nom;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/taller2") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    p.nom AS Persona,
                    u.municipi AS 'Ubicació (municipi)',
                    u.poligon AS 'Ubicació (polígon)',
                    COUNT(DISTINCT pa.persona_id) AS 'Nº de persones de la mateixa empresa',
                    a.nom AS 'Temàtica del taller/formació',
                    (SELECT COUNT(DISTINCT e2.id) 
                    FROM empreses e2 
                    JOIN persones p2 ON e2.id = p2.empresa_id
                    JOIN persones_activitats pa2 ON p2.id = pa2.persona_id
                    JOIN activitats a2 ON pa2.activitat_id = a2.id
                    WHERE a2.tipus = 'Tallers i cursos de formació') AS 'Total d\'empreses'
                FROM 
                    persones p
                JOIN 
                    empreses e ON p.empresa_id = e.id
                JOIN 
                    persones_activitats pa ON p.id = pa.persona_id
                JOIN 
                    activitats a ON pa.activitat_id = a.id
                JOIN
                    ubicacions u ON e.id = u.empresa_id
                WHERE 
                    a.tipus = 'Tallers i cursos de formació'
                GROUP BY 
                    p.id, u.municipi, u.poligon, a.id
                ORDER BY 
                    p.nom, a.nom;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/taller3") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    e.nom AS Empresa,
                    u.municipi AS 'Ubicació (municipi)',
                    u.poligon AS 'Ubicació (polígon)',
                    COUNT(DISTINCT pa.persona_id) AS 'Nº de treballadors participants',
                    (SELECT COUNT(DISTINCT pa2.persona_id) 
                    FROM persones_activitats pa2
                    JOIN activitats a2 ON pa2.activitat_id = a2.id
                    WHERE a2.tipus = 'Tallers i cursos de formació') AS 'Total general de participants'
                FROM 
                    empreses e
                JOIN 
                    persones p ON e.id = p.empresa_id
                JOIN 
                    persones_activitats pa ON p.id = pa.persona_id
                JOIN
                    ubicacions u ON e.id = u.empresa_id
                JOIN
                    activitats a ON pa.activitat_id = a.id
                WHERE 
                    a.tipus = 'Tallers i cursos de formació'
                GROUP BY 
                    e.id, u.municipi, u.poligon
                ORDER BY 
                    COUNT(DISTINCT pa.persona_id) DESC;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/taller4") {
			const { results } = await env.DB.prepare(`
				SELECT 
                    p.nom AS 'Nom treballador',
                    p.cognoms AS 'Cognoms treballador',
                    e.nom AS Empresa,
                    a.nom AS 'Temàtica del taller/formació',
                    a.data_inici AS 'Data del taller',
                    (SELECT COUNT(DISTINCT p2.id) 
                    FROM persones p2
                    JOIN persones_activitats pa2 ON p2.id = pa2.persona_id
                    JOIN activitats a2 ON pa2.activitat_id = a2.id
                    WHERE a2.tipus = 'Tallers i cursos de formació') AS 'Total de treballadors'
                FROM 
                    persones p
                JOIN 
                    empreses e ON p.empresa_id = e.id
                JOIN 
                    persones_activitats pa ON p.id = pa.persona_id
                JOIN 
                    activitats a ON pa.activitat_id = a.id
                WHERE 
                    a.tipus = 'Tallers i cursos de formació'
                ORDER BY 
                    a.data_inici DESC, e.nom, p.cognoms, p.nom;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/taller5") {
			const { results } = await env.DB.prepare(`
				WITH primera_participacio AS (
                    SELECT 
                        ea.empresa_id,
                        MAX(a.data_inici) AS primera_participacio_data
                    FROM empreses_activitats ea
                    JOIN activitats a ON ea.activitat_id = a.id
                    WHERE a.tipus = 'Tallers i cursos de formació'
                    GROUP BY ea.empresa_id
                ),
                ultim_esmorzar AS (
                    SELECT MAX(data_inici) AS ultima_data
                    FROM activitats
                    WHERE tipus = 'Tallers i cursos de formació'
                )
                SELECT 
                    e.id AS id_empresa,
                    e.nom AS nom_empresa
                FROM empreses e
                JOIN primera_participacio fe ON e.id = fe.empresa_id
                JOIN ultim_esmorzar ee ON fe.primera_participacio_data = ee.ultima_data
                ORDER BY e.nom;
			`).all();

			return Response.json(results);
		}

		if (pathname === "/taller6") {
			const { results } = await env.DB.prepare(`
				WITH primera_participacio AS (
                    SELECT 
                        pa.persona_id,
                        MAX(a.data_inici) AS primera_participacio_data
                    FROM persones_activitats pa
                    JOIN activitats a ON pa.activitat_id = a.id
                    WHERE a.tipus = 'Tallers i cursos de formació'
                    GROUP BY pa.persona_id
                ),
                ultim_esmorzar AS (
                    SELECT MAX(data_inici) AS ultima_data
                    FROM activitats
                    WHERE tipus = 'Tallers i cursos de formació'
                )
                SELECT 
                    p.id AS id_persona,
                    CONCAT(p.nom, ' ', p.cognoms) AS nom_persona
                FROM persones p
                JOIN primera_participacio fe ON p.id = fe.persona_id
                JOIN ultim_esmorzar ee ON fe.primera_participacio_data = ee.ultima_data
                ORDER BY p.nom;
			`).all();

			return Response.json(results);
		}




		// Newsletter

		if (pathname === "/newsletter1") {
			const { results } = await env.DB.prepare(`
				SELECT 
					id AS id_newsletter,
					nom AS nom_newsletter,
					data_publicacio,
					descripcio
				FROM newsletters
				ORDER BY data_publicacio DESC;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/newsletter2") {
			const { results } = await env.DB.prepare(`
				SELECT 
					s.id AS id_suscriptor,
					s.email,
					s.data_alta,
					COUNT(n.id) AS newsletters_rebudes
				FROM subscriptors s
				LEFT JOIN subscriptors_newsletters sn ON s.id = sn.subscriptor_id
				LEFT JOIN newsletters n ON sn.newsletter_id = n.id
				WHERE s.inscrit_newsletter = 'Sí'
				GROUP BY s.id, s.email, s.data_alta
				ORDER BY s.data_alta DESC;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/newsletter3") {
			const { results } = await env.DB.prepare(`
				SELECT 
					s.id AS subscriptor_id,
					s.email,
					COUNT(sn.newsletter_id) AS num_newsletters_recibidas
				FROM subscriptors s
				LEFT JOIN subscriptors_newsletters sn ON s.id = sn.subscriptor_id
				GROUP BY s.id, s.email
				ORDER BY num_newsletters_recibidas DESC;
			`).all();
			return Response.json(results);
		}

		if (pathname === "/newsletter4") {
			const { results } = await env.DB.prepare(`
				SELECT 
					e.id,
					e.nom,
					e.telefon,
					e.email,
					e.web,
					e.segueix_instagram,
					e.segueix_linkedin
				FROM empreses e
				WHERE e.segueix_instagram = 'Si' OR e.segueix_linkedin = 'Si';
			`).all();
			return Response.json(results);
		}

		if (pathname === "/newsletter5") {
			const { results } = await env.DB.prepare(`
				SELECT 
					p.id,
					p.nom,
					p.cognoms,
					p.telefon,
					p.email,
					p.carrec,
					p.segueix_instagram,
					p.segueix_linkedin
				FROM persones p
				WHERE p.segueix_instagram = 'Si' or p.segueix_linkedin = 'Si';
			`).all();
			return Response.json(results);
		}

		return env.ASSETS

	}
};
