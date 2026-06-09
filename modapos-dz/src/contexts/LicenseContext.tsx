import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useIPC } from "@/hooks/useIPC";
import type { License, LicenseState } from "@/types";
import { toast } from "sonner";

interface LicenseContextType {
  licenseState: LicenseState;
  licenseDetails: License | null;
  daysRemaining: number;
  graceDaysRemaining?: number;
  machineId: string;
  errorMsg: string;
  checkLicense: () => Promise<void>;
  activateLicense: (key: string, plan: string, bizName: string, custName: string, phone: string, email: string) => Promise<boolean>;
  startTrial: (plan: "trial7" | "trial30", bizName: string, custName: string, phone: string, email: string) => Promise<boolean>;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const api = useIPC();
  const [licenseState, setLicenseState] = useState<LicenseState>("loading");
  const [licenseDetails, setLicenseDetails] = useState<License | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [graceDaysRemaining, setGraceDaysRemaining] = useState<number | undefined>(undefined);
  const [machineId, setMachineId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const checkLicense = useCallback(async () => {
    try {
      const mId = await api<string>("license:getMachineId");
      if (mId) setMachineId(mId);

      const res = await api<{
        status: LicenseState;
        license?: License;
        daysRemaining?: number;
        graceDaysRemaining?: number;
        message?: string;
      }>("license:verify");

      if (res) {
        setLicenseState(res.status);
        setLicenseDetails(res.license || null);
        setDaysRemaining(res.daysRemaining || 0);
        setGraceDaysRemaining(res.graceDaysRemaining);
        setErrorMsg(res.message || "");
      } else {
        setLicenseState("unlicensed");
      }
    } catch (err: any) {
      console.error("License check error:", err);
      setLicenseState("locked");
      setErrorMsg(err.message || "Erreur lors de la vérification de la licence.");
    }
  }, [api]);

  useEffect(() => {
    checkLicense();
  }, [checkLicense]);

  const activateLicense = useCallback(async (
    key: string,
    plan: string,
    bizName: string,
    custName: string,
    phone: string,
    email: string
  ) => {
    try {
      const res = await api<{ success: boolean; error?: string; license?: License }>("license:activate", {
        licenseKey: key,
        plan,
        businessName: bizName,
        customerName: custName,
        phone,
        email
      });

      if (res.success && res.license) {
        toast.success("Licence activée avec succès !");
        await checkLicense();
        return true;
      } else {
        toast.error(res.error || "Échec de l'activation.");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de connexion.");
      return false;
    }
  }, [api, checkLicense]);

  const startTrial = useCallback(async (
    plan: "trial7" | "trial30",
    bizName: string,
    custName: string,
    phone: string,
    email: string
  ) => {
    try {
      const res = await api<{ success: boolean; error?: string; license?: License }>("license:activate", {
        plan,
        businessName: bizName,
        customerName: custName,
        phone,
        email
      });

      if (res.success && res.license) {
        toast.success("Période d'essai démarrée !");
        await checkLicense();
        return true;
      } else {
        toast.error(res.error || "Échec de l'activation de l'essai.");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du démarrage de l'essai.");
      return false;
    }
  }, [api, checkLicense]);

  return (
    <LicenseContext.Provider
      value={{
        licenseState,
        licenseDetails,
        daysRemaining,
        graceDaysRemaining,
        machineId,
        errorMsg,
        checkLicense,
        activateLicense,
        startTrial
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error("useLicense must be used within a LicenseProvider");
  }
  return context;
}
