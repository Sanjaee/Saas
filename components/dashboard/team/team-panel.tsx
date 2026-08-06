"use client"
import type { ActionState } from "@/lib/action-state";

import * as React from "react"
import { useActionState } from "react"
import { Plus, Mail, Trash2, ShieldCheck, Crown, Users as UsersIcon, UserCog } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { PageHeader } from "@/components/dashboard/page-header"
import { inviteMemberAction, removeMemberAction } from "@/actions/team"
import { ROLE_LABELS, ROLE_DESCRIPTIONS, type Role } from "@/lib/permissions"
import { formatDate, initials } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface TeamMemberRow {
  id: string;
  name: string | null;
  invitedEmail: string;
  role: string;
  status: string;
  permissions: string[];
  createdAt: Date;
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  owner: Crown,
  admin: ShieldCheck,
  manager: UserCog,
  member: UsersIcon,
};

const initialState: ActionState = { error: "", success: "" };

function InviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [role, setRole] = React.useState<Role>("member");
  const [state, formAction, pending] = useActionState(inviteMemberAction, initialState);

  React.useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
          <DialogDescription>They&apos;ll receive an email invitation to join your workspace.</DialogDescription>
        </DialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" name="email" type="email" placeholder="teammate@company.com" required />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="role" value={role} />
            <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending} className="gap-1.5">
              <Mail className="size-4" /> Send invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TeamPanel({ members, canManage = true }: { members: TeamMemberRow[]; canManage?: boolean }) {
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState<TeamMemberRow | undefined>();

  return (
    <div>
      <PageHeader title="Team" description="Members, roles and permissions.">
        {canManage && (
          <Button onClick={() => setInviteOpen(true)} className="gap-1.5">
            <Plus className="size-4" /> Invite member
          </Button>
        )}
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(ROLE_LABELS).map(([value, label]) => {
          const Icon = ROLE_ICONS[value];
          return (
            <Card key={value}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-violet-500" />
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {ROLE_DESCRIPTIONS[value as Role]}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="uppercase tracking-wide">Member</TableHead>
              <TableHead className="uppercase tracking-wide">Role</TableHead>
              <TableHead className="uppercase tracking-wide">Status</TableHead>
              <TableHead className="uppercase tracking-wide">Joined</TableHead>
              <TableHead className="text-right uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-500 text-xs font-bold text-white">
                      {initials(member.name ?? member.invitedEmail)}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{member.name ?? "Invited"}</p>
                      <p className="text-xs text-muted-foreground">{member.invitedEmail}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1.5">
                    {(() => {
                      const Icon = ROLE_ICONS[member.role] ?? UsersIcon;
                      return <Icon className="size-3" />;
                    })()}
                    {ROLE_LABELS[member.role as Role] ?? member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      member.status === "accepted"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-500",
                    )}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(member.createdAt)}</TableCell>
                <TableCell className="text-right">
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      aria-label="Remove member"
                      onClick={() => setRemoving(member)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {inviteOpen && <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />}

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.name ?? "member"}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will immediately lose access to this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!removing) return;
                await removeMemberAction(removing.id);
                toast.success("Member removed.");
                setRemoving(undefined);
                window.location.reload();
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
