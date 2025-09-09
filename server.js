import express from "express";
import cors from "cors";
import fs from "fs-extra";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Path to used answers file
const usedAnswersFile = "usedAnswers.json";

// Allowed answers for Round 13
const allowedAnswers = [
  "motherboard","harddrive","operatingsystem","browser","algorithm","database",
  "artificialintelligence","machinelearning","blockchain","cloudcomputing","malware",
  "datamining","visualization","networkarchitecture","userexperience","firewall",
  "virtualprivatenetwork","bigdata","router","server","centralprocessingunit",
  "graphicsprocessingunit","encryption","description","javascript","transistors",
  "cache","ipaddress","frontend","backend","omen","mongodb"
];

// Normalize input
function normalizeInput(str) {
  return str.toLowerCase().replace(/\s+/g, "");
}

// GET: check if answer is valid and unused
app.get("/check-answer", async (req, res) => {
  const round = req.query.round;
  const answer = normalizeInput(req.query.answer || "");

  if (!allowedAnswers.includes(answer)) {
    return res.json({ valid: false, used: false });
  }

  const usedData = await fs.readJSON(usedAnswersFile);
  const roundUsed = usedData[round] || [];

  if (roundUsed.includes(answer)) {
    return res.json({ valid: true, used: true });
  }

  res.json({ valid: true, used: false });
});

// POST: mark answer as used
app.post("/mark-used", async (req, res) => {
  const { round, answer } = req.body;
  if (!round || !answer) {
    return res.status(400).json({ success: false, message: "Missing round or answer" });
  }

  const normalizedAnswer = normalizeInput(answer);
  const usedData = await fs.readJSON(usedAnswersFile);
  usedData[round] = usedData[round] || [];

  if (!usedData[round].includes(normalizedAnswer)) {
    usedData[round].push(normalizedAnswer);
    await fs.writeJSON(usedAnswersFile, usedData, { spaces: 2 });
  }

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
