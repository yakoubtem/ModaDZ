import { useBackups } from "../hooks/useBackups";
import { Button } from "@/components/ui/Button";

export function BackupSettings() {
  const { backups, isLoading, createBackup, restoreBackup, exportBackup } = useBackups();

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-bg-elevated)] p-6 rounded-lg border border-[var(--color-border)] flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Créer une sauvegarde</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Il est recommandé de sauvegarder vos données régulièrement pour éviter toute perte en cas de panne de l'appareil.
          </p>
        </div>
        <Button onClick={() => createBackup()} variant="primary">
          Nouvelle sauvegarde
        </Button>
      </div>

      <div className="bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          <h3 className="font-medium text-[var(--color-text-primary)]">Historique des sauvegardes</h3>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center text-[var(--color-text-muted)]">Chargement...</div>
        ) : backups.length === 0 ? (
          <div className="p-6 text-center text-[var(--color-text-muted)]">Aucune sauvegarde trouvée.</div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {backups.map((backup) => (
              <div key={backup.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{backup.filename}</div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Date: {new Date(backup.createdAt).toLocaleString()} • Taille: {(backup.size / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportBackup(backup.id, backup.filename)}>
                    Exporter (ZIP)
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => restoreBackup(backup.id, backup.filename)}>
                    Restaurer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}