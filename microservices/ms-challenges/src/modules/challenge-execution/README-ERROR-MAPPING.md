# Error Mapping System - Challenge Execution

## 📋 Description

This module provides a centralized and scalable system for mapping code execution errors to user-friendly messages.

## 🎯 Features

- ✅ **User-friendly messages**: Translates technical errors to understandable language
- ✅ **Suggestions**: Provides tips to resolve each error type
- ✅ **Categorization**: Groups errors by type (SYNTAX, RUNTIME, SECURITY, etc.)
- ✅ **Extensible**: Easy to add new error mappings
- ✅ **Pattern matching**: Uses RegExp or strings to detect errors

## 📂 Structure

```
challenge-execution/
├── error-mapper.ts          # Error mapping system
├── execution.controller.ts  # Uses the mapper
└── execution.service.ts
```

## 🔧 Usage

### In the Controller

```typescript
import { mapExecutionError } from "./error-mapper";

const errorInfo = mapExecutionError(rawError);

res.status(400).json({
  message: errorInfo.userFriendlyMessage,
  error: {
    code: errorInfo.code,
    category: errorInfo.category,
    suggestions: errorInfo.suggestions,
  },
});
```

### Error Response (Example)

```json
{
  "success": false,
  "message": "We could not find the expected function. Export the function with the name specified in the challenge.",
  "error": {
    "code": "ENTRYPOINT_NOT_FOUND",
    "category": "LOGIC",
    "suggestions": [
      "Export the function using: export function functionName(...)",
      "In JavaScript: module.exports = { functionName }",
      "Verify that the function name matches exactly"
    ],
    "originalError": "Entrypoint not found: sumaDosNumeros"
  }
}
```

## ➕ How to Add New Errors

### 1. Open `error-mapper.ts`

### 2. Add the mapping to `ERROR_MAPPINGS`:

```typescript
{
    code: "YOUR_ERROR_CODE",
    pattern: /regex to detect the error/i,  // or string
    message: "Short technical message",
    userFriendlyMessage: "User-friendly message",
    suggestions: [
        "Suggestion 1",
        "Suggestion 2"
    ],
    category: "RUNTIME"  // SYNTAX | RUNTIME | TIMEOUT | SECURITY | LOGIC | SYSTEM
}
```

### 3. Real Example:

```typescript
{
    code: "INFINITE_LOOP",
    pattern: /Maximum call stack|stack overflow/i,
    message: "Infinite loop detected",
    userFriendlyMessage: "Your code has an infinite loop or endless recursion.",
    suggestions: [
        "Check that your loops have an exit condition",
        "In recursion, ensure you have a base case",
        "Print intermediate values for debugging"
    ],
    category: "RUNTIME"
}
```

## 📊 Error Categories

| Category   | Description             | Examples                               |
| ---------- | ----------------------- | -------------------------------------- |
| `SYNTAX`   | Syntax errors           | Missing parentheses, unexpected tokens |
| `RUNTIME`  | Errors during execution | TypeError, ReferenceError              |
| `TIMEOUT`  | Execution time exceeded | Test timeout, global timeout           |
| `SECURITY` | Blocked APIs            | fs, child_process, http                |
| `LOGIC`    | Logic errors            | Function not found, assertions         |
| `SYSTEM`   | System errors           | Out of memory                          |

## 🎨 Mapped Error Examples

### Syntax Error

```javascript
// Code with error
function sum(a, b {
    return a + b;
}

// Response:
{
    "code": "SYNTAX_MISSING_PARENTHESIS",
    "message": "Missing opening or closing parenthesis.",
    "suggestions": ["Count the parentheses and ensure they are balanced"]
}
```

### Security Error

```javascript
// Code with error
const fs = require('fs');
fs.readFileSync('file.txt');

// Response:
{
    "code": "FORBIDDEN_API_FS",
    "message": "The code attempts to use the 'fs' module which is blocked for security.",
    "suggestions": [
        "Do not use require('fs') or import fs",
        "Solve the problem with pure logic, without file access"
    ]
}
```

### Timeout Error

```javascript
// Code with error
function factorial(n) {
    return n * factorial(n - 1); // No base case!
}

// Response:
{
    "code": "RANGE_ERROR",
    "message": "Stack overflow, likely caused by infinite recursion.",
    "suggestions": [
        "Verify that your recursive function has a base case",
        "Ensure that recursion eventually terminates"
    ]
}
```

## 🔍 Error Testing

To test a new mapping:

1. Run code with the error you want to map
2. Observe the `originalError` in the response
3. Adjust the `pattern` in `error-mapper.ts` to detect the error
4. Verify that the message and suggestions are helpful
