"use client";

import { useModalStore } from "@/store/useModalStore";
import { ConfirmationModal } from "../ConfirmationModal";
import { SplitTaskModal } from "../SplitTaskModal";
import { PremiumModal } from "../PremiumModal";
// import { EditTaskModal } from "../EditTaskModal";

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

          //   case "editTask":
          //     return <EditTaskModal key={i} {...entry.props} onClose={onClose} />;

          case "premium":
            return <PremiumModal key={i} onClose={onClose} />;

          default:
            return null;
        }
      })}
    </>
  );
};
