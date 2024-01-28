FROM selenoid/chrome

ENV SCREEN_RESOLUTION=800x600x24
ENV DISPLAY_NUM=99
ENV DISPLAY=':99'

COPY --chown=selenium:root extension/ /extension/
COPY --chown=selenium:root preferences.json /

COPY entrypoint.sh /
COPY policies.json /etc/opt/chrome/policies/managed/policies.json
