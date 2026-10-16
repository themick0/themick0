#!/usr/bin/env bash
# Remote command arguments intentionally expand locally after validation below.
# shellcheck disable=SC2029
set -euo pipefail

: "${DEPLOY_HOST:?Set DEPLOY_HOST in the production environment.}"
: "${DEPLOY_USER:?Set DEPLOY_USER in the production environment.}"
: "${SSH_PRIVATE_KEY:?Set the SSH_PRIVATE_KEY secret.}"
: "${SSH_KNOWN_HOSTS:?Set the verified SSH_KNOWN_HOSTS secret.}"
: "${RELEASE_ID:?Set a unique RELEASE_ID.}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/themick0}"

# Keep values safe when passed to the remote shell. This deployment targets Linux.
[[ "$DEPLOY_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || { echo 'Invalid DEPLOY_HOST.' >&2; exit 1; }
[[ "$DEPLOY_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || { echo 'Invalid DEPLOY_USER.' >&2; exit 1; }
if [[ ! "$DEPLOY_PORT" =~ ^[0-9]{1,5}$ ]] || ((10#$DEPLOY_PORT < 1 || 10#$DEPLOY_PORT > 65535)); then
  echo 'Invalid DEPLOY_PORT.' >&2
  exit 1
fi
[[ "$DEPLOY_PATH" =~ ^/var/www/[a-zA-Z0-9_-]+$ ]] || { echo 'DEPLOY_PATH must be a site directory directly under /var/www.' >&2; exit 1; }
[[ "$RELEASE_ID" =~ ^[a-zA-Z0-9][a-zA-Z0-9_-]*$ ]] || { echo 'Invalid RELEASE_ID.' >&2; exit 1; }

node --input-type=module <<'NODE'
import { base, indexable, siteUrl } from './site.config.mjs';
if (!indexable || !siteUrl || base !== '/') {
  throw new Error('This Nginx configuration needs an indexable HTTPS site at the domain root.');
}
NODE
for file in index.html 404.html robots.txt sitemap-index.xml; do
  test -s "dist/$file" || { echo "Missing build output: dist/$file" >&2; exit 1; }
done

umask 077
ssh_directory=$(mktemp -d)
trap 'rm -rf "$ssh_directory"' EXIT
printf '%s\n' "$SSH_PRIVATE_KEY" > "$ssh_directory/key"
printf '%s\n' "$SSH_KNOWN_HOSTS" > "$ssh_directory/known_hosts"
unset SSH_PRIVATE_KEY SSH_KNOWN_HOSTS

ssh_options=(
  -i "$ssh_directory/key"
  -p "$DEPLOY_PORT"
  -o BatchMode=yes
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=yes
  -o "UserKnownHostsFile=$ssh_directory/known_hosts"
  -o ConnectTimeout=15
)
target="$DEPLOY_USER@$DEPLOY_HOST"
release="$DEPLOY_PATH/releases/$RELEASE_ID"

# Upload into a new directory. An interrupted upload cannot affect the live site.
ssh "${ssh_options[@]}" "$target" \
  "umask 022; mkdir -p '$DEPLOY_PATH/releases' && mkdir '$release'"
tar -C dist -czf - . | ssh "${ssh_options[@]}" "$target" \
  "umask 022; tar --no-same-owner -xzf - -C '$release'"

ssh "${ssh_options[@]}" "$target" "bash -s -- '$DEPLOY_PATH' '$RELEASE_ID'" <<'REMOTE'
set -euo pipefail
umask 022
cd "$1"
release="releases/$2"
for file in index.html 404.html robots.txt sitemap-index.xml; do
  test -s "$release/$file"
done
if [[ -e current && ! -L current ]]; then
  echo 'Refusing to replace current: it must be a symlink.' >&2
  exit 1
fi
if [[ -L current ]]; then
  previous=$(readlink current)
  ln -s "$previous" "previous-$2"
  mv -Tf "previous-$2" previous
fi
ln -s "$release" "current-$2"
mv -Tf "current-$2" current
REMOTE

echo "Activated release $RELEASE_ID. The previous release remains available for rollback."
