/**
 *
 * Code execution error mapping system
 * Centralizes error handling with user-friendly messages
 */

export interface ErrorMapping {
  code: string;
  pattern: string | RegExp;
  message: string;
  userFriendlyMessage: string;
  suggestions?: string[];
  category: "SYNTAX" | "RUNTIME" | "TIMEOUT" | "SECURITY" | "LOGIC" | "SYSTEM";
}

export const ERROR_MAPPINGS: ErrorMapping[] = [
  // ==================== SYNTAX ERRORS ====================
  {
    code: "SYNTAX_UNEXPECTED_TOKEN",
    pattern: /Unexpected token|Unexpected identifier|Unexpected end of input/i,
    message: "Error de sintaxis en el código",
    userFriendlyMessage:
      "Hay un error de sintaxis en tu código. Verifica paréntesis, llaves y punto y coma.",
    suggestions: [
      "Revisa que todas las llaves { } estén balanceadas",
      "Verifica los paréntesis ( ) en funciones y condicionales",
      "Asegúrate de usar punto y coma donde sea necesario",
    ],
    category: "SYNTAX",
  },
  {
    code: "SYNTAX_INVALID_LEFT_SIDE",
    pattern: /Invalid left-hand side|Invalid assignment target/i,
    message: "Asignación inválida",
    userFriendlyMessage:
      "Estás intentando asignar un valor a algo que no puede modificarse.",
    suggestions: [
      "Verifica que estés usando = correctamente",
      "No puedes asignar valores a constantes o expresiones",
    ],
    category: "SYNTAX",
  },
  {
    code: "SYNTAX_MISSING_PARENTHESIS",
    pattern: /Missing \)|Missing \(/i,
    message: "Falta un paréntesis",
    userFriendlyMessage: "Falta un paréntesis de apertura o cierre.",
    suggestions: ["Cuenta los paréntesis y asegúrate de que estén balanceados"],
    category: "SYNTAX",
  },

  // ==================== ENTRYPOINT ERRORS ====================
  {
    code: "ENTRYPOINT_NOT_FOUND",
    pattern: /Entrypoint not found/i,
    message: "Función de entrada no encontrada",
    userFriendlyMessage:
      "No encontramos la función esperada. Exporta la función con el nombre indicado en el reto.",
    suggestions: [
      "Exporta la función usando: export function nombreFuncion(...)",
      "En JavaScript: module.exports = { nombreFuncion }",
      "Verifica que el nombre de la función coincida exactamente",
    ],
    category: "LOGIC",
  },
  {
    code: "ENTRYPOINT_NOT_FUNCTION",
    pattern: /is not a function|Cannot read.*of undefined/i,
    message: "La función no está definida correctamente",
    userFriendlyMessage: "El código exportado no es una función válida.",
    suggestions: [
      "Asegúrate de exportar una función, no un objeto o variable",
      "Verifica la sintaxis: function nombreFuncion() { ... }",
    ],
    category: "LOGIC",
  },

  // ==================== SECURITY ERRORS ====================
  {
    code: "FORBIDDEN_API_FS",
    pattern: /Forbidden API|Blocked module.*fs/i,
    message: "API bloqueada: fs (sistema de archivos)",
    userFriendlyMessage:
      "El código intenta usar el módulo 'fs' que está bloqueado por seguridad.",
    suggestions: [
      "No uses require('fs') o import fs",
      "Resuelve el problema con lógica pura, sin acceso a archivos",
    ],
    category: "SECURITY",
  },
  {
    code: "FORBIDDEN_API_CHILD_PROCESS",
    pattern: /Blocked module.*child_process/i,
    message: "API bloqueada: child_process",
    userFriendlyMessage:
      "El código intenta ejecutar procesos externos, lo cual está bloqueado.",
    suggestions: [
      "No uses require('child_process')",
      "Resuelve el problema con lógica pura de JavaScript/TypeScript",
    ],
    category: "SECURITY",
  },
  {
    code: "FORBIDDEN_API_NETWORK",
    pattern: /Blocked module.*(http|https|net|dgram|dns)/i,
    message: "API bloqueada: módulos de red",
    userFriendlyMessage:
      "El código intenta usar módulos de red que están bloqueados.",
    suggestions: [
      "No uses módulos de red (http, https, net, etc.)",
      "Trabaja solo con los datos proporcionados en los tests",
    ],
    category: "SECURITY",
  },

  // ==================== TIMEOUT ERRORS ====================
  {
    code: "TEST_TIMEOUT",
    pattern: /Test timeout|timeout of.*exceeded/i,
    message: "Tiempo de ejecución excedido",
    userFriendlyMessage:
      "Una de las pruebas excedió el tiempo máximo permitido.",
    suggestions: [
      "Optimiza tu algoritmo para que sea más eficiente",
      "Evita bucles infinitos o recursión sin fin",
      "Considera usar estructuras de datos más eficientes (Map, Set)",
    ],
    category: "TIMEOUT",
  },
  {
    code: "GLOBAL_TIMEOUT",
    pattern: /execution.*timed out|overall timeout/i,
    message: "Timeout global excedido",
    userFriendlyMessage: "El código tardó demasiado en ejecutarse.",
    suggestions: [
      "Revisa la complejidad algorítmica de tu solución",
      "Busca optimizaciones (caché, memoización)",
    ],
    category: "TIMEOUT",
  },

  // ==================== RUNTIME ERRORS ====================
  {
    code: "REFERENCE_ERROR",
    pattern: /is not defined|ReferenceError/i,
    message: "Variable o función no definida",
    userFriendlyMessage: "Estás usando una variable o función que no existe.",
    suggestions: [
      "Verifica que hayas declarado todas las variables (let, const, var)",
      "Asegúrate de que los nombres estén escritos correctamente",
    ],
    category: "RUNTIME",
  },
  {
    code: "TYPE_ERROR",
    pattern:
      /TypeError|Cannot read property.*of null|Cannot read property.*of undefined/i,
    message: "Error de tipo",
    userFriendlyMessage:
      "Estás intentando acceder a una propiedad de un valor null o undefined.",
    suggestions: [
      "Verifica que el valor exista antes de usarlo",
      "Usa validaciones: if (valor) { ... }",
      "Considera usar optional chaining: objeto?.propiedad",
    ],
    category: "RUNTIME",
  },
  {
    code: "RANGE_ERROR",
    pattern: /RangeError|Maximum call stack size exceeded/i,
    message: "Error de rango / Stack overflow",
    userFriendlyMessage:
      "Desbordamiento de pila, probablemente por recursión infinita.",
    suggestions: [
      "Verifica que tu función recursiva tenga un caso base",
      "Asegúrate de que la recursión eventualmente termine",
      "Considera usar un enfoque iterativo en lugar de recursivo",
    ],
    category: "RUNTIME",
  },
  {
    code: "ASSERTION_ERROR",
    pattern: /AssertionError|Expected.*to equal|to deeply equal/i,
    message: "Error en la lógica del código",
    userFriendlyMessage:
      "El resultado de tu función no coincide con el esperado.",
    suggestions: [
      "Revisa la lógica de tu función paso a paso",
      "Usa console.log para verificar valores intermedios",
      "Lee cuidadosamente los requisitos del problema",
    ],
    category: "LOGIC",
  },

  // ==================== MEMORY ERRORS ====================
  {
    code: "OUT_OF_MEMORY",
    pattern: /FATAL ERROR.*memory|heap out of memory/i,
    message: "Memoria insuficiente",
    userFriendlyMessage: "El código consumió demasiada memoria.",
    suggestions: [
      "Evita crear estructuras de datos muy grandes",
      "Libera memoria cuando ya no necesites los datos",
      "Usa algoritmos más eficientes en memoria",
    ],
    category: "SYSTEM",
  },

  // ==================== GENERAL ERRORS ====================
  {
    code: "MODULE_NOT_FOUND",
    pattern: /Cannot find module|Module not found/i,
    message: "Módulo no encontrado",
    userFriendlyMessage: "Estás intentando importar un módulo que no existe.",
    suggestions: [
      "Solo puedes usar módulos nativos de Node.js permitidos",
      "No puedes instalar paquetes externos",
    ],
    category: "RUNTIME",
  },
];

