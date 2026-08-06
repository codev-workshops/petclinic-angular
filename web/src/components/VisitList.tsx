import { useState } from "react";
import type { Visit } from "../api/types";

export interface VisitListProps {
  visits: Visit[];
  onEditVisit: (visit: Visit) => void;
  onDeleteVisit: (visit: Visit) => Promise<unknown>;
  onError?: (message: string) => void;
}

export function VisitList({
  visits,
  onEditVisit,
  onDeleteVisit,
  onError,
}: VisitListProps) {
  const [deleted, setDeleted] = useState<Set<number>>(new Set());
  const visible = visits.filter((visit) => !deleted.has(visit.id));
  const deleteVisit = async (visit: Visit) => {
    try {
      await onDeleteVisit(visit);
      setDeleted((current) => new Set(current).add(visit.id));
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
    }
  };
  return (
    <table
      hidden={deleted.size > 0 && visible.length === 0}
      className=" table table-condensed"
    >
      <thead>
        <tr>
          <th>Visit Date</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {visible.map((visit) => (
          <tr key={visit.id}>
            <td>{visit.date}</td>
            <td>{visit.description}</td>
            <td>
              <button
                className="btn btn-default"
                onClick={() => onEditVisit(visit)}
              >
                Edit Visit
              </button>
              <button
                className="btn btn-default"
                onClick={() => deleteVisit(visit)}
              >
                Delete Visit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
