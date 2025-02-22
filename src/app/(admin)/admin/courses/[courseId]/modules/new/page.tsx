"use client";

import { useParams } from "next/navigation";
import { ModuleForm } from "@/components/courses/module-form";

export default function NewModulePage() {
  const { courseId } = useParams();
  return <ModuleForm courseId={courseId as string} mode="create" />;
}
