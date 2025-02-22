"use client";

import Link from "next/link";
import { CheckCircle, Circle, PlayCircle, FileText, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module } from "@/types/database";

interface ModuleListProps {
  modules: Module[];
  completedModules?: string[];
  currentModuleId?: string;
}

const moduleTypeIcons = {
  video: PlayCircle,
  article: FileText,
  exercise: Code,
};

export function ModuleList({
  modules,
  completedModules = [],
  currentModuleId,
}: ModuleListProps) {
  return (
    <div className="space-y-1">
      {modules.map((module) => {
        const Icon = moduleTypeIcons[module.type];
        const isCompleted = completedModules.includes(module.id);
        const isCurrent = module.id === currentModuleId;

        return (
          <Link
            key={module.id}
            href={`/courses/modules/${module.id}`}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-accent",
              isCurrent && "border-primary bg-accent",
              !isCurrent && "hover:border-primary"
            )}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="font-medium leading-none">{module.title}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                  {module.description}
                </p>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
