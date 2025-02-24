import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

const contributors = [
  {
    name: "Alex Durand",
    avatar: "https://i.pravatar.cc/150?img=1",
    points: 1250,
    badge: "Expert",
  },
  {
    name: "Marie Chen",
    avatar: "https://i.pravatar.cc/150?img=2",
    points: 980,
    badge: "Mentor",
  },
  {
    name: "Thomas Martin",
    avatar: "https://i.pravatar.cc/150?img=3",
    points: 750,
    badge: "Actif",
  },
];

export function TopContributors() {
  return (
    <div className="p-6 rounded-xl border bg-card">
      <h3 className="text-lg font-semibold mb-4">Top Contributeurs</h3>
      <div className="space-y-4">
        {contributors.map((contributor, index) => (
          <div key={contributor.name} className="flex items-center gap-3">
            <div className="relative">
              <Avatar>
                <AvatarImage src={contributor.avatar} />
                <AvatarFallback>{contributor.name[0]}</AvatarFallback>
              </Avatar>
              {index === 0 && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                  <Trophy className="w-3 h-3 text-black" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">{contributor.name}</div>
              <div className="text-sm text-gray-400">{contributor.badge}</div>
            </div>
            <div className="text-sm text-violet-400">
              {contributor.points} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
