"use client";

import React from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  SoundUsage,
  getSoundsByUsage,
  getSoundById,
  playSound,
} from "@/lib/sounds/soundCatalog";
import { SoundIcon, PlayIcon } from "@/components/ui/icons/icons";
import styles from "./SoundDropdown.module.css";

interface SoundDropdownProps {
  usage: SoundUsage;
  value: string;
  onChange: (soundId: string) => void;
  disabled?: boolean;
  className?: string;
  previewOnSelect?: boolean;
}

export const SoundDropdown: React.FC<SoundDropdownProps> = ({
  usage,
  value,
  onChange,
  disabled = false,
  className,
  previewOnSelect = true,
}) => {
  const sounds = getSoundsByUsage(usage);
  const currentSound = getSoundById(value) || sounds[0];

  const handleSelect = (soundId: string) => {
    onChange(soundId);
    if (previewOnSelect) {
      playSound(soundId);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent, soundId: string) => {
    e.stopPropagation();
    playSound(soundId);
  };

  return (
    <div className={`${styles.soundDropdownWrapper} ${className || ""}`}>
      <Dropdown>
        <Dropdown.Trigger
          disabled={disabled}
          chevron
          className={styles.triggerBtn}
        >
          <span className={styles.triggerContent}>
            <SoundIcon className={styles.soundIcon} />
            <span className={styles.selectedName}>
              {currentSound?.name || "Seleccionar"}
            </span>
          </span>
        </Dropdown.Trigger>
        <Dropdown.Content className={styles.dropdownContent}>
          {sounds.map((sound) => {
            const isActive = sound.id === value;
            return (
              <Dropdown.Item
                key={sound.id}
                isActive={isActive}
                onClick={() => handleSelect(sound.id)}
                className={styles.dropdownItem}
              >
                <div className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <span className={styles.soundName}>{sound.name}</span>
                    {sound.description && (
                      <span className={styles.soundDesc}>
                        {sound.description}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.previewBtn}
                    onClick={(e) => handlePreviewClick(e, sound.id)}
                    title="Escuchar vista previa"
                  >
                    <PlayIcon className={styles.playIcon} />
                  </button>
                </div>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
};
