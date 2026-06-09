import { IpcMain, app } from "electron";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";
import os from "os";
import crypto from "crypto";
import { execSync } from "child_process";

const SECRET_SALT = "ModaDZ-License-Salt-2026";
const APP_SECRET = "ModaDZ-Encryption-Key-2026-Secure!";

// Generates Machine ID based on hardware specs
export function getMachineId(): string {
  try {
    const interfaces = os.networkInterfaces();
    const macs: string[] = [];
    for (const name of Object.keys(interfaces)) {
      const network = interfaces[name];
      if (network) {
        for (const net of network) {
          if (!net.internal && net.mac && net.mac !== "00:00:00:00:00:00") {
            macs.push(net.mac);
          }
        }
      }
    }
    macs.sort();

    let hwId = "";
    if (os.platform() === "win32") {
      try {
        hwId = execSync("wmic csproduct get uuid", { encoding: "utf8" })
          .replace("UUID", "")
          .trim();
      } catch {
        try {
          hwId = execSync("powershell (Get-WmiObject -Class Win32_ComputerSystemProduct).UUID", { encoding: "utf8" }).trim();
        } catch {}
      }
    } else if (os.platform() === "darwin") {
      try {
        hwId = execSync("ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID | awk -F'\"' '{print $4}'", { encoding: "utf8" }).trim();
      } catch {}
    } else if (os.platform() === "linux") {
      try {
        hwId = execSync("cat /var/lib/dbus/machine-id || cat /etc/machine-id", { encoding: "utf8" }).trim();
      } catch {}
    }

    const cpuModel = os.cpus()[0]?.model || "";
    const rawString = [
      hwId,
      macs.join(","),
      os.hostname(),
      os.platform(),
      os.arch(),
      cpuModel
    ].join("|");

    return crypto.createHash("sha256").update(rawString).digest("hex").toUpperCase();
  } catch (error) {
    return crypto.createHash("sha256").update(os.hostname() + os.platform() + os.arch()).digest("hex").toUpperCase();
  }
}