/**
 * Finds the most appropriate error mapping
 */
export function findErrorMapping(
  errorMessage: string | undefined,
): ErrorMapping | null {
  if (!errorMessage) return null;

  for (const mapping of ERROR_MAPPINGS) {
    if (typeof mapping.pattern === "string") {
      if (errorMessage.includes(mapping.pattern)) {
        return mapping;
      }
    } else {
      if (mapping.pattern.test(errorMessage)) {
        return mapping;
      }
    }
  }

  return null;
}

/**
 * Maps a raw error to a user-friendly format
 */
export function mapExecutionError(rawError: string | undefined) {
  if (!rawError) {
    return {
      code: "UNKNOWN_ERROR",
      message: "Error desconocido al ejecutar el código",
      userFriendlyMessage: "Ocurrió un error inesperado durante la ejecución.",
      category: "SYSTEM" as const,
      originalError: rawError,
    };
  }

  const mapping = findErrorMapping(rawError);

  if (mapping) {
    return {
      code: mapping.code,
      message: mapping.message,
      userFriendlyMessage: mapping.userFriendlyMessage,
      suggestions: mapping.suggestions,
      category: mapping.category,
      originalError: rawError,
    };
  }

  // Generic error if no mapping found
  return {
    code: "RUNNER_ERROR",
    message: rawError,
    userFriendlyMessage: "Error durante la ejecución del código.",
    category: "RUNTIME" as const,
    originalError: rawError,
  };
}
