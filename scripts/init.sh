#!/usr/bin/env bash
# Project initialization script for Micro SaaS Agent template.
#
# Usage: ./scripts/init.sh [options]
#
# Options:
#   --help                Show this help message
#   --non-interactive     Run without prompts (use CLI args instead)
#   --project-name NAME   Set the project name (default: directory name)
#   --skip-install        Skip dependency installation
#   --skip-migrate        Skip database migration
#   --force               Overwrite existing .env files
#   --firebase-api-key KEY
#   --firebase-auth-domain DOMAIN
#   --firebase-project-id ID
#   --firebase-storage-bucket BUCKET
#   --firebase-messaging-sender-id SENDER_ID
#   --firebase-app-id APP_ID
#   --firebase-credentials-path PATH  Path to Firebase service account JSON file
#   --auth-google true|false          Enable Google auth provider (default: false)
#   --auth-github true|false          Enable GitHub auth provider (default: false)
#   --database-url URL

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Default values
NON_INTERACTIVE=false
PROJECT_NAME=""
SKIP_INSTALL=false
SKIP_MIGRATE=false
FORCE_OVERWRITE=false
FIREBASE_API_KEY=""
FIREBASE_AUTH_DOMAIN=""
FIREBASE_PROJECT_ID=""
FIREBASE_STORAGE_BUCKET=""
FIREBASE_MESSAGING_SENDER_ID=""
FIREBASE_APP_ID=""
FIREBASE_CREDENTIALS_PATH=""
AUTH_GOOGLE_ENABLED=""
AUTH_GITHUB_ENABLED=""
DATABASE_URL=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --help)
      head -n 22 "$0" | tail -n +2 | sed 's/^# \{0,\}//'
      exit 0
      ;;
    --non-interactive)
      NON_INTERACTIVE=true
      shift
      ;;
    --project-name)
      PROJECT_NAME="$2"
      shift 2
      ;;
    --skip-install)
      SKIP_INSTALL=true
      shift
      ;;
    --skip-migrate)
      SKIP_MIGRATE=true
      shift
      ;;
    --force)
      FORCE_OVERWRITE=true
      shift
      ;;
    --firebase-api-key)
      FIREBASE_API_KEY="$2"
      shift 2
      ;;
    --firebase-auth-domain)
      FIREBASE_AUTH_DOMAIN="$2"
      shift 2
      ;;
    --firebase-project-id)
      FIREBASE_PROJECT_ID="$2"
      shift 2
      ;;
    --firebase-storage-bucket)
      FIREBASE_STORAGE_BUCKET="$2"
      shift 2
      ;;
    --firebase-messaging-sender-id)
      FIREBASE_MESSAGING_SENDER_ID="$2"
      shift 2
      ;;
    --firebase-app-id)
      FIREBASE_APP_ID="$2"
      shift 2
      ;;
    --database-url)
      DATABASE_URL="$2"
      shift 2
      ;;
    --firebase-credentials-path)
      FIREBASE_CREDENTIALS_PATH="$2"
      shift 2
      ;;
    --auth-google)
      AUTH_GOOGLE_ENABLED="$2"
      shift 2
      ;;
    --auth-github)
      AUTH_GITHUB_ENABLED="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Cross-platform sed
sed_inplace() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

