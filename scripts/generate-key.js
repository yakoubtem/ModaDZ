const crypto = require("crypto");

const SECRET_SALT = "ModaDZ-License-Salt-2026";

function generateLicenseKey(plan, expiryDate, machineId) {
  let planCode = "PRO";
  if (plan === "trial3") planCode = "T03";
  else if (plan === "trial7") planCode = "T07";
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
if (args.length < 2) {
  console.log("Usage:");
  console.log("  node generate-key.js <plan> <machine_id>             (Defaults: lifetime=100 years, others=1 year)");
  console.log("  node generate-key.js <plan> <years> <machine_id>     (Specify custom duration)");
  console.log("\nPlans: trial3, trial7, trial30, monthly, yearly, lifetime");
  console.log("Examples:");
  console.log("  node generate-key.js lifetime A84934C0C9136377284230247ED62AC5E...");
  console.log("  node generate-key.js yearly A84934C0C9136377284230247ED62AC5E...");
  console.log("  node generate-key.js yearly 2 A84934C0C9136377284230247ED62AC5E...");
  process.exit(1);
}

const plan = args[0];
let years = 1;
let machineId = "";

const isSecondArgNumber = !isNaN(parseInt(args[1], 10)) && /^\d+$/.test(args[1]);

if (args.length === 2) {
  // node generate-key.js <plan> <machine_id>
  machineId = args[1];
  years = (plan === "lifetime") ? 100 : 1;
} else {
  // node generate-key.js <plan> <years> <machine_id>
  years = parseInt(args[1], 10);
  machineId = args[2];
}

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
