# Challenges Técnicos por Defecto 🚀

Este directorio contiene los retos técnicos por defecto de la plataforma KANUX. Estos challenges están disponibles para todas las compañías y sirven como base de evaluación técnica.

## 📁 Estructura

```
default-challenges/
├── javascript/
│   ├── 001-sum-two-numbers/
│   │   ├── challenge.json       # Metadata del reto
│   │   └── test-cases.json      # Casos de prueba
│   └── 002-reverse-string/
│       ├── challenge.json
│       └── test-cases.json
├── typescript/
│   ├── 003-palindrome-checker/
│   │   ├── challenge.json
│   │   └── test-cases.json
│   ├── 004-fibonacci/
│   │   ├── challenge.json
│   │   └── test-cases.json
│   └── 005-array-duplicates/
│       ├── challenge.json
│       └── test-cases.json
├── seed.sql                     # Script SQL para insertar en BD
└── README.md                    # Este archivo
```

## 🎯 Challenges Disponibles

### JavaScript

1. **001 - Suma de Dos Números** (Easy - 10 min)
   - Función básica de suma
   - Ideal para principiantes
   - 5 casos de prueba

2. **002 - Invertir una Cadena** (Easy - 15 min)
   - Manipulación de strings
   - Uso de métodos de array
   - 5 casos de prueba

### TypeScript

3. **003 - Verificador de Palíndromos** (Medium - 20 min)
   - Validación de strings
   - Manejo de casos edge
   - 6 casos de prueba

4. **004 - Secuencia de Fibonacci** (Medium - 25 min)
   - Algoritmo matemático
   - Optimización de rendimiento
   - 6 casos de prueba

5. **005 - Eliminar Duplicados de un Array** (Easy - 15 min)
   - Estructuras de datos (Set)
   - Manipulación de arrays
   - 6 casos de prueba

## 🗄️ Instalación en Base de Datos

Para insertar estos challenges en la base de datos, ejecuta:

```bash
# Desde PostgreSQL
psql -U usuario -d nombre_base_datos -f seed.sql

# O usando el cliente de tu preferencia
cat seed.sql | psql <connection_string>
```

## 📄 Formato de Archivos

### challenge.json

```json
{
  "id": "uuid",
  "title": "Título del reto",
  "description": "Descripción en Markdown",
  "challenge_type": "technical",
  "difficulty": "easy|medium|hard",
  "duration_minutes": 15,
  "programming_language": "javascript|typescript",
  "constraints": ["constraint1", "constraint2"],
  "initial_code": "código inicial",
  "solution_template": "solución de ejemplo",
  "tags": ["tag1", "tag2"]
}
```

### test-cases.json

```json
{
  "test_cases": [
    {
      "id": 1,
      "input": { "param1": "value" },
      "expected_output": "expected",
      "description": "Descripción del caso"
    }
  ]
}
```

## 🔧 Uso en el Sistema

Estos challenges son cargados por el sistema como:

- **source**: `KANUX_JSON`
- **evaluation_type**: `simulated`
- **created_by_company**: `NULL` (retos del sistema)

Los talentos podrán acceder a estos retos desde el endpoint público de challenges.

## ✅ Verificación

Después de ejecutar el seed, verifica con:

```sql
SELECT
    c.id,
    c.title,
    c.difficulty,
    c.duration_minutes,
    tcm.source
FROM challenges c
INNER JOIN technical_challenge_metadata tcm ON c.id = tcm.challenge_id
WHERE tcm.source = 'KANUX_JSON'
ORDER BY c.created_at;
```

---

**Nota:** Los archivos JSON contienen toda la lógica de evaluación (test cases, expected outputs, constraints) que será utilizada por el sistema de evaluación automática.
