"use client";

import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  useEffect,
  memo,
} from "react";

import { ClientOnlyPortal } from "../ClientOnlyPortal";
import { ConfigCard } from "./ConfigCard/ConfigCard";
import { TriangleSafeZone } from "./TriangleSafeZone";
import { ConfigOption } from "./types";

import styles from "./SubMenuPanelOption.module.css";

interface SubMenuPanelProps {
  options: ConfigOption[];
  depth: number;
  onRootClose: () => void;
  debugTriangle: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
}

type Point = { x: number; y: number };

export const SubMenuPanel = memo(function SubMenuPanel({
  options,
  depth,
  onRootClose,
  debugTriangle,
  onEnter,
  onLeave,
}: SubMenuPanelProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [entryPoint, setEntryPoint] = useState<Point | null>(null);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setActiveIndex(null);
      setTriggerRect(null);
      setEntryPoint(null);
    }, 150);
  }, [cancelClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleItemEnter = useCallback(
    (
      index: number,
      option: ConfigOption,
      e: React.MouseEvent<HTMLDivElement>,
    ) => {
      cancelClose();

      if (option.children?.length) {
        const rect = (
          e.currentTarget as HTMLDivElement
        ).getBoundingClientRect();
        setActiveIndex(index);
        setTriggerRect(rect);
        setEntryPoint({ x: e.clientX, y: e.clientY });
      } else {
        setActiveIndex(null);
        setTriggerRect(null);
        setEntryPoint(null);
      }
    },
    [cancelClose],
  );

  const handleItemMove = useCallback(
    (index: number, e: React.MouseEvent<HTMLDivElement>) => {
      if (activeIndex === index) {
        setEntryPoint({ x: e.clientX, y: e.clientY });
      }
    },
    [activeIndex],
  );

  const handleItemLeave = useCallback(
    (option: ConfigOption) => {
      if (option.children?.length) {
        scheduleClose();
      }
    },
    [scheduleClose],
  );

  const visibleOptions = options.filter((opt) => opt.enabled !== false);
  const activeOption =
    activeIndex !== null ? visibleOptions[activeIndex] : null;

  return (
    <div
      className={styles.optionsContainer}
      onMouseEnter={() => {
        cancelClose();
        onEnter?.();
      }}
      onMouseLeave={onLeave}
    >
      {visibleOptions.map((option, index) => (
        <div
          key={`${option.name}-${index}-${depth}`}
          className={styles.itemWrapper}
          onMouseEnter={(e) => handleItemEnter(index, option, e)}
          onMouseMove={(e) => handleItemMove(index, e)}
          onMouseLeave={() => handleItemLeave(option)}
        >
          <ConfigCard
            name={option.name}
            icon={option.icon}
            variant={option.variant}
            action={
              option.action
                ? () => {
                    option.action?.();
                    onRootClose();
                  }
                : undefined
            }
            hasChildren={!!option.children?.length}
            isActive={activeIndex === index}
          />
        </div>
      ))}

      {activeOption?.children && triggerRect && entryPoint && (
        <ChildSubMenu
          key={`child-${depth}-${activeIndex}`}
          options={activeOption.children}
          triggerRect={triggerRect}
          entryPoint={entryPoint}
          depth={depth + 1}
          onRootClose={onRootClose}
          debugTriangle={debugTriangle}
          cancelParentClose={cancelClose}
          scheduleParentClose={scheduleClose}
        />
      )}
    </div>
  );
});

interface ChildSubMenuProps {
  options: ConfigOption[];
  triggerRect: DOMRect;
  entryPoint: Point;
  depth: number;
  onRootClose: () => void;
  debugTriangle: boolean;
  cancelParentClose: () => void;
  scheduleParentClose: () => void;
}

function ChildSubMenu({
  options,
  triggerRect,
  entryPoint,
  depth,
  onRootClose,
  debugTriangle,
  cancelParentClose,
  scheduleParentClose,
}: ChildSubMenuProps) {
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
  const [panelRect, setPanelRect] = useState<DOMRect | null>(null);
  const [opensRight, setOpensRight] = useState(true);

  useLayoutEffect(() => {
    if (!panelEl) return;

    const elW = panelEl.offsetWidth;
    const elH = panelEl.offsetHeight;

    let left = triggerRect.right + 6;
    let top = triggerRect.top;
    let willOpenRight = true;

    if (left + elW > window.innerWidth - 10) {
      left = triggerRect.left - elW - 6;
      willOpenRight = false;
    }

    if (top + elH > window.innerHeight - 10) {
      top = window.innerHeight - elH - 10;
    }

    if (top < 10) top = 10;

    panelEl.style.left = `${left}px`;
    panelEl.style.top = `${top}px`;
    panelEl.style.visibility = "visible";

    setOpensRight(willOpenRight);
    setPanelRect(panelEl.getBoundingClientRect());
  }, [triggerRect, panelEl]);

  return (
    <ClientOnlyPortal>
      {panelRect && (
        <TriangleSafeZone
          entryPoint={entryPoint}
          submenuRect={panelRect}
          opensRight={opensRight}
          onMouseEnter={cancelParentClose}
          onMouseLeave={scheduleParentClose}
          debug={debugTriangle}
          zIndex={502 + depth}
        />
      )}

      <div
        ref={setPanelEl}
        className={`${styles.childPanel} config-menu-portal`}
        style={{
          position: "fixed",
          visibility: "hidden",
          zIndex: 502 + depth,
        }}
        onMouseEnter={cancelParentClose}
        onMouseLeave={scheduleParentClose}
        onClick={(e) => e.stopPropagation()}
      >
        <SubMenuPanel
          options={options}
          depth={depth}
          onRootClose={onRootClose}
          debugTriangle={debugTriangle}
          onEnter={cancelParentClose}
          onLeave={scheduleParentClose}
        />
      </div>
    </ClientOnlyPortal>
  );
}
