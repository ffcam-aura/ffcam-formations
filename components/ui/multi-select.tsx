"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type MultiSelectOption = { value: string; label: string };

type MultiSelectProps = {
  id?: string;
  /** Nom accessible du champ (lu par les lecteurs d'écran). */
  label: string;
  /** Texte affiché quand rien n'est sélectionné. */
  placeholder: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  buttonClassName?: string;
  /** Contenu affiché à droite du bouton (ex. une info-bulle). */
  adornment?: React.ReactNode;
};

/**
 * Liste déroulante à choix multiples : un bouton qui ouvre une liste de cases à cocher.
 * Se ferme au clic extérieur et avec Échap.
 */
export function MultiSelect({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  className,
  buttonClassName,
  adornment,
}: MultiSelectProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const panelId = `${baseId}-options`;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue]
    );
  };

  const selectedLabels = options.filter(o => value.includes(o.value)).map(o => o.label);
  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${selectedLabels[0]} +${selectedLabels.length - 1}`;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      // Fermeture quand le focus part vers un autre élément (Tab, Maj+Tab).
      // relatedTarget null (mousedown sur le texte d'une option, clic dans le vide) :
      // on ne ferme pas, le clic extérieur est déjà géré par le listener mousedown.
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null;
        if (next && !containerRef.current?.contains(next)) setOpen(false);
      }}
    >
      <div className="flex items-center gap-2">
        <button
          ref={buttonRef}
          id={baseId}
          type="button"
          aria-label={selectedLabels.length ? `${label} : ${selectedLabels.join(", ")}` : label}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(o => !o)}
          className={cn(
            "flex w-full items-center justify-between gap-2 text-left",
            buttonClassName
          )}
        >
          <span className={cn("truncate", selectedLabels.length === 0 && "text-gray-500")}>
            {summary}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
          />
        </button>
        {adornment}
      </div>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={label}
          className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">Aucune option disponible</p>
          ) : (
            options.map(option => {
              const optionId = `${baseId}-${option.value}`;
              return (
                <label
                  key={option.value}
                  htmlFor={optionId}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <input
                    id={optionId}
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={() => toggle(option.value)}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })
          )}
          {value.length > 0 && (
            <div className="border-t px-3 pt-2 pb-1">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Tout désélectionner
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
