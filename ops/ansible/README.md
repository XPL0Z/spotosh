# Deployment

The production server is described by the Ansible playbook in this folder. A deploy:

1. installs Docker Engine + the compose plugin if `docker compose` is missing (needs sudo),
2. checks out `spotosh_version` from GitHub into `spotosh_dir` (`/srv/spotosh/app`),
3. writes `ops/.env` from `group_vars/all/vars.yml` and the encrypted vault,
4. rebuilds the images and (re)starts `ops/docker-compose.yml`.

Running it again with nothing changed is a no-op, apart from the image rebuild.

## One-time setup

Install Ansible locally (`pipx install ansible-core`), then:

```sh
cd ops/ansible
# 1. Set spotosh_auth_url in group_vars/all/vars.yml
# 2. Create the encrypted secrets file (fields: vault.example.yml)
ansible-vault create group_vars/all/vault.yml
```

Commit `vault.yml`. It is encrypted, so the secrets are versioned without being readable.
Share the vault password out of band.

## Deploy

```sh
ops/deploy.sh                              # deploy main
ops/deploy.sh -e spotosh_version=v1.0.1    # deploy a tag
ops/deploy.sh --check --diff               # dry run
```

To avoid typing the vault password, put it in a file outside the repo and
`export ANSIBLE_VAULT_PASSWORD_FILE=~/.spotosh-vault-pass`.

## Editing secrets

```sh
cd ops/ansible && ansible-vault edit group_vars/all/vault.yml
```
