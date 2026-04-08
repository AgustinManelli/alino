"use client";

import { Dropdown } from "@/components/ui/Dropdown";
import { ROLE_LABELS } from "../member-row";

interface RoleDropdownProps {
  currentRole: string;
  availableRoles: string[];
  onChange: (newRole: "admin" | "editor" | "reader") => void;
  disabled?: boolean;
}

export const RoleDropdown = ({
  currentRole,
  availableRoles,
  onChange,
  disabled,
}: RoleDropdownProps) => {
  return (
    <Dropdown>
      <Dropdown.Trigger disabled={disabled} chevron>
        {ROLE_LABELS[currentRole] || currentRole}
      </Dropdown.Trigger>
      <Dropdown.Content>
        {availableRoles.map((role) => (
          <Dropdown.Item
            key={role}
            onClick={() => onChange(role as any)}
            isActive={currentRole === role}
          >
            {ROLE_LABELS[role] || role}
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown>
  );
};
