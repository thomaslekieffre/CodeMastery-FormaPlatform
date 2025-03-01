"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Editor } from "@monaco-editor/react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  initial_code: string;
  language: string;
  category: string;
  created_at: string;
  created_by: string;
}

interface ExerciseTest {
  id: string;
  exercise_id: string;
  test_code: string;
}

interface TestResult {
  passed: boolean;
  message: string;
}

export default function ExercisePage() {
  const { exerciseId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [userCode, setUserCode] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const updatePreview = (code: string) => {
    const iframe = document.getElementById("preview") as HTMLIFrameElement;
    if (!iframe) return;

    if (exercise?.language === "html") {
      iframe.srcdoc = code;
    } else if (exercise?.language === "css") {
      iframe.srcdoc = `
        <style>${code}</style>
        <div id="preview-content">
          <h1>Titre</h1>
          <p>Paragraphe</p>
          <button>Bouton</button>
          <div class="box">Boîte</div>
        </div>
      `;
    }
  };

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error("Vous devez être connecté");
          router.push("/login");
          return;
        }

        // Récupération de l'exercice
        const { data: exercise, error } = await supabase
          .from("exercises")
          .select("*")
          .eq("id", exerciseId)
          .single();

        if (error) throw error;
        setExercise(exercise);
        setUserCode(exercise.initial_code);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger l'exercice");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId, router]);

  const runCode = async () => {
    if (!exercise) return;

    setRunning(true);
    setOutput([]);
    setTestResults([]);

    try {
      const supabase = createClient();

      // Récupération des tests
      const { data: tests, error: testsError } = await supabase
        .from("exercise_tests")
        .select("test_code")
        .eq("exercise_id", exerciseId)
        .single();

      if (testsError) throw testsError;

      // Préparation du code à exécuter
      let codeToRun = "";

      if (
        exercise.language === "javascript" ||
        exercise.language === "typescript"
      ) {
        // Pour JS/TS, on utilise un environnement isolé avec console et tests
        codeToRun = `
          let testResults = [];
          let consoleOutput = [];

          // Mock console
          const console = {
            log: (...args) => {
              consoleOutput.push({ type: 'log', data: args.map(arg => String(arg)).join(' ') });
            },
            error: (...args) => {
              consoleOutput.push({ type: 'error', data: args.map(arg => String(arg)).join(' ') });
            }
          };

          // Fonction de test
          function test(name, fn) {
            try {
              const result = fn();
              testResults.push({
                passed: Boolean(result),
                message: result === true ? \`✅ \${name}\` : \`❌ \${name} - Test échoué\`
              });
            } catch (error) {
              testResults.push({
                passed: false,
                message: \`❌ \${name} - \${error.message}\`
              });
            }
          }

          try {
            // Code de l'utilisateur
            ${userCode}

            // Tests
            ${tests.test_code}
          } catch (error) {
            consoleOutput.push({ type: 'error', data: \`Erreur: \${error.message}\` });
          }

          // Retourne les résultats
          ({ testResults, consoleOutput });
        `;
      } else if (exercise.language === "python") {
        // Pour Python, on adapte le format pour Pyodide
        codeToRun = `
import sys
from io import StringIO

# Capture de la sortie standard
old_stdout = sys.stdout
sys.stdout = mystdout = StringIO()

test_results = []
def test(name, fn):
    try:
        result = fn()
        test_results.append({
            'passed': bool(result),
            'message': f"✅ {name}" if result == True else f"❌ {name} - Test échoué"
        })
    except Exception as e:
        test_results.append({
            'passed': False,
            'message': f"❌ {name} - {str(e)}"
        })

try:
    # Code de l'utilisateur
    ${userCode}
    
    # Tests
    ${tests.test_code}
except Exception as e:
    print(f"Erreur: {str(e)}")

# Récupération de la sortie standard
console_output = mystdout.getvalue()
sys.stdout = old_stdout

# Retourne les résultats
{'testResults': test_results, 'consoleOutput': console_output}
        `;
      }

      // Envoi du code au serveur pour exécution
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            (
              await supabase.auth.getSession()
            ).data.session?.access_token
          }`,
        },
        body: JSON.stringify({
          code: codeToRun,
          language: exercise.language,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'exécution du code");
      }

      const { output: executionOutput, testResults } = await response.json();
      setOutput(executionOutput);
      setTestResults(testResults || []);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'exécution du code");
      setOutput(["❌ Erreur lors de l'exécution du code"]);
    } finally {
      setRunning(false);
    }
  };

  const getLanguageLabel = (language: string) => {
    const labels: Record<string, string> = {
      javascript: "JavaScript",
      typescript: "TypeScript",
      python: "Python",
      html: "HTML",
      css: "CSS",
    };
    return labels[language] || language;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      basics: "Les bases",
      functions: "Fonctions",
      arrays: "Tableaux",
      objects: "Objets",
      async: "Asynchrone",
      dom: "DOM",
      api: "API",
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <Container>
        <SectionWrapper>
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        </SectionWrapper>
      </Container>
    );
  }

  if (!exercise) {
    return (
      <Container>
        <SectionWrapper>
          <div className="text-center py-10">
            <Heading as="h1" size="h1" className="mb-4">
              Exercice non trouvé
            </Heading>
            <Button onClick={() => router.push("/dashboard/exercises")}>
              Retour aux exercices
            </Button>
          </div>
        </SectionWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/exercises">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <Heading as="h1" size="h1">
                  {exercise.title}
                </Heading>
                <Badge variant="outline">
                  {getLanguageLabel(exercise.language)}
                </Badge>
                <Badge variant="outline">
                  {getCategoryLabel(exercise.category)}
                </Badge>
              </div>
              <Paragraph className="text-muted-foreground">
                {exercise.description}
              </Paragraph>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-card/50 border-violet-500/20">
              <CardHeader>
                <h3 className="text-lg font-semibold">Instructions</h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {exercise.instructions}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-card/50 border-violet-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Code</h3>
                    <Button onClick={runCode} disabled={running}>
                      {running ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                          Exécution...
                        </>
                      ) : (
                        "Exécuter"
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Editor
                      height="300px"
                      defaultLanguage={exercise.language}
                      language={exercise.language}
                      value={userCode}
                      onChange={(value) => {
                        setUserCode(value || "");
                        if (
                          exercise.language === "html" ||
                          exercise.language === "css"
                        ) {
                          updatePreview(value || "");
                        }
                      }}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {exercise.language === "html" || exercise.language === "css" ? (
                <Card className="bg-card/50 border-violet-500/20">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Aperçu</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md bg-white">
                      <iframe
                        id="preview"
                        title="Aperçu"
                        className="w-full h-[300px]"
                        srcDoc={
                          exercise.language === "html"
                            ? userCode
                            : `
                              <style>${userCode}</style>
                              <div id="preview-content">
                                <h1>Titre</h1>
                                <p>Paragraphe</p>
                                <button>Bouton</button>
                                <div class="box">Boîte</div>
                              </div>
                            `
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card/50 border-violet-500/20">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Console & Tests</h3>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] rounded-md border bg-black/90 p-4">
                      <div className="font-mono text-sm text-white space-y-1">
                        {output.map((line, index) => (
                          <div key={`output-${index}`} className="py-1">
                            {line}
                          </div>
                        ))}
                        {testResults.length > 0 && (
                          <>
                            <div className="py-2 border-t border-white/20 mt-2">
                              Résultats des tests :
                            </div>
                            {testResults.map((result, index) => (
                              <div
                                key={`test-${index}`}
                                className={`py-1 ${
                                  result.passed
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {result.message}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SectionWrapper>
    </Container>
  );
}
