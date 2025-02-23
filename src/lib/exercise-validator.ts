import type { ExerciseTest } from "@/types/database";

interface ValidationResult {
  passed: boolean;
  message: string;
  error?: string;
}

export async function validateExercise(
  code: string,
  tests: ExerciseTest[]
): Promise<ValidationResult[]> {
  // Créer un environnement sécurisé pour exécuter le code
  const createSafeEnvironment = (code: string) => {
    try {
      // Nettoyer le code des imports et requires
      const cleanCode = code.replace(
        /(import|require|process|global|__dirname|__filename)/g,
        "/* $1 */"
      );

      // Créer une fonction à partir du code
      return new Function(
        "test",
        `
        "use strict";
        const console = { log: () => {} };
        ${cleanCode}
        return test();
      `
      );
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Erreur de syntaxe dans le code"
      );
    }
  };

  // Exécuter les tests
  return Promise.all(
    tests.map(async (test): Promise<ValidationResult> => {
      try {
        const safeEnvironment = createSafeEnvironment(code);

        // Créer la fonction de test
        const testFunction = new Function(
          "code",
          `
          "use strict";
          try {
            ${test.test_code}
          } catch (error) {
            return { passed: false, error: error instanceof Error ? error.message : String(error) };
          }
          return { passed: true };
        `
        );

        // Exécuter le test avec un timeout
        const result = await Promise.race([
          new Promise((resolve) => {
            try {
              const testResult = testFunction(safeEnvironment);
              resolve(testResult);
            } catch (error) {
              resolve({
                passed: false,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }),
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ passed: false, error: "Timeout dépassé" }),
              5000
            )
          ),
        ]);

        return {
          passed: (result as any).passed,
          message: test.description,
          error: (result as any).error,
        };
      } catch (error) {
        return {
          passed: false,
          message: test.description,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    })
  );
}
