"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useGetUsersMembersList } from "@/hooks/todo/members/useGetUsersMembersList";
import { useGetListPendingInvitations } from "@/hooks/todo/members/useGetListPendingInvitations";
import { useUpdateMemberRole } from "@/hooks/todo/members/useUpdateMemberRole";
import { useRemoveMember } from "@/hooks/todo/members/useRemoveMember";
import { useCancelListInvitation } from "@/hooks/todo/members/useCancelListInvitation";
import { InviteUserInput } from "./parts/InviteUserInput/InviteUserInput";
import { MemberRow } from "./parts/MemberRow/MemberRow";
import { PendingInvitationRow } from "./parts/PendingInvitationRow/PendingInvitationRow";
import { WindowComponent } from "@/components/ui/WindowComponent";
import { Database } from "@/lib/schemas/database.types";
import type { PendingInvitation } from "@/lib/api/list/actions";
import styles from "./ListInformation.module.css";
import { InviteLinkSection } from "./parts/InviteLinkSection/InviteLinkSection";
import { Tabs } from "@/components/ui/Tabs/Tabs";

type MembershipRow = Database["public"]["Tables"]["list_memberships"]["Row"];
type ListsRow = Database["public"]["Tables"]["lists"]["Row"];
type ListsType = MembershipRow & { list: ListsRow };
type UserProfile = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "user_id" | "display_name" | "username" | "avatar_url"
>;
type MembershipInfo = Pick<MembershipRow, "role" | "shared_since">;
export type UserWithMembershipRole = UserProfile & MembershipInfo;

interface Props {
  handleCloseConfig: () => void;
  list: ListsType;
}

type ActiveTab = "members" | "invitations" | "links";

export default function ListInformation({ handleCloseConfig, list }: Props) {
  const { getUsersMembersList } = useGetUsersMembersList();
  const { getListPendingInvitations } = useGetListPendingInvitations();
  const { updateMemberRole } = useUpdateMemberRole();
  const { removeMember } = useRemoveMember();
  const { cancelListInvitation } = useCancelListInvitation();

  const [users, setUsers] = useState<UserWithMembershipRole[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("members");

  const isAdminOrOwner = ["owner", "admin"].includes(list.role);
  const currentUserId = list.user_id;

  const fetchMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    const data = await getUsersMembersList(list.list_id);
    if (data) setUsers(data);
    setIsLoadingMembers(false);
  }, [list.list_id, getUsersMembersList]);

  const fetchInvitations = useCallback(async () => {
    if (!isAdminOrOwner) return;
    setIsLoadingInvitations(true);
    const data = await getListPendingInvitations(list.list_id);
    setInvitations(data ?? []);
    setIsLoadingInvitations(false);
  }, [list.list_id, getListPendingInvitations, isAdminOrOwner]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (activeTab === "invitations") fetchInvitations();
  }, [activeTab, fetchInvitations]);

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "editor" | "reader",
  ) => {
    const { error } = await updateMemberRole(list.list_id, userId, newRole);
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u)),
      );
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const { error } = await removeMember(list.list_id, userId);
    if (!error) {
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const { error } = await cancelListInvitation(invitationId);
    if (!error) {
      setInvitations((prev) =>
        prev.filter((i) => i.invitation_id !== invitationId),
      );
    }
  };

  const handleInviteSuccess = () => {
    if (isAdminOrOwner) fetchInvitations();
  };

  const closeConfigModal = () => {
    const confirmationModal = document.getElementById(
      "confirmation-modal-config-modal",
    );
    if (confirmationModal) return;
    handleCloseConfig();
  };

  const skeletonRows = Array.from({ length: 3 });

  return (
    <WindowComponent
      windowTitle={`Información de lista "${list?.list?.list_name}"`}
      id={"list-config-section"}
      crossAction={closeConfigModal}
    >
      <div className={styles.container}>
        {isAdminOrOwner && (
          <section className={styles.inviteSection}>
            <p className={styles.sectionLabel}>Invitar usuario</p>
            <InviteUserInput
              list_id={list.list_id}
              onInviteSuccess={handleInviteSuccess}
            />
          </section>
        )}

        <Tabs
          options={[
            {
              id: "members",
              label: (
                <div className={styles.tabLabelWithBadge}>
                  Miembros
                  <span className={styles.tabBadge}>{users.length || ""}</span>
                </div>
              ),
            },
            ...(isAdminOrOwner
              ? [
                  {
                    id: "invitations",
                    label: (
                      <div className={styles.tabLabelWithBadge}>
                        Invitaciones
                        {invitations.length > 0 && (
                          <span
                            className={`${styles.tabBadge} ${styles.tabBadgePending}`}
                          >
                            {invitations.length}
                          </span>
                        )}
                      </div>
                    ),
                  },
                  {
                    id: "links",
                    label: "Enlace QR",
                  },
                ]
              : []),
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as ActiveTab)}
        />

        {activeTab === "members" && (
          <section className={styles.listSection}>
            {isLoadingMembers
              ? skeletonRows.map((_, i) => (
                  <React.Fragment key={i}>
                    <MemberRow
                      user={null}
                      isCurrentUser={false}
                      callerRole={list.role}
                      onRoleChange={handleRoleChange}
                      onRemove={handleRemoveMember}
                    />
                  </React.Fragment>
                ))
              : users.map((user, i) => (
                  <React.Fragment key={user.user_id}>
                    <MemberRow
                      user={user}
                      isCurrentUser={user.user_id === currentUserId}
                      callerRole={list.role}
                      onRoleChange={handleRoleChange}
                      onRemove={handleRemoveMember}
                    />
                  </React.Fragment>
                ))}
            {!isLoadingMembers && users.length === 0 && (
              <p className={styles.emptyState}>
                No hay miembros en esta lista.
              </p>
            )}
          </section>
        )}

        {activeTab === "invitations" && isAdminOrOwner && (
          <section className={styles.listSection}>
            {isLoadingInvitations
              ? skeletonRows.map((_, i) => (
                  <React.Fragment key={i}>
                    <PendingInvitationRow
                      invitation={null}
                      onCancel={handleCancelInvitation}
                    />
                  </React.Fragment>
                ))
              : invitations.map((inv, i) => (
                  <React.Fragment key={inv.invitation_id}>
                    <PendingInvitationRow
                      invitation={inv}
                      onCancel={handleCancelInvitation}
                    />
                  </React.Fragment>
                ))}
            {!isLoadingInvitations && invitations.length === 0 && (
              <p className={styles.emptyState}>
                No hay invitaciones pendientes.
              </p>
            )}
          </section>
        )}
        {activeTab === "links" && isAdminOrOwner && (
          <section className={styles.linkSection}>
            <InviteLinkSection list_id={list.list_id} />
          </section>
        )}
      </div>
    </WindowComponent>
  );
}
