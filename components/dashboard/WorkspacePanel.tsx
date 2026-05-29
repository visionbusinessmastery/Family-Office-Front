"use client";

import type { WorkspaceData } from "@/lib/types";

type WorkspacePanelProps = {
  data?: WorkspaceData | null;
  onCreate?: () => void;
  onInvite?: (workspaceId: number) => void;
  onSwitch?: (workspaceId: number) => void;
};

export default function WorkspacePanel({
  data,
  onCreate,
  onInvite,
  onSwitch,
}: WorkspacePanelProps) {
  const workspaces = data?.workspaces || [];
  const activeId = data?.active_workspace_id;
  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeId) || workspaces[0];

  return (
    <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase text-[#3fa9f5]">Multi-user</p>
          <h2 className="text-2xl font-bold mt-1">
            {activeWorkspace?.name || "Family Office"}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Espace partage, membres et droits d&apos;acces.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onCreate && (
            <button
              onClick={onCreate}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              Nouvel espace
            </button>
          )}

          {activeWorkspace && onInvite && (
            <button
              onClick={() => onInvite(activeWorkspace.id)}
              className="rounded-xl bg-[#3fa9f5] px-4 py-2 text-sm font-semibold"
            >
              Inviter
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-bold mb-3">Espaces</h3>
          <div className="space-y-2">
            {workspaces.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucun espace disponible.
              </p>
            ) : (
              workspaces.map((workspace) => {
                const active = workspace.id === activeId;

                return (
                  <button
                    key={workspace.id}
                    onClick={() => onSwitch?.(workspace.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                      active
                        ? "border-[#3fa9f5]/50 bg-[#3fa9f5]/10"
                        : "border-white/10 bg-black/20"
                    }`}
                  >
                    <span className="font-semibold">{workspace.name}</span>
                    <span className="ml-2 text-xs text-gray-400">
                      {workspace.role}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-bold mb-3">Membres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(activeWorkspace?.members || []).length === 0 ? (
              <p className="text-sm text-gray-400">Aucun membre.</p>
            ) : (
              activeWorkspace?.members?.map((member) => (
                <div
                  key={member.email}
                  className="rounded-xl border border-white/10 bg-black/30 p-3"
                >
                  <p className="font-semibold">{member.email}</p>
                  <p className="text-xs text-gray-400">
                    {member.role} - {member.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

