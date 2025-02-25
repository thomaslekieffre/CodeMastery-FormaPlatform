import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div
      className={`bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2 ${
        className || ""
      }`}
    >
      <AlertCircle className="h-4 w-4" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
