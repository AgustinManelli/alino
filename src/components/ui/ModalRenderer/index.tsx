"use client";

import { useModalStore } from "@/store/useModalStore";
import { ConfirmationModal } from "../ConfirmationModal";
import { SplitTaskModal } from "../SplitTaskModal";
import { PremiumModal } from "../PremiumModal";
import ListInformation from "@/app/alino-app/components/list-information";

export const ModalRenderer = () => {
  const stack = useModalStore((s) => s.stack);
  const close = useModalStore((s) => s.close);

  return (
    <>
      {stack.map((entry, i) => {
        const onClose = () => close();

        switch (entry.type) {
          case "confirmation":
            return (
              <ConfirmationModal key={i} {...entry.props} onClose={onClose} />
            );

          case "splitTask":
            return (
              <SplitTaskModal key={i} {...entry.props} onClose={onClose} />
            );

          case "premium":
            return <PremiumModal key={i} onClose={onClose} />;

          case "listInformation":
            return (
              <ListInformation
                key={i}
                handleCloseConfig={onClose}
                list={entry.props.list}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
};
