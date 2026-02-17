# Delete Workspace

## Goal
Add a "delete workspace" option to the workspace switcher dropdown, with a confirmation dialog. Follows existing delete patterns (projects, databases).

## Acceptance Criteria
- User can delete a workspace from the dropdown menu
- Confirmation dialog warns about cascading deletion (projects, services, etc.)
- Cannot delete the last remaining workspace
- After deletion, switches to another workspace automatically
- All layers: service → tRPC → UI

## Plan

- [ ] **1. Service layer** — Create `packages/minato/service/src/mutations/workspaces/delete-workspace.ts`
  - Takes `workspaceId` and `userId` params
  - Validates ownership (workspace belongs to user)
  - Executes `db.delete(workspaceTable).where(...)`
  - Returns void (follows project delete pattern)
  - Export from `mutations/workspaces/index.ts`

- [ ] **2. tRPC router** — Add `delete` mutation to `packages/minato/trpc/src/routers/workspaces/mutations.ts`
  - Input: `z.object({ workspaceId: z.string().uuid() })`
  - Calls `deleteWorkspace(input.workspaceId, ctx.user.id)`
  - Protected procedure

- [ ] **3. UI — Workspace switcher** — Update `apps/minato/src/components/layout/workspace-switcher.tsx`
  - Add `IconTrash` icon import
  - Add delete mutation wired to `trpc.workspaces.delete`
  - Add "Delete workspace" menu item (red, at bottom of dropdown)
  - Only show when there are 2+ workspaces (prevent deleting last one)
  - Add confirmation dialog with warning about cascade deletion
  - On success: invalidate queries, if deleted workspace was current → switch to first remaining

- [ ] **4. Workspace provider** — Update `apps/minato/src/providers/workspace-provider.tsx`
  - Handle case where `currentWorkspaceId` no longer exists in the list after deletion
  - Already handles this via the `useEffect` that checks stored ID — should work automatically

- [ ] **5. Verify** — `bun run check-types && bun run fmt-lint`
