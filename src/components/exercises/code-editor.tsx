"use client";

import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
}

export function CodeEditor({
  code,
  language,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const { theme } = useTheme();

  return (
    <Editor
      height="400px"
      language={language}
      value={code}
      theme={theme === "dark" ? "vs-dark" : "light"}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        readOnly,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        automaticLayout: true,
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
      }}
      loading={
        <div className="h-[400px] w-full flex items-center justify-center bg-background text-muted-foreground">
          Chargement de l'éditeur...
        </div>
      }
    />
  );
}
