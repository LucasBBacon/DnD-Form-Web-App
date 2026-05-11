import "./CostPips.css"
import type React from "react";

interface CostPipsProps {
  remaining: number;
  total: number;
}

export const CostPips: React.FC<CostPipsProps> = ({ remaining, total }) => {
  const normalizedTotal = Math.max(total, 1);
  return (
    <>
      {Array.from({ length: normalizedTotal }).map((_, index) => (
        <span
          key={`pip-${index}`}
          className={`cost-pip ${index < remaining ? "filled" : "empty"}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
};
