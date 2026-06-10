import { createFileRoute } from "@tanstack/react-router";
import GrillesSST from "@/components/GrillesSST";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Grilles SST" },
      { name: "description", content: "Grilles d'évaluation SST — saisie et suivi des stagiaires." },
      { property: "og:title", content: "Grilles SST" },
      { property: "og:description", content: "Grilles d'évaluation SST — saisie et suivi des stagiaires." },
    ],
  }),
  component: Index,
});

function Index() {
  return <GrillesSST />;
}
