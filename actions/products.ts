"use server";
import type { ActionState } from "@/lib/action-state";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { createProduct, updateProduct, deleteProduct } from "@/lib/data";

export async function createProductAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    stock: formData.get("stock"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createProduct(parsed.data);
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: "Product created." };
}

export async function updateProductAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  const id = String(formData.get("id") ?? "");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    stock: formData.get("stock"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await updateProduct(id, parsed.data);
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: "Product updated." };
}

export async function deleteProductAction(id: string) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  await deleteProduct(id);
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: "Product deleted." };
}
