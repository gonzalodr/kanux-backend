-- =====================================================
-- SEED SCRIPT: Challenges Técnicos por Defecto
-- =====================================================
-- Este script inserta 5 retos técnicos de JavaScript/TypeScript
-- con su metadata correspondiente en la base de datos.
-- 
-- Fecha de creación: 2026-01-23
-- Autor: Sistema KANUX
-- =====================================================

-- Nota: Asegúrate de tener las extensiones necesarias
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

-- =====================================================
-- 1. SUMA DE DOS NÚMEROS (JavaScript - Easy)
-- =====================================================
INSERT INTO challenges (
    id,
    title,
    description,
    challenge_type,
    difficulty,
    duration_minutes,
    created_by_company,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Suma de Dos Números',
    'Escribe una función que tome dos números como parámetros y retorne su suma.

**Ejemplo:**
```javascript
sumar(5, 3) // retorna 8
sumar(-2, 7) // retorna 5
sumar(0, 0) // retorna 0
```',
    'Técnico',
    'Básico',
    10,
    NULL, -- Challenge de sistema, no pertenece a ninguna compañía
    NOW()
);

INSERT INTO technical_challenge_metadata (
    id,
    challenge_id,
    source,
    evaluation_type
) VALUES (
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440001',
    'KANUX_JSON',
    'simulated'
);

-- =====================================================
-- 2. INVERTIR UNA CADENA (JavaScript - Easy)
-- =====================================================
INSERT INTO challenges (
    id,
    title,
    description,
    challenge_type,
    difficulty,
    duration_minutes,
    created_by_company,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'Invertir una Cadena',
    'Escribe una función que tome una cadena de texto y la retorne invertida.

**Ejemplo:**
```javascript
invertirCadena(''hola'') // retorna ''aloh''
invertirCadena(''JavaScript'') // retorna ''tpircSavaJ''
invertirCadena(''12345'') // retorna ''54321''
```',
    'Técnico',
    'Básico',
    15,
    NULL,
    NOW()
);

INSERT INTO technical_challenge_metadata (
    id,
    challenge_id,
    source,
    evaluation_type
) VALUES (
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440002',
    'KANUX_JSON',
    'simulated'
);

-- =====================================================
-- 3. VERIFICADOR DE PALÍNDROMOS (TypeScript - Medium)
-- =====================================================
INSERT INTO challenges (
    id,
    title,
    description,
    challenge_type,
    difficulty,
    duration_minutes,
    created_by_company,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'Verificador de Palíndromos',
    'Escribe una función que determine si una cadena es un palíndromo (se lee igual de izquierda a derecha que de derecha a izquierda).

**Ejemplo:**
```typescript
esPalindromo(''ana'') // retorna true
esPalindromo(''hola'') // retorna false
esPalindromo(''A man a plan a canal Panama'') // retorna true (ignorando espacios y mayúsculas)
```',
    'Técnico',
    'Intermedio',
    20,
    NULL,
    NOW()
);

INSERT INTO technical_challenge_metadata (
    id,
    challenge_id,
    source,
    evaluation_type
) VALUES (
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440003',
    'KANUX_JSON',
    'simulated'
);

-- =====================================================
-- 4. SECUENCIA DE FIBONACCI (TypeScript - Medium)
-- =====================================================
INSERT INTO challenges (
    id,
    title,
    description,
    challenge_type,
    difficulty,
    duration_minutes,
    created_by_company,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    'Secuencia de Fibonacci',
    'Escribe una función que retorne el n-ésimo número de la secuencia de Fibonacci. La secuencia comienza con 0, 1, y cada número siguiente es la suma de los dos anteriores.

**Ejemplo:**
```typescript
fibonacci(0) // retorna 0
fibonacci(1) // retorna 1
fibonacci(5) // retorna 5
fibonacci(10) // retorna 55
```

**Secuencia:** 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55...',
    'Técnico',
    'Intermedio',
    25,
    NULL,
    NOW()
);

INSERT INTO technical_challenge_metadata (
    id,
    challenge_id,
    source,
    evaluation_type
) VALUES (
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440004',
    'KANUX_JSON',
    'simulated'
);

-- =====================================================
-- 5. ELIMINAR DUPLICADOS DE UN ARRAY (TypeScript - Easy)
-- =====================================================
INSERT INTO challenges (
    id,
    title,
    description,
    challenge_type,
    difficulty,
    duration_minutes,
    created_by_company,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440005',
    'Eliminar Duplicados de un Array',
    'Escribe una función que reciba un array de números y retorne un nuevo array sin elementos duplicados, manteniendo el orden de la primera aparición.

**Ejemplo:**
```typescript
eliminarDuplicados([1, 2, 2, 3, 4, 4, 5]) // retorna [1, 2, 3, 4, 5]
eliminarDuplicados([5, 5, 5, 5]) // retorna [5]
eliminarDuplicados([1, 2, 3]) // retorna [1, 2, 3]
```',
    'Técnico',
    'Básico',
    15,
    NULL,
    NOW()
);

INSERT INTO technical_challenge_metadata (
    id,
    challenge_id,
    source,
    evaluation_type
) VALUES (
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440005',
    'KANUX_JSON',
    'simulated'
);

COMMIT;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Consulta para verificar los retos insertados:
-- 
-- SELECT 
--     c.id,
--     c.title,
--     c.difficulty,
--     c.duration_minutes,
--     c.challenge_type,
--     tcm.source,
--     tcm.evaluation_type
-- FROM challenges c
-- INNER JOIN technical_challenge_metadata tcm ON c.id = tcm.challenge_id
-- WHERE c.id IN (
--     '550e8400-e29b-41d4-a716-446655440001',
--     '550e8400-e29b-41d4-a716-446655440002',
--     '550e8400-e29b-41d4-a716-446655440003',
--     '550e8400-e29b-41d4-a716-446655440004',
--     '550e8400-e29b-41d4-a716-446655440005'
-- )
-- ORDER BY c.created_at;