// Generate secure License Key bound to Machine ID
export function generateLicenseKey(plan: string, expiryDate: Date, machineId: string): string {
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

// Check key format & checksum bound to Machine ID
export function validateLicenseKeyFormat(key: string, machineId: string): boolean {
  if (!key || !key.startsWith("MDZ-")) return false;
  const parts = key.split("-");
  if (parts.length < 5) return false;

  const checksum = parts[parts.length - 1];
  const rawKey = parts.slice(0, parts.length - 1).join("-");

  const sanitizedMachineId = (machineId || "").trim().toUpperCase();
  const expectedChecksum = crypto.createHash("sha256")
    .update(rawKey + sanitizedMachineId + SECRET_SALT)
    .digest("hex")
    .substring(0, 4)
    .toUpperCase();

  return checksum === expectedChecksum;
}

// Calculate license HMAC signature to prevent manual DB overrides
export function computeLicenseSignature(license: {
  licenseKey: string;
  machineId: string;
  plan: string;
  expiresAt: Date;
  isActive: boolean;
}): string {
  const data = [
    license.licenseKey,
    license.machineId,
    license.plan,
    new Date(license.expiresAt).getTime(),
    license.isActive ? "1" : "0"
  ].join("|");

  return crypto.createHmac("sha256", APP_SECRET)
    .update(data)
    .digest("hex");
}

export function registerLicenseHandlers(ipcMain: IpcMain) {
  // Get active license
  ipcMain.handle("license:get", async () => {
    try {
      return await prisma.license.findFirst();
    } catch (err) {
      console.error(err);
      return null;
    }
  });

  // Get Machine ID
  ipcMain.handle("license:getMachineId", async () => {
    return getMachineId();
  });

  // Activate license key or trial
  ipcMain.handle("license:activate", async (_e, params: {
    customerName: string;
    businessName: string;
    phone: string;
    email: string;
    licenseKey?: string;
    plan: "trial7" | "trial30" | "monthly" | "yearly" | "lifetime";
    userId?: number;
  }) => {
    try {
      const currentMachineId = getMachineId();

      // For trial plans, check if trial is already used
      if (params.plan === "trial7" || params.plan === "trial30") {
        const existingLicense = await prisma.license.findFirst();
        if (existingLicense) {
          return { success: false, error: "Une licence (d'essai ou payante) a déjà été configurée sur cette machine." };
        }

        const durationDays = params.plan === "trial7" ? 7 : 30;
        const activatedAt = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        const tempKey = generateLicenseKey(params.plan, expiresAt, currentMachineId);

        const newLicense = await prisma.license.create({
          data: {
            licenseKey: tempKey,
            customerName: params.customerName,
            businessName: params.businessName,
            phone: params.phone,
            email: params.email,
            plan: params.plan,
            activatedAt,
            expiresAt,
            isActive: true,
            machineId: currentMachineId,
          }
        });

        // Write HMAC signature to Settings
        const sig = computeLicenseSignature(newLicense);
        await prisma.setting.upsert({
          where: { key: "license_signature" },
          update: { value: sig },
          create: { key: "license_signature", value: sig }
        });

        await logActivity(
          prisma,
          params.userId || null,
          "license:activated",
          "License",
          String(newLicense.id),
          `Période d'essai (${params.plan}) activée sur la machine ${currentMachineId}`
        );

        return { success: true, license: newLicense };
      }

      // For paid plans, validate key
      if (!params.licenseKey) {
        return { success: false, error: "Clé de licence requise." };
      }

      const keyVal = params.licenseKey.trim().toUpperCase();

      if (!validateLicenseKeyFormat(keyVal, currentMachineId)) {
        return { success: false, error: "Format ou signature de la clé de licence invalide." };
      }

      // Parse plan and calculate expiration from key format
      const keyParts = keyVal.split("-");
      const planCode = keyParts[1];
      let planStr = "yearly";
      let durationDays = 365;

      if (planCode === "T07") { planStr = "trial7"; durationDays = 7; }
      else if (planCode === "T30") { planStr = "trial30"; durationDays = 30; }
      else if (planCode === "M30") { planStr = "monthly"; durationDays = 30; }
      else if (planCode === "Y01") { planStr = "yearly"; durationDays = 365; }
      else if (planCode === "LIF") { planStr = "lifetime"; durationDays = 36500; } // 100 years

      // Double check plan matching (auto-adjust plan to match key format since frontend may send 'yearly' as default)
      if (params.plan !== planStr) {
        params.plan = planStr as any;
      }

      // Check if key is already registered in DB by another PC (or if it exists)
      const keyExists = await prisma.license.findUnique({ where: { licenseKey: keyVal } });
      if (keyExists && keyExists.machineId !== currentMachineId) {
        return { success: false, error: "Cette clé de licence a déjà été activée sur une autre machine." };
      }

      const activatedAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      // Clean existing records if any (renewal case)
      const existingLicense = await prisma.license.findFirst();
      let updatedLicense;
      if (existingLicense) {
        updatedLicense = await prisma.license.update({
          where: { id: existingLicense.id },
          data: {
            licenseKey: keyVal,
            customerName: params.customerName,
            businessName: params.businessName,
            phone: params.phone,
            email: params.email,
            plan: params.plan,
            activatedAt,
            expiresAt,
            isActive: true,
            machineId: currentMachineId,
          }
        });
      } else {
        updatedLicense = await prisma.license.create({
          data: {
            licenseKey: keyVal,
            customerName: params.customerName,
            businessName: params.businessName,
            phone: params.phone,
            email: params.email,
            plan: params.plan,
            activatedAt,
            expiresAt,
            isActive: true,
            machineId: currentMachineId,
          }
        });
      }

      // Compute and store signature
      const sig = computeLicenseSignature(updatedLicense);
      await prisma.setting.upsert({
        where: { key: "license_signature" },
        update: { value: sig },
        create: { key: "license_signature", value: sig }
      });

      await logActivity(
        prisma,
        params.userId || null,
        "license:renewed",
        "License",
        String(updatedLicense.id),
        `Licence activée/renouvelée (Plan: ${params.plan}) sur la machine ${currentMachineId}`
      );

      return { success: true, license: updatedLicense };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || "Erreur d'activation." };
    }
  });

  // Verify license details, system clock rollback, machine ID locks, and HMAC signatures
  ipcMain.handle("license:verify", async () => {
    try {
      const currentMachineId = getMachineId();
      const license = await prisma.license.findFirst();

      if (!license) {
        return { status: "unlicensed", message: "Aucune licence trouvée." };
      }

      // 1. Verify Machine ID Match
      if (license.machineId !== currentMachineId) {
        return { status: "unlicensed", message: "Empreinte matérielle (Machine ID) incorrecte." };
      }

      // 2. Verify Database Integrity via HMAC Signature
      const sigSetting = await prisma.setting.findUnique({ where: { key: "license_signature" } });
      if (!sigSetting) {
        return { status: "locked", message: "Signature de sécurité manquante. Possible modification manuelle." };
      }
      const calculatedSig = computeLicenseSignature(license);
      if (sigSetting.value !== calculatedSig) {
        return { status: "locked", message: "Signature de licence invalide. Tentative de piratage ou modification détectée." };
      }

      // 3. Date Rollback Detection
      const latestSale = await prisma.sale.findFirst({ orderBy: { createdAt: "desc" } });
      const latestLog = await prisma.activityLog.findFirst({ orderBy: { createdAt: "desc" } });

      const latestDate = Math.max(
        latestSale ? new Date(latestSale.createdAt).getTime() : 0,
        latestLog ? new Date(latestLog.createdAt).getTime() : 0,
        new Date(license.activatedAt).getTime()
      );

      const nowTime = Date.now();
      if (nowTime < latestDate - 600000) { // 10 minutes tolerance
        return { status: "locked", message: "Date système incorrecte détectée (horloge reculée). Veuillez corriger l'horloge de votre PC." };
      }

      // 4. Verify Active Flag
      if (!license.isActive) {
        return { status: "locked", message: "Licence suspendue ou désactivée." };
      }

      // 5. Expiration & Grace Period Validation
      const now = new Date();
      const expiresAt = new Date(license.expiresAt);

      if (now > expiresAt) {
        // Compute Grace Period (3 days)
        const graceEnd = new Date(expiresAt);
        graceEnd.setDate(graceEnd.getDate() + 3);

        if (now <= graceEnd) {
          const hoursLeft = Math.max(0, Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60)));
          const daysLeft = Math.ceil(hoursLeft / 24);
          return {
            status: "expired_grace",
            license,
            daysRemaining: 0,
            graceDaysRemaining: daysLeft,
            message: `Votre licence a expiré. Période de grâce restante : ${daysLeft} jour(s).`
          };
        } else {
          return { status: "locked", license, message: "Licence expirée. L'accès au logiciel est verrouillé." };
        }
      }

      // Expiring warning threshold (30 days)
      const diffTime = expiresAt.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) {
        return {
          status: "warning",
          license,
          daysRemaining: diffDays,
          message: `Votre licence expire dans ${diffDays} jour(s).`
        };
      }

      return {
        status: "valid",
        license,
        daysRemaining: diffDays,
        message: "Licence valide."
      };
    } catch (err: any) {
      console.error(err);
      return { status: "locked", message: err.message || "Erreur de vérification de la licence." };
    }
  });

  // Admin key generator (accepts customer machine ID to bind the license)
  ipcMain.handle("license:generateKey", async (_e, params: {
    plan: string;
    expiryDate: string;
    machineId: string;
  }) => {
    try {
      const expiry = new Date(params.expiryDate);
      const key = generateLicenseKey(params.plan, expiry, params.machineId);
      return { success: true, licenseKey: key };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("app:quit", () => {
    app.quit();
  });
}
