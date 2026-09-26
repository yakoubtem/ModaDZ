import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { VariantEditor } from "./VariantEditor";
import { ImageUpload } from "./ImageUpload";
import type { Product, ProductFormData, Category } from "@/types";
import { generateSku } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();
  const isEditing = !!editProduct;

  const methods = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      sku: "",
      price: "",
      costPrice: "",
      description: "",
      categoryId: "",
      imagePath: undefined,
      barcodeType: "auto",
      variants: [],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const productName = watch("name");
  const imagePath = watch("imagePath");

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editProduct) {
      reset({
        name: editProduct.name,
        sku: editProduct.sku,
        price: editProduct.price.toString(),
        costPrice: editProduct.costPrice?.toString() ?? "0",
        description: editProduct.description ?? "",
        categoryId: editProduct.categoryId?.toString() ?? "",
        imagePath: editProduct.imagePath ?? undefined,
        barcodeType: editProduct.barcodeType || "auto",
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
        costPrice: "",
        description: "",
        categoryId: "",
        imagePath: undefined,
        barcodeType: "auto",
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
    <FormProvider {...methods}>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `${t("products.form.edit_title")} — ${editProduct?.name}` : t("products.add_product")}
      description={
        isEditing
          ? t("products.form.edit_desc")
          : t("products.form.add_desc")
      }
      size="xl"
      scrollable
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t("common.buttons.cancel")}
          </Button>
          <button
            className="btn-primary"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
            style={{
              marginBottom: 0,
              background: "var(--color-primary)",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isEditing ? t("common.buttons.save") : t("products.form.create")}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Row 1: Product info + Image */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24 }}>
          {/* Left: product details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Input
              label={t("products.form.name")}
              placeholder={t("products.form.name_placeholder")}
              error={errors.name?.message}
              {...register("name", {
                required: t("products.form.required_name"),
                minLength: { value: 2, message: t("products.form.min_name") },
              })}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Input
                label={t("products.form.sku")}
                placeholder={t("products.form.sku_placeholder")}
                hint={t("products.form.auto_generated")}
                error={errors.sku?.message}
                {...register("sku", { required: t("products.form.required_sku") })}
              />
              <Input
                label={t("products.form.cost_price") ?? "Prix d'achat"}
                type="number"
                min={0}
                step={50}
                placeholder="0"
                error={errors.costPrice?.message}
                {...register("costPrice", {
                  required: t("products.form.required_cost_price") ?? "Prix d'achat requis",
                  min: { value: 0, message: t("products.form.invalid_price") },
                })}
              />
              <Input
                label={t("products.form.price")}
                type="number"
                min={0}
                step={50}
                placeholder="0"
                error={errors.price?.message}
                {...register("price", {
                  required: t("products.form.required_price"),
                  min: { value: 0, message: t("products.form.invalid_price") },
                })}
              />
            </div>

            <Select
              label={t("products.form.category")}
              error={errors.categoryId?.message}
              {...register("categoryId")}
            >
              <option value="">{t("products.form.no_category")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label={t("labels.config.barcodeType")}
              error={(errors as any).barcodeType?.message}
              {...register("barcodeType")}
            >
              <option value="auto">{t("labels.types.auto")}</option>
              <option value="ean13">{t("labels.types.ean13")}</option>
              <option value="qr">{t("labels.types.qr")}</option>
              <option value="custom">{t("labels.types.custom")}</option>
            </Select>


            <Textarea
              label={t("products.form.description")}
              placeholder={t("products.form.description_placeholder")}
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
    </FormProvider>
  );
}
