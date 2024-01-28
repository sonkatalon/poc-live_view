"use server";

import { exec, spawn } from "child_process";
import { promisify } from "util";
import { Device } from "@/models";

let lastHostPort = 3000;
const killers: Record<number, Function> = {};

const execAsync = promisify(exec);

export async function createDevice({
  hostname,
  isSecure,
  url,
  width,
  height,
}: {
  hostname: string;
  isSecure: boolean;
  url: string;
  width: number;
  height: number;
}): Promise<Device> {
  // make sure a valid URL is provided
  new URL(url);

  const { stdout: networksStdout } = await execAsync(
    'docker inspect $(hostname) -f "{{json .NetworkSettings.Networks }}"'
  );
  const networks = JSON.parse(networksStdout) as Record<string, unknown>;
  const network = Object.keys(networks)[0];

  return new Promise((resolve) => {
    const dockerImage = "poc-device:chrome"; // must matches the image name in `./scripts/dev.sh`
    const containerPort = 5900;
    const hostPort = ++lastHostPort;

    const args = [
      "run",
      "--env",
      `SCREEN_RESOLUTION=${width}x${height}x24`,
      "--name",
      `poc-${hostPort}`,
      "--network",
      network,
      "--publish",
      `${hostPort}:${containerPort}`,
      "--rm",
      dockerImage,
      "google-chrome",
      `--app=${url}`,
    ];
    const docker = spawn("docker", args);
    killers[hostPort] = () => {
      console.log("Killing docker", { hostPort });
      docker.kill("SIGINT");
    };
    console.log("Spawning container", { args });

    docker.stdout.on("data", (data) => {
      const stdout = data.toString("utf8");
      if (stdout === `PORT=${containerPort}\n`) {
        const device: Device = {
          hostPort,
          rfbUrl: `${isSecure ? "wss" : "ws"}://${hostname}:${hostPort}`,
        };
        console.log("Container is ready", { device });
        resolve(device);
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
