import { useState } from "react";
import { PageHeader, PageContent } from "@/components/layout/AppLayout";
import { GeneralSettings } from "./components/GeneralSettings";
import { BackupSettings } from "./components/BackupSettings";
import { UsersSettings } from "../users/UsersSettings";
import { useAuth } from "@/modules/auth/AuthContext";
import { Shield, HardDrive, Store } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "general" | "backup" | "users";

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const tabs = [
    { id: "general", label: "Magasin & Reçus", icon: Store },
    { id: "backup", label: "Sauvegarde", icon: HardDrive },
    { id: "users", label: "Utilisateurs", icon: Shield, adminOnly: true },
  ];

  return (
    <>
      <PageHeader 
        title="Paramètres" 
        description="Configuration de l'application"
      />
      <PageContent className="max-w-4xl mx-auto space-y-6">
        
        {/* Tab Navigation */}
        <div className="flex bg-[var(--color-bg-elevated)] p-1 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          {tabs.map((tab) => {
            if (tab.adminOnly && user?.role !== "admin") return null;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === tab.id
                    ? "bg-[var(--color-accent)] text-white shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "backup" && <BackupSettings />}
        {activeTab === "users" && user?.role === "admin" && <UsersSettings />}

      </PageContent>
    </>
  );
}