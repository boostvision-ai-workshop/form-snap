#!/usr/bin/env bash
# Add Shadcn UI components to the frontend.
#
# Usage: ./scripts/setup-components.sh [--list] [--help] <component-name> [component-name...]
#
# Prerequisites:
#   - pnpm (Node.js package manager)
#
# Output: Installs components to frontend/src/components/ui/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$ROOT_DIR/frontend"
UI_COMPONENTS_DIR="$FRONTEND_DIR/src/components/ui"

# Function to print usage
usage() {
  cat <<EOF
Usage: scripts/setup-components.sh [--list] [--help] <component-name> [component-name...]

Add Shadcn UI components to the frontend.
22 base components are pre-installed. Use this script to add additional components.

Options:
  --list    List currently installed Shadcn UI components
  --help    Show this help message

Examples:
  ./scripts/setup-components.sh accordion         # Add one component
  ./scripts/setup-components.sh accordion tooltip  # Add multiple components
  ./scripts/setup-components.sh --list             # Show installed components

Available components: https://ui.shadcn.com/docs/components
EOF
}

# Function to list installed components
list_components() {
  if [[ ! -d "$UI_COMPONENTS_DIR" ]]; then
    echo "Error: UI components directory not found at $UI_COMPONENTS_DIR"
    exit 1
  fi

  local components=()
  mapfile -t components < <(
    find "$UI_COMPONENTS_DIR" -maxdepth 1 -name "*.tsx" -type f \
      -exec basename {} .tsx \; | sort
  )

  local count=${#components[@]}

  if [[ $count -eq 0 ]]; then
    echo "No Shadcn UI components found."
    return
  fi

  echo "Installed Shadcn UI components ($count):"
  printf '  %s\n' "${components[@]}"
}

# Function to check if component is already installed
is_installed() {
  local component_name="$1"
  [[ -f "$UI_COMPONENTS_DIR/$component_name.tsx" ]]
}

# Function to add a component
add_component() {
  local component_name="$1"

  if is_installed "$component_name"; then
    echo "✓ $component_name already installed, skipping"
    return 0
  fi

  echo "Installing $component_name..."
  cd "$FRONTEND_DIR"
  pnpm dlx shadcn@latest add "$component_name" --yes
  cd - > /dev/null
}

# Main script logic
if [[ $# -eq 0 ]]; then
  usage
  exit 0
fi

case "$1" in
  --help)
    usage
    exit 0
    ;;
  --list)
    list_components
    exit 0
    ;;
  *)
    added_count=0
    skipped_count=0

    for component in "$@"; do
      if is_installed "$component"; then
        echo "✓ $component already installed, skipping"
        skipped_count=$((skipped_count + 1))
      else
        if add_component "$component"; then
          added_count=$((added_count + 1))
        fi
      fi
    done

    echo ""
    echo "Summary:"
    echo "  Added: $added_count"
    echo "  Skipped: $skipped_count"
    exit 0
    ;;
esac