# Check prerequisites
check_prerequisites() {
  local missing=()
  
  if ! command -v node &> /dev/null; then
    missing+=("node (https://nodejs.org/)")
  fi
  
  if ! command -v pnpm &> /dev/null; then
    missing+=("pnpm (run: corepack enable pnpm)")
  fi
  
  if ! command -v python3 &> /dev/null; then
    missing+=("python3 (https://www.python.org/)")
  fi
  
  if ! command -v uv &> /dev/null; then
    missing+=("uv (https://docs.astral.sh/uv/)")
  fi
  
  if [ ${#missing[@]} -gt 0 ]; then
    echo "Error: Missing required prerequisites:"
    for item in "${missing[@]}"; do
      echo "  - $item"
    done
    exit 1
  fi
}

# Prompt for input (interactive mode only)
prompt() {
  local prompt_text="$1"
  local default_value="$2"
  local result
  
  if [ -n "$default_value" ]; then
    read -r -p "$prompt_text [$default_value]: " result
    echo "${result:-$default_value}"
  else
    read -r -p "$prompt_text: " result
    echo "$result"
  fi
}

# Prompt yes/no
prompt_yn() {
  local prompt_text="$1"
  local default_value="$2"  # "y" or "n"
  local result
  
  if [ "$default_value" = "y" ]; then
    read -r -p "$prompt_text [Y/n]: " result
    result="${result:-y}"
  else
    read -r -p "$prompt_text [y/N]: " result
    result="${result:-n}"
  fi
  
  [[ "$result" =~ ^[Yy] ]]
}

# Replace project name in files
replace_project_name() {
  local new_name="$1"
  
  echo "Replacing project name with: $new_name"
  
  # frontend/src/app/layout.tsx - line 17
  sed_inplace "s/title: \"[^\"]*\"/title: \"$new_name\"/" "$ROOT_DIR/frontend/src/app/layout.tsx"
  
  # frontend/src/components/marketing/marketing-header.tsx - line 12
  # Replace text content between Link tags (preserving indentation)
  sed_inplace "12s/\([[:space:]]*\)[^[:space:]].*$/\1$new_name/" "$ROOT_DIR/frontend/src/components/marketing/marketing-header.tsx"
  
  # frontend/src/components/marketing/marketing-footer.tsx - replace line 5 with new copyright name
  sed_inplace "5s/©.*All rights reserved\./© {new Date().getFullYear()} $new_name. All rights reserved./" "$ROOT_DIR/frontend/src/components/marketing/marketing-footer.tsx"
  
  # frontend/src/components/dashboard/sidebar.tsx - line 44
  # Match span with className containing text-lg font-semibold
  sed_inplace "s|\(<span className=\"text-lg font-semibold transition-opacity duration-200\">\)[^<]*\(</span>\)|\1$new_name\2|" "$ROOT_DIR/frontend/src/components/dashboard/sidebar.tsx"
  
  # backend/app/config.py - line 12
  sed_inplace "s/PROJECT_NAME: str = \"[^\"]*\"/PROJECT_NAME: str = \"$new_name\"/" "$ROOT_DIR/backend/app/config.py"
  
  # backend/.env.example
  sed_inplace "s/^PROJECT_NAME=.*/PROJECT_NAME=$new_name/" "$ROOT_DIR/backend/.env.example"
}

# Copy env file
copy_env_file() {
  local src="$1"
  local dest="$2"
  local force="$3"
  
  if [ -f "$dest" ] && [ "$force" = "false" ]; then
    if [ "$NON_INTERACTIVE" = "true" ]; then
      echo "  $dest exists (skipping)"
      return 1
    else
      if prompt_yn "  $dest exists. Overwrite?" "n"; then
        cp "$src" "$dest"
        echo "  Created: $dest"
        return 0
      else
        echo "  Skipped: $dest"
        return 1
      fi
    fi
  else
    cp "$src" "$dest"
    echo "  Created: $dest"
    return 0
  fi
}

# Update env file with value
update_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"
  
  if [ -z "$value" ]; then
    return
  fi
  
  # Escape special characters in value for sed
  local escaped_value
  escaped_value=$(printf '%s\n' "$value" | sed 's/[\/&]/\\&/g')
  
  if grep -q "^${key}=" "$file"; then
    sed_inplace "s|^${key}=.*|${key}=${escaped_value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

# Main execution
main() {
  echo "=========================================="
  echo "Micro SaaS Agent - Project Initialization"
  echo "=========================================="
  echo ""
  
  # Check prerequisites
  check_prerequisites
  
  # Get project name
  if [ -z "$PROJECT_NAME" ]; then
    if [ "$NON_INTERACTIVE" = "true" ]; then
      PROJECT_NAME=$(basename "$ROOT_DIR")
    else
      PROJECT_NAME=$(prompt "Enter project name" "$(basename "$ROOT_DIR")")
    fi
  fi
  
  # Replace project name
  replace_project_name "$PROJECT_NAME"
  
  # Create environment files
  echo ""
  echo "Creating environment files..."
  
  local force_flag="false"
  if [ "$FORCE_OVERWRITE" = "true" ]; then
    force_flag="true"
  fi
  
  local root_env_created=false
  local frontend_env_created=false
  local backend_env_created=false
  
  # if copy_env_file "$ROOT_DIR/.env.example" "$ROOT_DIR/.env" "$force_flag"; then
  #   root_env_created=true
  # fi
  
  if copy_env_file "$ROOT_DIR/frontend/.env.example" "$ROOT_DIR/frontend/.env.local" "$force_flag"; then
    frontend_env_created=true
  fi
  
  if copy_env_file "$ROOT_DIR/backend/.env.example" "$ROOT_DIR/backend/.env" "$force_flag"; then
    backend_env_created=true
  fi
  
  # Configure Firebase (if not non-interactive or if values provided)
  if [ "$NON_INTERACTIVE" = "false" ] || [ -n "$FIREBASE_API_KEY" ]; then
    echo ""
    echo "Firebase Configuration (optional - press Enter to skip):"
    
    if [ "$NON_INTERACTIVE" = "false" ]; then
      FIREBASE_API_KEY=$(prompt "  Firebase API Key" "")
      FIREBASE_AUTH_DOMAIN=$(prompt "  Firebase Auth Domain" "")
      FIREBASE_PROJECT_ID=$(prompt "  Firebase Project ID" "")
      FIREBASE_STORAGE_BUCKET=$(prompt "  Firebase Storage Bucket" "")
      FIREBASE_MESSAGING_SENDER_ID=$(prompt "  Firebase Messaging Sender ID" "")
      FIREBASE_APP_ID=$(prompt "  Firebase App ID" "")
      
      echo ""
      echo "Firebase Admin SDK (backend):"
      FIREBASE_CREDENTIALS_PATH=$(prompt "  Path to Firebase service account JSON file" "./firebase-credentials.json")
      
      echo ""
      echo "Auth Provider Toggles:"
      if prompt_yn "  Enable Google authentication?" "n"; then
        AUTH_GOOGLE_ENABLED="true"
      else
        AUTH_GOOGLE_ENABLED="false"
      fi
      if prompt_yn "  Enable GitHub authentication?" "n"; then
        AUTH_GITHUB_ENABLED="true"
      else
        AUTH_GITHUB_ENABLED="false"
      fi
    fi
    
    # Update frontend .env.local
    if [ "$frontend_env_created" = "true" ] || [ -f "$ROOT_DIR/frontend/.env.local" ]; then
      update_env_value "$ROOT_DIR/frontend/.env.local" "NEXT_PUBLIC_FIREBASE_API_KEY" "$FIREBASE_API_KEY"
      update_env_value "$ROOT_DIR/frontend/.env.local" "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "$FIREBASE_AUTH_DOMAIN"
      update_env_value "$ROOT_DIR/frontend/.env.local" "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "$FIREBASE_PROJECT_ID"
      update_env_value "$ROOT_DIR/frontend/.env.local" "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "$FIREBASE_STORAGE_BUCKET"
      update_env_value "$ROOT_DIR/frontend/.env.local" "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "$FIREBASE_MESSAGING_SENDER_ID"
      update_env_value "$ROOT_DIR/frontend/.env.local" "NEXT_PUBLIC_FIREBASE_APP_ID" "$FIREBASE_APP_ID"
    fi
    
    # Update backend .env
    if [ "$backend_env_created" = "true" ] || [ -f "$ROOT_DIR/backend/.env" ]; then
      update_env_value "$ROOT_DIR/backend/.env" "FIREBASE_PROJECT_ID" "$FIREBASE_PROJECT_ID"
    fi
    
    # Update root .env (used by Docker frontend service)
    # if [ "$root_env_created" = "true" ] || [ -f "$ROOT_DIR/.env" ]; then
    #   update_env_value "$ROOT_DIR/.env" "NEXT_PUBLIC_FIREBASE_API_KEY" "$FIREBASE_API_KEY"
    #   update_env_value "$ROOT_DIR/.env" "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "$FIREBASE_AUTH_DOMAIN"
    #   update_env_value "$ROOT_DIR/.env" "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "$FIREBASE_PROJECT_ID"
    #   update_env_value "$ROOT_DIR/.env" "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "$FIREBASE_STORAGE_BUCKET"
    #   update_env_value "$ROOT_DIR/.env" "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "$FIREBASE_MESSAGING_SENDER_ID"
    #   update_env_value "$ROOT_DIR/.env" "NEXT_PUBLIC_FIREBASE_APP_ID" "$FIREBASE_APP_ID"
    #   update_env_value "$ROOT_DIR/.env" "NEXT_PUBLIC_AUTH_GOOGLE_ENABLED" "$AUTH_GOOGLE_ENABLED"
    #   update_env_value "$ROOT_DIR/.env" "NEXT_PUBLIC_AUTH_GITHUB_ENABLED" "$AUTH_GITHUB_ENABLED"
    # fi
    
    # Write FIREBASE_CREDENTIALS_PATH to backend/.env
    if [ "$backend_env_created" = "true" ] || [ -f "$ROOT_DIR/backend/.env" ]; then
      update_env_value "$ROOT_DIR/backend/.env" "FIREBASE_CREDENTIALS_PATH" "$FIREBASE_CREDENTIALS_PATH"
    fi
    
    # Write auth toggles to frontend/.env.local
    if [ "$frontend_env_created" = "true" ] || [ -f "$ROOT_DIR/frontend/.env.local" ]; then
      update_env_value "$ROOT_DIR/frontend/.env.local" "NEXT_PUBLIC_AUTH_GOOGLE_ENABLED" "$AUTH_GOOGLE_ENABLED"
      update_env_value "$ROOT_DIR/frontend/.env.local" "NEXT_PUBLIC_AUTH_GITHUB_ENABLED" "$AUTH_GITHUB_ENABLED"
    fi
  fi
  
  # Configure Supabase
  if [ "$NON_INTERACTIVE" = "false" ] || [ -n "$DATABASE_URL" ]; then
    echo ""
    echo "Supabase Configuration (optional - press Enter to skip):"
    
    if [ "$NON_INTERACTIVE" = "false" ]; then
      echo "  Format: postgresql+asyncpg://user:password@db.xxx.supabase.co:6543/postgres"
      DATABASE_URL=$(prompt "  Database URL" "")
    fi
    
    if [ -n "$DATABASE_URL" ]; then
      if [ "$backend_env_created" = "true" ] || [ -f "$ROOT_DIR/backend/.env" ]; then
        update_env_value "$ROOT_DIR/backend/.env" "DATABASE_URL" "$DATABASE_URL"
      fi
      
      # if [ "$root_env_created" = "true" ] || [ -f "$ROOT_DIR/.env" ]; then
      #   update_env_value "$ROOT_DIR/.env" "DATABASE_URL" "$DATABASE_URL"
      # fi
    fi
  fi
  
  # Install dependencies
  if [ "$SKIP_INSTALL" = "false" ]; then
    echo ""
    local should_install=true
    
    if [ "$NON_INTERACTIVE" = "false" ]; then
      if ! prompt_yn "Install dependencies now?" "y"; then
        should_install=false
      fi
    fi
    
    if [ "$should_install" = "true" ]; then
      echo "Installing dependencies..."
      echo "  Installing frontend dependencies..."
      pnpm --dir "$ROOT_DIR/frontend" install
      
      echo "  Installing backend dependencies..."
      cd "$ROOT_DIR/backend" && uv sync && cd "$ROOT_DIR"
      
      echo "Dependencies installed successfully."
    fi
  fi
  
  # Run migrations
  if [ "$SKIP_MIGRATE" = "false" ] && [ -n "$DATABASE_URL" ]; then
    echo ""
    local should_migrate=false
    
    if [ "$NON_INTERACTIVE" = "false" ]; then
      if prompt_yn "Run database migrations?" "n"; then
        should_migrate=true
      fi
    fi
    
    if [ "$should_migrate" = "true" ]; then
      echo "Running database migrations..."
      local migration_output
      local migration_exit_code=0
      migration_output=$(cd "$ROOT_DIR/backend" && uv run alembic upgrade head 2>&1) || migration_exit_code=$?
      cd "$ROOT_DIR"
      
      if [ "$migration_exit_code" -ne 0 ] || echo "$migration_output" | grep -qi "error\|traceback\|exception"; then
        echo ""
        echo "WARNING: Database migration encountered errors:"
        echo "$migration_output" | tail -20
        echo ""
        echo "You can retry manually: cd backend && uv run alembic upgrade head"
      else
        echo "Migrations completed successfully."
      fi
    fi
  fi
  
  # Summary
  echo ""
  echo "=========================================="
  echo "Initialization Complete!"
  echo "=========================================="
  echo ""
  echo "Project configured as: $PROJECT_NAME"
  echo ""
  echo "Next steps:"
  echo "  1. Review and update environment files:"
  echo "     - frontend/.env.local"
  echo "     - backend/.env"
  echo "  2. Add Firebase credentials (if not configured)"
  echo "  3. Add Supabase database URL (if not configured)"
  echo "  4. See docs/setup-guide.md for detailed setup instructions"
  echo ""
  echo "Start development:"
  echo "  pnpm --dir frontend dev    # Frontend (port 3000)"
  echo "  cd backend && uv run uvicorn app.main:app --reload  # Backend (port 8000)"
  echo ""
}

main
