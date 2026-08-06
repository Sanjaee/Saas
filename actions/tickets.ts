"use server";
import type { ActionState } from "@/lib/action-state";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { ticketSchema } from "@/lib/validations";
import { createTicket } from "@/lib/data";

export async function submitTicketAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  const parsed = ticketSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
    category: formData.get("category"),
    priority: formData.get("priority"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await createTicket({ userId: user.id, ...parsed.data });
  revalidatePath("/help");
  return { success: "Ticket submitted! We'll reply by email shortly." };
}
