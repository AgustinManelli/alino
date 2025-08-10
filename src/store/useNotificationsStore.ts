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
  list_name: ListRow["list_name"] | null;
  list_color: ListRow["color"] | null;
  list_icon: ListRow["icon"] | null;

  // campos del invitador (pueden ser null si inviter === null)
  display_name: UserRow["display_name"] | null;
  username: UserRow["username"] | null;
  avatar_url: UserRow["avatar_url"] | null;
};

import { getNotifications } from "@/lib/todo/actions";

type UNS = {
  notifications: InvitationsType[] | [];
  getNotifications: () => Promise<void>;
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

    console.log(data?.notifications);

    set(() => ({ notifications: data?.notifications }));
  },
}));
