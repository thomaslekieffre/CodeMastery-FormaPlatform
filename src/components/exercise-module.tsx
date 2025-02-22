"use client";

import { useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play } from "lucide-react";

interface ExerciseModuleProps {
  content: string;
  initialCode?: string;
  language?: string;
  tests?: string[];
}

export function ExerciseModule({
  content,
  initialCode = "",
  language = "javascript",
  tests = [],
}: ExerciseModuleProps) {
  const [code, setCode] = useState(initialCode);
  const [testResults, setTestResults] = useState<
    Array<{ passed: boolean; message: string }>
  >([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    try {
      // Pour l'instant, on simule juste les tests
      const results = tests.map((test) => ({
        passed: Math.random() > 0.5,
        message: test,
      }));
      setTestResults(results);
    } catch (error) {
      console.error("Erreur lors de l'exécution des tests:", error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions de l'exercice */}
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Éditeur de code */}
      <div className="rounded-lg border bg-card">
        <CodeEditor
          value={code}
          language={language}
          placeholder="Écrivez votre code ici..."
          onChange={(e) => setCode(e.target.value)}
          padding={15}
          style={{
            fontSize: 14,
            backgroundColor: "transparent",
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
          className="min-h-[200px] w-full"
        />
      </div>

      {/* Bouton pour exécuter les tests */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={runTests}
          disabled={isRunning}
          className="inline-flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Exécuter les tests
        </Button>
      </div>

      {/* Résultats des tests */}
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Résultats des tests</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${
                  result.passed
                    ? "border-green-500/20 bg-green-500/10"
                    : "border-red-500/20 bg-red-500/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-5 w-5 ${
                      result.passed ? "text-green-500" : "text-red-500"
                    }`}
                  />
                  <span
                    className={
                      result.passed ? "text-green-500" : "text-red-500"
                    }
                  >
                    {result.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
