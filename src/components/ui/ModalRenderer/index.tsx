"use client";

import dynamic from "next/dynamic";
import { useModalStore } from "@/store/useModalStore";

const ConfirmationModal = dynamic(
  () => import("../ConfirmationModal").then((m) => m.ConfirmationModal),
  { ssr: false },
);
const SplitTaskModal = dynamic(
  () => import("../SplitTaskModal").then((m) => m.SplitTaskModal),
  { ssr: false },
);
const PremiumModal = dynamic(
  () => import("../PremiumModal").then((m) => m.PremiumModal),
  { ssr: false },
);
const ListInformation = dynamic(
  () => import("@/app/alino-app/components/list-information"),
  { ssr: false },
);
const MoveListModal = dynamic(
  () => import("../MoveListModal").then((m) => m.MoveListModal),
  { ssr: false },
);
const MultiDeleteConfirmModal = dynamic(
  () =>
    import("../MultiDeleteConfirmModal").then(
      (m) => m.MultiDeleteConfirmModal,
    ),
  { ssr: false },
);

export const ModalRenderer = () => {
  const stack = useModalStore((s) => s.stack);
  const close = useModalStore((s) => s.close);

  if (stack.length === 0) return null;

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

          case "moveList":
            return (
              <MoveListModal
                key={i}
                list={entry.props.list}
                onClose={onClose}
              />
            );

          case "multiDeleteConfirm":
            return (
              <MultiDeleteConfirmModal
                key={i}
                {...entry.props}
                onClose={onClose}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
};
