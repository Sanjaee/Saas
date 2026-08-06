"use client"
import type { ActionState } from "@/lib/action-state";

import * as React from "react"
import { useActionState } from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, Star, FileText, MessageSquareText, Mail } from "lucide-react"
import { toast } from "sonner"

import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
  createPostAction,
  updatePostAction,
  deletePostAction,
  createEmailTemplateAction,
  updateEmailTemplateAction,
  deleteEmailTemplateAction,
} from "@/actions/admin"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const initialState: ActionState = { error: "", success: "" };

function useOnSuccess(state: { success?: string }, onOpenChange: (o: boolean) => void) {
  React.useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);
}

/* ------------------------------- Testimonials ------------------------------ */

export interface AdminTestimonialRow {
  id: string;
  name: string;
  position: string | null;
  company: string | null;
  rating: number;
  content: string;
  published: boolean;
}

const testColumn = createColumnHelper<AdminTestimonialRow>();

function TestimonialDialog({
  mode,
  item,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  item?: AdminTestimonialRow;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [rating, setRating] = React.useState(item?.rating ?? 5);
  const [published, setPublished] = React.useState(item?.published ?? true);
  const [state, formAction, pending] = useActionState(
    mode === "edit" ? updateTestimonialAction : createTestimonialAction,
    initialState,
  );
  useOnSuccess(state, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit testimonial" : "Add testimonial"}</DialogTitle>
          <DialogDescription>Social proof shown on the landing page.</DialogDescription>
        </DialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <form action={formAction} className="space-y-4">
          {mode === "edit" && item && <input type="hidden" name="id" value={item.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="t-name">Name</Label>
              <Input id="t-name" name="name" defaultValue={item?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-company">Company</Label>
              <Input id="t-company" name="company" defaultValue={item?.company ?? ""} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="t-position">Position</Label>
              <Input id="t-position" name="position" defaultValue={item?.position ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <Select value={String(rating)} onValueChange={(v) => setRating(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <SelectItem key={r} value={String(r)}>{r} star{r > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="rating" value={rating} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-content">Review</Label>
            <Textarea id="t-content" name="content" rows={3} defaultValue={item?.content} required />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={published} onCheckedChange={setPublished} id="t-published" />
            <Label htmlFor="t-published">Published</Label>
            <input type="hidden" name="published" value={published ? "on" : "off"} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{mode === "edit" ? "Save changes" : "Add testimonial"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminTestimonialsTable({ rows }: { rows: AdminTestimonialRow[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminTestimonialRow | undefined>();
  const [deleting, setDeleting] = React.useState<AdminTestimonialRow | undefined>();

  const columns = React.useMemo<ColumnDef<AdminTestimonialRow, any>[]>(
    () => [
      testColumn.accessor("name", {
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.position}{row.original.position && row.original.company ? " · " : ""}{row.original.company}
            </p>
          </div>
        ),
      }),
      testColumn.accessor("rating", {
        header: "Rating",
        cell: ({ getValue }) => (
          <span className="flex items-center gap-1 text-amber-400">
            {Array.from({ length: getValue() }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-current" />
            ))}
          </span>
        ),
      }),
      testColumn.accessor("content", {
        header: "Review",
        cell: ({ getValue }) => <p className="max-w-md truncate text-sm text-muted-foreground">“{getValue()}”</p>,
      }),
      testColumn.accessor("published", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge variant="outline" className={getValue() ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}>
            {getValue() ? "Published" : "Draft"}
          </Badge>
        ),
      }),
      testColumn.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => { setEditing(row.original); setOpen(true); }}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" aria-label="Delete" onClick={() => setDeleting(row.original)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        toolbar={<Button onClick={() => { setEditing(undefined); setOpen(true); }} className="gap-1.5"><Plus className="size-4" /> Add</Button>}
      />
      {open && <TestimonialDialog mode={editing ? "edit" : "create"} item={editing} open={open} onOpenChange={setOpen} />}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
            <AlertDialogDescription>This review will be removed from the site.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={async () => {
              if (!deleting) return;
              await deleteTestimonialAction(deleting.id);
              toast.success("Deleted.");
              setDeleting(undefined);
              window.location.reload();
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ----------------------------------- FAQs ---------------------------------- */

export interface AdminFaqRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  published: boolean;
}

const faqColumn = createColumnHelper<AdminFaqRow>();

function FaqDialog({
  mode,
  item,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  item?: AdminFaqRow;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [published, setPublished] = React.useState(item?.published ?? true);
  const [state, formAction, pending] = useActionState(
    mode === "edit" ? updateFaqAction : createFaqAction,
    initialState,
  );
  useOnSuccess(state, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          <DialogDescription>Questions shown in the landing page accordion.</DialogDescription>
        </DialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <form action={formAction} className="space-y-4">
          {mode === "edit" && item && <input type="hidden" name="id" value={item.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="f-question">Question</Label>
              <Input id="f-question" name="question" defaultValue={item?.question} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-category">Category</Label>
              <Input id="f-category" name="category" defaultValue={item?.category ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-answer">Answer</Label>
            <Textarea id="f-answer" name="answer" rows={3} defaultValue={item?.answer} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="f-sort">Sort order</Label>
              <Input id="f-sort" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Switch checked={published} onCheckedChange={setPublished} id="f-published" />
              <Label htmlFor="f-published">Published</Label>
              <input type="hidden" name="published" value={published ? "on" : "off"} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{mode === "edit" ? "Save changes" : "Add FAQ"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminFaqsTable({ rows }: { rows: AdminFaqRow[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminFaqRow | undefined>();
  const [deleting, setDeleting] = React.useState<AdminFaqRow | undefined>();

  const columns = React.useMemo<ColumnDef<AdminFaqRow, any>[]>(
    () => [
      faqColumn.accessor("question", {
        header: "Question",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium">{row.original.question}</p>
            <p className="max-w-md truncate text-xs text-muted-foreground">{row.original.answer}</p>
          </div>
        ),
      }),
      faqColumn.accessor("category", {
        header: "Category",
        cell: ({ getValue }) => (getValue() ? <Badge variant="secondary">{getValue()}</Badge> : <span className="text-muted-foreground">—</span>),
      }),
      faqColumn.accessor("sortOrder", {
        header: "Order",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue()}</span>,
      }),
      faqColumn.accessor("published", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge variant="outline" className={getValue() ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}>
            {getValue() ? "Published" : "Hidden"}
          </Badge>
        ),
      }),
      faqColumn.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => { setEditing(row.original); setOpen(true); }}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" aria-label="Delete" onClick={() => setDeleting(row.original)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search FAQs…"
        toolbar={<Button onClick={() => { setEditing(undefined); setOpen(true); }} className="gap-1.5"><Plus className="size-4" /> Add FAQ</Button>}
      />
      {open && <FaqDialog mode={editing ? "edit" : "create"} item={editing} open={open} onOpenChange={setOpen} />}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>This question will be removed from the site.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={async () => {
              if (!deleting) return;
              await deleteFaqAction(deleting.id);
              toast.success("Deleted.");
              setDeleting(undefined);
              window.location.reload();
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ----------------------------------- Blog ---------------------------------- */

export interface AdminPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  authorName: string;
  tags: string[];
  published: boolean;
  publishedAt: Date;
}

const postColumn = createColumnHelper<AdminPostRow>();

function PostDialog({
  mode,
  item,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  item?: AdminPostRow;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [published, setPublished] = React.useState(item?.published ?? true);
  const [state, formAction, pending] = useActionState(
    mode === "edit" ? updatePostAction : createPostAction,
    initialState,
  );
  useOnSuccess(state, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit post" : "Create post"}</DialogTitle>
          <DialogDescription>Blog content published at /blog.</DialogDescription>
        </DialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <form action={formAction} className="space-y-4">
          {mode === "edit" && item && <input type="hidden" name="id" value={item.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="b-title">Title</Label>
              <Input id="b-title" name="title" defaultValue={item?.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-slug">Slug</Label>
              <Input id="b-slug" name="slug" defaultValue={item?.slug} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="b-author">Author</Label>
              <Input id="b-author" name="authorName" defaultValue={item?.authorName ?? "Zacode Team"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-tags">Tags (comma separated)</Label>
              <Input id="b-tags" name="tags" defaultValue={item?.tags.join(", ") ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="b-excerpt">Excerpt</Label>
            <Textarea id="b-excerpt" name="excerpt" rows={2} defaultValue={item?.excerpt ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="b-content">Content</Label>
            <Textarea id="b-content" name="content" rows={5} placeholder="Write your article…" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={published} onCheckedChange={setPublished} id="b-published" />
            <Label htmlFor="b-published">Published</Label>
            <input type="hidden" name="published" value={published ? "on" : "off"} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{mode === "edit" ? "Save changes" : "Create post"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminBlogTable({ rows }: { rows: AdminPostRow[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminPostRow | undefined>();
  const [deleting, setDeleting] = React.useState<AdminPostRow | undefined>();

  const columns = React.useMemo<ColumnDef<AdminPostRow, any>[]>(
    () => [
      postColumn.accessor("title", {
        header: "Post",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10">
              <FileText className="size-4 text-violet-500" />
            </span>
            <div>
              <p className="text-sm font-medium">{row.original.title}</p>
              <p className="font-mono text-xs text-muted-foreground">/{row.original.slug}</p>
            </div>
          </div>
        ),
      }),
      postColumn.accessor("authorName", {
        header: "Author",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue()}</span>,
      }),
      postColumn.accessor("tags", {
        header: "Tags",
        cell: ({ getValue }) => (
          <div className="flex flex-wrap gap-1">
            {getValue().slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
            ))}
          </div>
        ),
      }),
      postColumn.accessor("publishedAt", {
        header: "Published",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>,
      }),
      postColumn.accessor("published", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge variant="outline" className={getValue() ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}>
            {getValue() ? "Published" : "Draft"}
          </Badge>
        ),
      }),
      postColumn.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => { setEditing(row.original); setOpen(true); }}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" aria-label="Delete" onClick={() => setDeleting(row.original)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search posts…"
        toolbar={<Button onClick={() => { setEditing(undefined); setOpen(true); }} className="gap-1.5"><Plus className="size-4" /> New post</Button>}
      />
      {open && <PostDialog mode={editing ? "edit" : "create"} item={editing} open={open} onOpenChange={setOpen} />}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>This article will be removed from the blog.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={async () => {
              if (!deleting) return;
              await deletePostAction(deleting.id);
              toast.success("Deleted.");
              setDeleting(undefined);
              window.location.reload();
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ------------------------------ Email templates ----------------------------- */

export interface AdminEmailTemplateRow {
  id: string;
  name: string;
  subject: string;
  body: string;
  trigger: string | null;
  active: boolean;
}

const emailColumn = createColumnHelper<AdminEmailTemplateRow>();

function EmailTemplateDialog({
  mode,
  item,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  item?: AdminEmailTemplateRow;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [active, setActive] = React.useState(item?.active ?? true);
  const [state, formAction, pending] = useActionState(
    mode === "edit" ? updateEmailTemplateAction : createEmailTemplateAction,
    initialState,
  );
  useOnSuccess(state, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit template" : "Create template"}</DialogTitle>
          <DialogDescription>Transactional email templates sent by the system.</DialogDescription>
        </DialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <form action={formAction} className="space-y-4">
          {mode === "edit" && item && <input type="hidden" name="id" value={item.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="e-name">Name</Label>
              <Input id="e-name" name="name" defaultValue={item?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-trigger">Trigger</Label>
              <Input id="e-trigger" name="trigger" defaultValue={item?.trigger ?? ""} placeholder="welcome" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-subject">Subject</Label>
            <Input id="e-subject" name="subject" defaultValue={item?.subject} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-body">Body</Label>
            <Textarea id="e-body" name="body" rows={5} defaultValue={item?.body} placeholder="Hi {{name}}, …" required />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={setActive} id="e-active" />
            <Label htmlFor="e-active">Active</Label>
            <input type="hidden" name="active" value={active ? "on" : "off"} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{mode === "edit" ? "Save changes" : "Create template"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminEmailTemplatesTable({ rows }: { rows: AdminEmailTemplateRow[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminEmailTemplateRow | undefined>();
  const [deleting, setDeleting] = React.useState<AdminEmailTemplateRow | undefined>();

  const columns = React.useMemo<ColumnDef<AdminEmailTemplateRow, any>[]>(
    () => [
      emailColumn.accessor("name", {
        header: "Template",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10">
              <Mail className="size-4 text-violet-500" />
            </span>
            <div>
              <p className="text-sm font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.subject}</p>
            </div>
          </div>
        ),
      }),
      emailColumn.accessor("trigger", {
        header: "Trigger",
        cell: ({ getValue }) => (
          getValue() ? <code className="rounded bg-muted px-2 py-0.5 text-xs">{getValue()}</code> : <span className="text-muted-foreground">—</span>
        ),
      }),
      emailColumn.accessor("active", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge variant="outline" className={getValue() ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}>
            {getValue() ? "Active" : "Inactive"}
          </Badge>
        ),
      }),
      emailColumn.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => { setEditing(row.original); setOpen(true); }}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" aria-label="Delete" onClick={() => setDeleting(row.original)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search templates…"
        toolbar={<Button onClick={() => { setEditing(undefined); setOpen(true); }} className="gap-1.5"><Plus className="size-4" /> New template</Button>}
      />
      {open && <EmailTemplateDialog mode={editing ? "edit" : "create"} item={editing} open={open} onOpenChange={setOpen} />}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>This email template will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={async () => {
              if (!deleting) return;
              await deleteEmailTemplateAction(deleting.id);
              toast.success("Deleted.");
              setDeleting(undefined);
              window.location.reload();
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
