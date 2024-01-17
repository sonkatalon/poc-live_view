"use server";

import { spawn } from "child_process";
import { Device } from "@/models";

let lastHostPort = 3000;
const killers: Record<number, Function> = {};

export async function createDevice({
  url,
  width,
  height,
}: {
  url: string;
  width: number;
  height: number;
}): Promise<Device> {
  // make sure a valid URL is provided
  new URL(url);

  return new Promise((resolve) => {
    const containerPort = 5900;
    const hostPort = ++lastHostPort;
    const args = [
      `run`,
      `--env`,
      `SCREEN_RESOLUTION=${width}x${height}x24`,
      `--name`,
      `poc-${hostPort}`,
      `--publish`,
      `${hostPort}:${containerPort}`,
      `--rm`,
      `poc-image`,
      `google-chrome`,
      `--app=${url}`,
    ];
    const docker = spawn("docker", args);
    killers[hostPort] = () => docker.kill("SIGINT");

    docker.stdout.on("data", (data) => {
      const stdout = data.toString("utf8");
      if (stdout === `PORT=${containerPort}\n`) {
        resolve({ hostPort, rfbUrl: `ws://localhost:${hostPort}` });
      }
    });
    docker.on("error", (error) => console.error({ error }));
    docker.on("exit", (code, signal) => console.log({ code, signal }));
  });
}

export async function destroyDevice(hostPort: number): Promise<void> {
  const killer = killers[hostPort];
  if (typeof killer === "function") {
    killer();
    delete killers[hostPort];
  }
}
