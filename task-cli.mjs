#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function usage() {
  console.error("Usage: task-cli run <task>");
  process.exit(1);
}

function interpolate(str, vars) {
  if (!str) return str;
  return str.replace(/\$\{([^}]+)\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) return vars[key];
    return match;
  });
}

async function loadConfig(configPath) {
  const content = await fs.readFile(configPath, "utf8");
  const doc = YAML.parse(content);
  if (!doc || typeof doc !== "object") {
    throw new Error("Invalid droid.yml format");
  }
  return doc;
}

async function runCommand(command, cwd, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      env,
      stdio: "inherit",
      shell: true,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command exited with code ${code}`));
    });
    child.on("error", (err) => reject(err));
  });
}

async function runTask(taskName, configPath) {
  const cwd = process.cwd();
  const config = await loadConfig(configPath);
  const vars = { ...(config.vars || {}) };
  const tasks = config.tasks || {};
  const task = tasks[taskName];
  if (!task) {
    throw new Error(`Task '${taskName}' not found in ${configPath}`);
  }

  const env = { ...process.env, ...vars, ...(task.env || {}) };
  for (const key of Object.keys(env)) {
    const value = env[key];
    if (typeof value === "string") {
      env[key] = interpolate(value, env);
    }
  }

  const command = interpolate(task.run, env);
  if (!command) {
    throw new Error(`Task '${taskName}' does not define a run command`);
  }

  console.log(`> ${command}`);
  await runCommand(command, cwd, env);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2 || args[0] !== "run") {
    usage();
  }

  const taskName = args[1];
  const configPath = path.resolve(process.cwd(), "droid.yml");
  try {
    await runTask(taskName, configPath);
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
