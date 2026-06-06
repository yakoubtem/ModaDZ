import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { VariantEditor } from "./VariantEditor";
import { ImageUpload } from "./ImageUpload";
import type { Product, ProductFormData, Category } from "@/types";
import { generateSku } from "@/lib/utils";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<boolean>;
  categories: Category[];
  editProduct?: Product | null;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editProduct,
}: ProductFormModalProps) {
  const isEditing = !!editProduct;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      sku: "",
      price: "",
      description: "",
      categoryId: "",
      imagePath: undefined,
      variants: [],
    },
  });

  const productName = watch("name");
  const imagePath = watch("imagePath");

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editProduct) {
      reset({
        name: editProduct.name,
        sku: editProduct.sku,
        price: editProduct.price.toString(),
        description: editProduct.description ?? "",
        categoryId: editProduct.categoryId?.toString() ?? "",
        imagePath: editProduct.imagePath ?? undefined,
        variants: editProduct.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          stock: v.stock,
          barcode: v.barcode ?? "",
        })),
      });
    } else if (isOpen && !editProduct) {
      reset({
        name: "",
        sku: "",
        price: "",
        description: "",
        categoryId: "",
        imagePath: undefined,
        variants: [],
      });
    }
  }, [isOpen, editProduct, reset]);

  // Auto-generate SKU when name is typed (only when creating)
  useEffect(() => {
    if (!isEditing && productName && productName.length >= 3) {
      setValue("sku", generateSku(productName), { shouldValidate: false });
    }
  }, [productName, isEditing, setValue]);

  const handleFormSubmit = async (data: ProductFormData) => {
    const success = await onSubmit(data);
    if (success) {
      onClose();
      reset();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Modifier — ${editProduct?.name}` : "Nouveau produit"}
      description={
        isEditing
          ? "Modifiez les informations du produit et ses variantes."
          : "Remplissez les informations pour créer un nouveau produit."
      }
      size="xl"
      scrollable
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(handleFormSubmit)}
            isLoading={isSubmitting}
          >
            {isEditing ? "Enregistrer" : "Créer le produit"}
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Row 1: Product info + Image */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24 }}>
          {/* Left: product details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Input
              label="Nom du produit"
              placeholder="ex: T-shirt col rond"
              error={errors.name?.message}
              {...register("name", {
                required: "Le nom est obligatoire",
                minLength: { value: 2, message: "Minimum 2 caractères" },
              })}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input
                label="SKU"
                placeholder="ex: TSH-12345"
                hint="Généré automatiquement"
                error={errors.sku?.message}
                {...register("sku", { required: "Le SKU est obligatoire" })}
              />
              <Input
                label="Prix (DZD)"
                type="number"
                min={0}
                step={50}
                placeholder="0"
                error={errors.price?.message}
                {...register("price", {
                  required: "Le prix est obligatoire",
                  min: { value: 0, message: "Prix invalide" },
                })}
              />
            </div>

            <Select
              label="Catégorie"
              error={errors.categoryId?.message}
              {...register("categoryId")}
            >
              <option value="">Sans catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Textarea
              label="Description"
              placeholder="Description du produit (optionnel)"
              rows={4}
              {...register("description")}
            />
          </div>

          {/* Right: image upload */}
          <div>
            <ImageUpload
              value={imagePath}
              onChange={(path) => setValue("imagePath", path)}
              className="h-full"
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(208,197,175,0.3)" }} />

        {/* Row 2: Variants */}
        <VariantEditor
          control={control}
          register={register}
          errors={errors}
        />
      </div>
    </Modal>
  );
}
