#!/bin/bash

set -euo pipefail

if [ ! -f '/home/selenium/.config/google-chrome/First Run' ]; then
  mkdir -p /home/selenium/.config/google-chrome/Default
  touch '/home/selenium/.config/google-chrome/First Run'
  cp /preferences.json /home/selenium/.config/google-chrome/Default/Preferences
fi

xvfb-run -l -n "$DISPLAY_NUM" -s "-ac -screen 0 $SCREEN_RESOLUTION -noreset -listen tcp" /usr/bin/fluxbox -display "$DISPLAY" -log /dev/null 2>/dev/null &

x11vnc -display "$DISPLAY" -shared -forever -loop500 -rfbport 5900 -rfbportv6 5900 -logfile /dev/null &

exec "$@"
