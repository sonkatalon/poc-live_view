FROM selenoid/chrome

ENV SCREEN_RESOLUTION=800x600x24
ENV DISPLAY_NUM=99
ENV DISPLAY=':99'

COPY entrypoint.sh /
COPY policies.json /etc/opt/chrome/policies/managed/policies.json
