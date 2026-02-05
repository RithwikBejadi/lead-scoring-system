const Project = require("./project.model");
const { generateApiKey } = require("../../utils/generateApiKey");

async function createProject(req, res) {
  const { name, domain } = req.body;

  if (!name || !domain) {
    return res.status(400).json({ error: "name and domain required" });
  }

  const project = await Project.create({
    name,
    domain,
    apiKey: generateApiKey(),
  });

  res.status(201).json({
    projectId: project._id,
    apiKey: project.apiKey,
  });
}

module.exports = { createProject };
