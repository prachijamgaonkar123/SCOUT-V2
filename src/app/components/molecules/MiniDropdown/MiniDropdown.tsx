// // MiniDropdown/MiniDropdown.tsx
// "use client";

// import { useEffect, useRef, type FC } from "react";
// import styles from "../AlertPopup/RecentEventPopup.module.css";
// import { ChevronDownIcon } from "./Icons";

// interface MiniDropdownProps {
//   label: string;
//   options: string[];
//   value: string;
//   /** Controlled open state — lifted to the parent so only one dropdown across the whole list can be open at once. */
//   isOpen: boolean;
//   onOpenChange: (isOpen: boolean) => void;
//   onChange: (value: string) => void;
// }

// const MiniDropdown: FC<MiniDropdownProps> = ({
//   label,
//   options,
//   value,
//   isOpen,
//   onOpenChange,
//   onChange,
// }) => {
//   const rootRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!isOpen) return;
//     function handleClickOutside(event: MouseEvent): void {
//       if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
//         onOpenChange(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isOpen, onOpenChange]);

//   return (
//     <div
//       ref={rootRef}
//       className={`${styles.miniDropdown} ${isOpen ? styles.miniDropdownOpen : ""}`}
//     >
//       <button
//         type="button"
//         className={styles.miniDropdownTrigger}
//         onClick={(event) => {
//           event.stopPropagation();
//           onOpenChange(!isOpen);
//         }}
//         aria-haspopup="listbox"
//         aria-expanded={isOpen}
//         aria-label={label}
//       >
//         <span>{value}</span>
//         <ChevronDownIcon
//           className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
//         />
//       </button>
//       <div className={styles.miniDropdownList} role="listbox">
//         {options.map((option) => (
//           <div
//             key={option}
//             role="option"
//             aria-selected={option === value}
//             className={styles.miniDropdownItem}
//             onClick={(event) => {
//               event.stopPropagation();
//               onChange(option);
//               onOpenChange(false);
//             }}
//           >
//             {option}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MiniDropdown;

"use client";

import { useEffect, useRef, type FC } from "react";
import styles from "../AlertPopup/RecentEventPopup.module.css";
import { ChevronDownIcon } from "./Icons";

interface MiniDropdownProps {
  label: string;
  options?: string[];
  value: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onChange: (value: string) => void;
}

const MiniDropdown: FC<MiniDropdownProps> = ({
  label,
  options = [],
  value,
  isOpen,
  onOpenChange,
  onChange,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div
      ref={rootRef}
      className={`${styles.miniDropdown} ${
        isOpen ? styles.miniDropdownOpen : ""
      }`}
    >
      <button
        type="button"
        className={styles.miniDropdownTrigger}
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!isOpen);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
      >
        <span>{value}</span>

        <ChevronDownIcon
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
      </button>

      <div className={styles.miniDropdownList} role="listbox">
        {options.map((option) => (
          <div
            key={option}
            role="option"
            aria-selected={option === value}
            className={styles.miniDropdownItem}
            onClick={(event) => {
              event.stopPropagation();

              onChange(option);
              onOpenChange(false);
            }}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniDropdown;
