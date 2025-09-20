"use client";

import { WindowComponent } from "@/components/ui/window-component";
import styles from "./ListInformation.module.css";
import React from "react";

import { Database } from "@/lib/schemas/database.types";
import { use, useEffect, useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { MemberRow } from "./member-row";
import InviteUserInput from "./invite-user-input";
import { LoadingIcon } from "@/components/ui/icons/icons";
import { Skeleton } from "@/components/ui/skeleton";

type MembershipRow = Database["public"]["Tables"]["list_memberships"]["Row"];
type ListsRow = Database["public"]["Tables"]["lists"]["Row"];
type ListsType = MembershipRow & { list: ListsRow };

type UserProfile = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "user_id" | "display_name" | "username" | "avatar_url"
>;
type MembershipInfo = Pick<MembershipRow, "role" | "shared_since">;
export type UserWithMembershipRole = UserProfile & MembershipInfo;

interface props {
  handleCloseConfig: () => void;
  list: ListsType;
}

export default function ListInformation({ handleCloseConfig, list }: props) {
  const getUsersMembersList = useTodoDataStore(
    (state) => state.getUsersMembersList
  );

  const [users, setUsers] = useState<UserWithMembershipRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const closeConfigModal = () => {
    const confirmationModal = document.getElementById(
      "confirmation-modal-config-modal"
    );
    if (confirmationModal) return;
    handleCloseConfig();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const memberData = await getUsersMembersList(list.list_id);
      if (memberData) {
        setUsers(memberData);
      }
      setIsLoading(false);
    };

    fetchUsers();
  }, [list.list_id, getUsersMembersList]);

  return (
    <WindowComponent
      windowTitle={`Información de la lista "${list?.list?.list_name}"`}
      id={"list-config-section"}
      crossAction={closeConfigModal}
    >
      <div className={styles.configModalContainer}>
        {["owner", "admin"].includes(list.role) && (
          <SectionContainer
            sectionTitle="Invitar usuario"
            configElements={[
              { content: <InviteUserInput list_id={list.list_id} /> },
            ]}
          />
        )}
        <SectionContainer
          sectionTitle="Miembros"
          configElements={
            isLoading
              ? [
                  {
                    content: <MemberRow key={"skeleton"} user={null} />,
                  },
                ]
              : users.map((user) => ({
                  content: <MemberRow key={user.user_id} user={user} />,
                }))
          }
        />
      </div>
    </WindowComponent>
  );
}

interface ConfigElement {
  content: JSX.Element;
  elementAction?: JSX.Element;
}

interface SectionProps {
  sectionTitle: string;
  sectionDescription?: string;
  configElements: ConfigElement[];
}

function SectionContainer({
  sectionTitle,
  sectionDescription,
  configElements,
}: SectionProps) {
  return (
    <section className={styles.sectionContainer}>
      <p className={styles.sectionTitle}>{sectionTitle}</p>
      <section className={styles.sectionContent}>
        {configElements.map((element, index) => (
          <React.Fragment key={index}>
            <div className={styles.sectionElement}>
              {element.content}
              <div className={styles.sectionAction}>
                {element.elementAction}
              </div>
            </div>
            {configElements.length !== index + 1 && (
              <div className={styles.configElementSeparator}></div>
            )}
          </React.Fragment>
        ))}
      </section>
      {sectionDescription && (
        <p className={styles.sectionDescription}>{sectionDescription}</p>
      )}
    </section>
  );
}
