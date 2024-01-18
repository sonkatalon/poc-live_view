#!/bin/bash

set -euo pipefail

_scriptDir="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
_pocDir="$(cd "${_scriptDir}/.." >/dev/null 2>&1 && pwd)"
cd "${_pocDir}"

# compile device image
(cd ./docker/device && docker build -t poc-device:chrome .)

# install dependencies and start Next.js
npm install
exec npm run dev
