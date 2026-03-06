#!/bin/bash

# Script to append all source code to PROJECT_SNAPSHOT.md
OUTPUT_FILE="/tmp/cc-agent/62831970/project/PROJECT_SNAPSHOT.md"
PROJECT_ROOT="/tmp/cc-agent/62831970/project"

# Function to append file content with proper formatting
append_file() {
    local filepath="$1"
    local language="$2"

    if [ ! -f "$filepath" ]; then
        echo "Warning: File not found: $filepath"
        return
    fi

    local line_count=$(wc -l < "$filepath")
    local relative_path="${filepath#$PROJECT_ROOT/}"

    echo "" >> "$OUTPUT_FILE"
    echo "### FILE: $relative_path ($line_count lines)" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "\`\`\`$language" >> "$OUTPUT_FILE"
    cat "$filepath" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
}

# 1. Configuration files
append_file "$PROJECT_ROOT/package.json" "json"
append_file "$PROJECT_ROOT/vite.config.ts" "typescript"
append_file "$PROJECT_ROOT/tsconfig.json" "json"
append_file "$PROJECT_ROOT/tsconfig.app.json" "json"
append_file "$PROJECT_ROOT/tsconfig.node.json" "json"
append_file "$PROJECT_ROOT/tailwind.config.js" "javascript"
append_file "$PROJECT_ROOT/eslint.config.js" "javascript"
append_file "$PROJECT_ROOT/postcss.config.js" "javascript"
append_file "$PROJECT_ROOT/index.html" "html"

# 2. Core source files
append_file "$PROJECT_ROOT/src/main.tsx" "tsx"
append_file "$PROJECT_ROOT/src/index.css" "css"
append_file "$PROJECT_ROOT/src/App.tsx" "tsx"

# 3. Library files (alphabetically)
for file in $(ls "$PROJECT_ROOT/src/lib/"*.{ts,tsx} 2>/dev/null | sort); do
    if [[ "$file" == *.tsx ]]; then
        append_file "$file" "tsx"
    else
        append_file "$file" "typescript"
    fi
done

# 4. Layout files
for file in $(ls "$PROJECT_ROOT/src/layouts/"*.tsx 2>/dev/null | sort); do
    append_file "$file" "tsx"
done

# 5. Component files (alphabetically)
for file in $(ls "$PROJECT_ROOT/src/components/"*.tsx 2>/dev/null | sort); do
    append_file "$file" "tsx"
done

# 6. Page files by directory
for dir in admin brand business public spa; do
    for file in $(ls "$PROJECT_ROOT/src/pages/$dir/"*.tsx 2>/dev/null | sort); do
        append_file "$file" "tsx"
    done
done

# 7. Migration files (chronologically)
for file in $(ls "$PROJECT_ROOT/supabase/migrations/"*.sql 2>/dev/null | sort); do
    append_file "$file" "sql"
done

# 8. Script files
for file in $(ls "$PROJECT_ROOT/scripts/"*.{ts,sql} 2>/dev/null | sort); do
    if [[ "$file" == *.sql ]]; then
        append_file "$file" "sql"
    else
        append_file "$file" "typescript"
    fi
done

echo "✓ Source code section complete"
