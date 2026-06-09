const crypto = require("crypto");

const SECRET_SALT = "ModaDZ-License-Salt-2026";

function generateLicenseKey(plan, expiryDate, machineId) {
  let planCode = "PRO";
  if (plan === "trial7") planCode = "T07";
  else if (plan === "trial30") planCode = "T30";
  else if (plan === "monthly") planCode = "M30";
  else if (plan === "yearly") planCode = "Y01";
  else if (plan === "lifetime") planCode = "LIF";

  const yearStr = expiryDate.getFullYear().toString();
  // Clean and hash machineId for consistent key formatting
  const sanitizedMachineId = (machineId || "TRIAL").trim().toUpperCase();
  const mHash = crypto.createHash("sha256").update(sanitizedMachineId).digest("hex").toUpperCase();
  const fingerprint = mHash.substring(0, 8);
  const part1 = `MDZ-${planCode}-${yearStr}`;
  const part2 = `${fingerprint.substring(0, 4)}-${fingerprint.substring(4, 8)}`;
  const rawKey = `${part1}-${part2}`;

  const checksum = crypto.createHash("sha256")
    .update(rawKey + sanitizedMachineId + SECRET_SALT)
    .digest("hex")
    .substring(0, 4)
    .toUpperCase();

  return `${rawKey}-${checksum}`;
}

// Read CLI arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log("Usage: node generate-key.js <plan> <duration_years> <machine_id>");
  console.log("Plans: trial7, trial30, monthly, yearly, lifetime");
  console.log("Example: node generate-key.js lifetime 100 A84934C0C9136377284230247ED62AC5E77EE787550CE51493630A6F4E8EE0744");
  process.exit(1);
}

const plan = args[0];
const years = parseInt(args[1], 10);
const machineId = args[2];

const expiryDate = new Date();
expiryDate.setFullYear(expiryDate.getFullYear() + years);

const key = generateLicenseKey(plan, expiryDate, machineId);
console.log("\n==============================================");
console.log("🔑 CLÉ DE LICENCE GÉNÉRÉE AVEC SUCCÈS");
console.log("==============================================");
console.log(`Plan       : ${plan}`);
console.log(`Machine ID : ${machineId}`);
console.log(`Expiration : ${expiryDate.toLocaleDateString()}`);
console.log(`Clé        : ${key}`);
console.log("==============================================\n");
