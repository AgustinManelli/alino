import { create } from "zustand";
import { Database } from "@/lib/schemas/todo-schema";
import { toast } from "sonner";

type InvitationRow = Database["public"]["Tables"]["list_invitations"]["Row"];
type ListRow = Database["public"]["Tables"]["lists"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];

// export type InvitationsType = InvitationRow & {
//   list: Pick<ListRow, "list_name" | "color" | "icon"> | null;
//   inviter: Pick<UserRow, "display_name" | "username" | "avatar_url"> | null;
// };

type InvitationsType = InvitationRow & {
  // campos de la lista (pueden ser null si list === null)
  list_name: ListRow["list_name"];

  // campos del invitador (pueden ser null si inviter === null)
  inviter_display_name: UserRow["display_name"];
  inviter_username: UserRow["username"];
  inviter_avatar_url: UserRow["avatar_url"] | null;
};

import { getNotifications, updateInvitationList } from "@/lib/api/actions";

type UNS = {
  notifications: InvitationsType[] | [];
  getNotifications: () => Promise<void>;
  updateInvitationList: (
    notification_id: string,
    status: string
  ) => Promise<void>;
};

function handleError(err: unknown) {
  toast.error((err as Error).message || "Error desconocido");
  console.log(err);
}

export const useNotificationsStore = create<UNS>()((set, get) => ({
  notifications: [],
  getNotifications: async () => {
    const { data, error } = await getNotifications();

    if (error) {
      handleError(error);
      return;
    }

    set(() => ({ notifications: data?.notifications }));
  },

  updateInvitationList: async (notification_id: string, status: string) => {
    const { data, error } = await updateInvitationList(notification_id, status);

    console.log(error);
    console.log(data);
    if (error) {
      handleError(error);
      return;
    }

    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n.invitation_id !== notification_id
      ),
    }));
  },
}));
