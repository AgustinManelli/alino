import { WindowComponent } from "@/components/ui/window-component";

interface props {
  handleCloseConfig: () => void;
  list: String;
}

export default function ListInviteModal({ handleCloseConfig, list }: props) {
  return (
    <WindowComponent
      windowTitle={"Información de lista"}
      id={"list-invite-section"}
      crossAction={handleCloseConfig}
    ></WindowComponent>
  );
}
