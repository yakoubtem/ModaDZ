import { useState, useEffect } from "react";
import {
  ShieldCheck,
  User2,
  KeyRound,
  UserCog,
  Sparkles,
} from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface Props {
  user?: User;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function UserFormModal({ user, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "cashier",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username || "",
        password: "",
        role: user.role,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name)
      return alert(t("users.form.validation.name_required"));

    if (!formData.username)
      return alert(t("users.form.validation.username_required"));

    if (!user && !formData.password)
      return alert(t("users.form.validation.password_required"));

    setIsSubmitting(true);

    const submitData: any = {
      name: formData.name,
      username: formData.username,
      role: formData.role,
    };

    if (formData.password) {
      submitData.password = formData.password;
    }

    await onSave(submitData);

    setIsSubmitting(false);
  };

  return (
    <Modal
      title=""
      isOpen={true}
      onClose={onClose}
      size="md"
      scrollable
    >
      <div className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-16 h-52 w-52 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-yellow-300/5 blur-3xl" />
        </div>

        {/* Header */}
        <div className="relative" style={{ padding: "32px 32px 24px" }}>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center",
                "rounded-2xl border border-amber-500/20",
                "bg-gradient-to-br from-amber-400/20 to-yellow-500/10",
                "shadow-lg shadow-amber-500/10"
              )}
            >
              <UserCog className="h-7 w-7 text-amber-300" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[22px] font-semibold tracking-tight text-white">
                  {user
                    ? t("users.form.edit_title")
                    : t("users.form.add_title")}
                </h2>

                <Sparkles className="h-4 w-4 text-amber-300" />
              </div>

              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                {t("users.form.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="relative"
          style={{ padding: "28px 32px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Name */}
            <div
              className={cn(
                "rounded-2xl border border-white/10",
                "bg-white/[0.03] backdrop-blur-xl"
              )}
              style={{ padding: 20 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <User2 className="h-4 w-4 text-amber-300" />

                <p className="text-sm font-medium text-zinc-200">
                  {t("users.form.personal_info")}
                </p>
              </div>

              <Input
                label={t("users.form.name")}
                placeholder={t("users.form.name_placeholder")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Credentials */}
            <div
              className={cn(
                "rounded-2xl border border-white/10",
                "bg-white/[0.03] backdrop-blur-xl"
              )}
              style={{ padding: 20 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-300" />

                <p className="text-sm font-medium text-zinc-200">
                  {t("users.form.auth")}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <Input
                  label={t("users.form.username")}
                  placeholder={t("users.form.username_placeholder")}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  label={
                    user
                      ? t("users.form.password_new")
                      : t("users.form.password")
                  }
                  hint={
                    user
                      ? t("users.form.password_hint")
                      : undefined
                  }
                  type="password"
                  placeholder={
                    user
                      ? t("users.form.password_placeholder_edit")
                      : t("users.form.password_placeholder")
                  }
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  required={!user}
                />
              </div>
            </div>

            {/* Role */}
            <div
              className={cn(
                "rounded-2xl border border-white/10",
                "bg-white/[0.03] backdrop-blur-xl"
              )}
              style={{ padding: 20 }}
            >
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-300" />

              <p className="text-sm font-medium text-zinc-200">
                {t("users.form.permissions")}
              </p>
            </div>

            <Select
              label={t("users.form.role")}
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value,
                })
              }
            >
              <option value="cashier">
                {t("users.form.role_cashier_desc")}
              </option>

              <option value="manager">
                {t("users.form.role_manager_desc")}
              </option>

              <option value="admin">
                {t("users.form.role_admin_desc")}
              </option>
            </Select>

            <div className="mt-4 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
              <p className="text-xs leading-relaxed text-zinc-400">
                {formData.role === "admin" && t("users.form.admin_role_details")}
                {formData.role === "manager" && t("users.form.manager_role_details")}
                {formData.role === "cashier" && t("users.form.cashier_role_details")}
              </p>
            </div>
          </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {t("common.buttons.cancel")}
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "min-w-[160px]",
            "bg-gradient-to-r from-amber-400 to-yellow-500",
            "text-black hover:opacity-90"
          )}
        >
          {isSubmitting
            ? t("users.form.saving")
            : user
              ? t("users.form.update_btn")
              : t("users.form.create_btn")}
        </Button>
      </div>
    </form>
      </div>
    </Modal>
  );
}