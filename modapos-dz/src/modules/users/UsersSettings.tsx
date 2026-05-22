import { useState } from "react";
import { useUsers } from "./hooks/useUsers";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UserFormModal } from "./components/UserFormModal";
import type { User } from "@/types";

export function UsersSettings() {
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(undefined);
    setModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (selectedUser) {
      const success = await updateUser(selectedUser.id, data);
      if (success) setModalOpen(false);
    } else {
      const success = await createUser(data);
      if (success) setModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Utilisateurs et permissions</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">Gérez les accès à l'application.</p>
        </div>
        <Button onClick={handleAdd}>Ajouter un utilisateur</Button>
      </div>

      <div className="bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-[var(--color-text-muted)]">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-[var(--color-text-muted)]">Aucun utilisateur trouvé.</div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {users.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-[var(--color-bg-subtle)]">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {user.name}
                    {user.role === "admin" ? (
                      <Badge variant="success">Administrateur</Badge>
                    ) : (
                      <Badge variant="neutral">Caissier</Badge>
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Créé le {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>Modifier</Button>
                  <Button variant="default" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => deleteUser(user.id)}>Supprimer</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <UserFormModal
          user={selectedUser}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}