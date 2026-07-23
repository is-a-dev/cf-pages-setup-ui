const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = "https://cf-pages.is-a.dev";

app.use(express.json());

app.use((req, res, next) => {
	const origin = req.headers.origin;

	if (origin && origin !== ALLOWED_ORIGIN) {
		return res.status(403).json({ error: "Origin not allowed" });
	}

	if (origin === ALLOWED_ORIGIN) {
		res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
		res.setHeader("Vary", "Origin");
		res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	}

	if (req.method === "OPTIONS") {
		return res.sendStatus(204);
	}

	next();
});

app.post("/add-domain", async (req, res) => {
	const { apiKey, accountId, projectName, domainName } = req.body || {};

	if (!apiKey || !accountId || !projectName || !domainName) {
		return res.status(400).json({
			error: "Missing required body fields: apiKey, accountId, projectName, domainName",
		});
	}

	try {
		const response = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(
				accountId
			)}/pages/projects/${encodeURIComponent(projectName)}/domains`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({ name: domainName }),
			}
		);

		const data = await response.json();
		return res.status(response.status).json(data);
	} catch {
		return res.status(500).json({ error: "Failed to call Cloudflare API" });
	}
});

app.listen(PORT, () => {
	console.log(`Listening on port: ${PORT}`);
});
