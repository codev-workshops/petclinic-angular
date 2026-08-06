import { useNavigate } from "react-router-dom";
import { deleteVisit } from "../../api/visits";
import { VisitList } from "../../components";
import type { Visit } from "../../api/types";
export function Component() {
  const navigate = useNavigate();
  return (
    <VisitList
      visits={[]}
      onEditVisit={(visit) => navigate(`/visits/${visit.id}/edit`)}
      onDeleteVisit={(visit: Visit) => deleteVisit(visit.id)}
    />
  );
}
