import { Badge } from "@/components/ui/badge";

const topics = [
  { name: "React", count: 145 },
  { name: "Next.js", count: 89 },
  { name: "TypeScript", count: 76 },
  { name: "Tailwind", count: 54 },
  { name: "Node.js", count: 43 },
  { name: "Supabase", count: 32 },
];

export function PopularTopics() {
  return (
    <div className="p-6 rounded-xl border bg-card">
      <h3 className="text-lg font-semibold mb-4">Sujets populaires</h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Badge
            key={topic.name}
            variant="outline"
            className="hover:bg-violet-500/10 cursor-pointer transition-colors"
          >
            {topic.name}
            <span className="ml-1 text-gray-400">({topic.count})</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
