import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { formatPermission } from "@/utills/joinPermission";
import { cn } from "@/lib/utils";

interface PermissionMultiSelectProps {
  allPermissions: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  variant?: "violet" | "emerald" | "red";
}

const variantStyles = {
  violet: {
    pill: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    check: "text-violet-400",
    trigger: "focus:border-violet-500 focus:ring-violet-500/20",
  },
  emerald: {
    pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    check: "text-emerald-400",
    trigger: "focus:border-emerald-500 focus:ring-emerald-500/20",
  },
  red: {
    pill: "bg-red-500/10 text-red-300 border-red-500/20",
    check: "text-red-400",
    trigger: "focus:border-red-500 focus:ring-red-500/20",
  },
};

export function PermissionMultiSelect({
  allPermissions,
  selected,
  onChange,
  placeholder = "Select permissions…",
  variant = "violet",
}: PermissionMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const styles = variantStyles[variant];

  function toggle(p: string) {
    onChange(
      selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p]
    );
  }

  function remove(e: React.MouseEvent, p: string) {
    e.stopPropagation();
    onChange(selected.filter((x) => x !== p));
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm hover:border-white/20 outline-none focus:ring-2 transition-all",
            styles.trigger
          )}
        >
          <span className={selected.length ? "text-white" : "text-slate-500"}>
            {selected.length
              ? `${selected.length} permission${selected.length > 1 ? "s" : ""} selected`
              : placeholder}
          </span>
          <ChevronDown
            size={15}
            className={cn(
              "text-slate-400 transition-transform shrink-0",
              open && "rotate-180"
            )}
          />
        </PopoverTrigger>

        <PopoverContent
          className="p-0 w-[var(--anchor-width)] bg-[#0f0f13] border border-white/10 rounded-xl shadow-2xl"
          align="start"
          sideOffset={6}
        >
          <Command className="bg-transparent rounded-xl">
            <CommandInput
              placeholder="Search permissions…"
              className="text-white placeholder:text-slate-500 bg-transparent"
            />
            <CommandList className="max-h-52">
              <CommandEmpty className="text-slate-500 text-xs py-4">
                No permissions found
              </CommandEmpty>
              <CommandGroup>
                {allPermissions.map((p) => {
                  const checked = selected.includes(p);
                  return (
                    <CommandItem
                      key={p}
                      value={p}
                      onSelect={() => toggle(p)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-slate-300 data-selected:bg-white/8 data-selected:text-white aria-selected:bg-white/8"
                      data-checked={checked}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                          checked
                            ? variant === "violet"
                              ? "bg-violet-600 border-violet-600"
                              : variant === "emerald"
                              ? "bg-emerald-600 border-emerald-600"
                              : "bg-red-600 border-red-600"
                            : "border-white/20 bg-transparent"
                        )}
                      >
                        {checked && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-sm">{formatPermission(p)}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((p) => (
            <span
              key={p}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border",
                styles.pill
              )}
            >
              {formatPermission(p)}
              <button
                type="button"
                onClick={(e) => remove(e, p)}
                className="hover:text-white transition-colors ml-0.5"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
