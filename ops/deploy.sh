#!/usr/bin/env bash
# Deploys spotosh to the production server with Ansible (see ops/ansible/README.md).
# Usage: ops/deploy.sh [-e spotosh_version=v1.0.1] [--check --diff] [other ansible-playbook args]
set -euo pipefail
cd "$(dirname "$0")/ansible"

if ! head -n1 group_vars/all/vault.yml 2>/dev/null | grep -q '^\$ANSIBLE_VAULT'; then
  echo "group_vars/all/vault.yml is missing or not encrypted, see ops/ansible/README.md" >&2
  exit 1
fi

ansible-galaxy collection install -r requirements.yml >/dev/null

vault_args=()
[ -n "${ANSIBLE_VAULT_PASSWORD_FILE:-}" ] || vault_args=(--ask-vault-pass)
exec ansible-playbook deploy.yml "${vault_args[@]}" "$@"
