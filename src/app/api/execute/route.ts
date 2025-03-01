import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface TestResult {
  passed: boolean;
  message: string;
}

export async function POST(request: Request) {
  try {
    // Vérification de l'authentification
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (!user || authError) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupération du code à exécuter
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code et langage requis" },
        { status: 400 }
      );
    }

    // Exécution du code dans un worker isolé
    let output: string[] = [];
    let testResults: TestResult[] = [];

    if (language === "javascript" || language === "typescript") {
      // Exécution de JS/TS dans un worker
      const result = await executeJavaScript(code);
      output = result.consoleOutput.map((log) =>
        log.type === "error" ? `❌ ${log.data}` : log.data
      );
      testResults = result.testResults;
    } else if (language === "python") {
      // Exécution de Python via l'API Pyodide
      const result = await executePython(code);
      output = result.consoleOutput.split("\n").filter(Boolean);
      testResults = result.testResults;
    }

    return NextResponse.json({ output, testResults });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'exécution du code" },
      { status: 500 }
    );
  }
}

async function executeJavaScript(code: string): Promise<{
  consoleOutput: Array<{ type: string; data: string }>;
  testResults: Array<{ passed: boolean; message: string }>;
}> {
  return new Promise((resolve, reject) => {
    try {
      // Création d'un worker pour exécuter le code en isolation
      const workerCode = `
        let consoleOutput = [];
        let testResults = [];

        self.console = {
          log: function(...args) {
            consoleOutput.push({ type: 'log', data: args.map(arg => String(arg)).join(' ') });
          },
          error: function(...args) {
            consoleOutput.push({ type: 'error', data: args.map(arg => String(arg)).join(' ') });
          }
        };

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
          ${code}
        } catch (error) {
          consoleOutput.push({ type: 'error', data: error.message });
        }

        self.postMessage({ consoleOutput, testResults });
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob));

      worker.onmessage = (e) => {
        worker.terminate();
        resolve(e.data);
      };

      worker.onerror = (error) => {
        worker.terminate();
        resolve({
          consoleOutput: [{ type: "error", data: error.message }],
          testResults: [],
        });
      };

      // Timeout de 5 secondes
      setTimeout(() => {
        worker.terminate();
        resolve({
          consoleOutput: [
            {
              type: "error",
              data: "Timeout - L'exécution a pris trop de temps",
            },
          ],
          testResults: [],
        });
      }, 5000);
    } catch (error) {
      reject(error);
    }
  });
}

async function executePython(code: string): Promise<{
  consoleOutput: string;
  testResults: Array<{ passed: boolean; message: string }>;
}> {
  try {
    // Utilisation de l'API Pyodide
    const response = await fetch("https://pyodide-api.vercel.app/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'exécution du code Python");
    }

    const { output, error, testResults } = await response.json();

    return {
      consoleOutput: error || output,
      testResults: testResults || [],
    };
  } catch (error) {
    return {
      consoleOutput: `Erreur: ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`,
      testResults: [],
    };
  }
}
