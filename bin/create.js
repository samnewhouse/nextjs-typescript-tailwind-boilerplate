#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

if (process.argv.length < 3) {
  console.error("Please provide a name for your application.");
  console.error("For example: npx create-nttb my-app");
  process.exit(1);
}

const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
const gitRepo = "https://github.com/SamNewhouse/create-nttb";

function createProjectDirectory() {
  try {
    fs.mkdirSync(projectPath);
  } catch (err) {
    if (err.code === "EEXIST") {
      console.error(
        `The directory "${projectName}" already exists. Please choose another name.`
      );
    } else {
      console.error(`Error creating directory: ${err.message}`);
    }
    process.exit(1);
  }
}

function runCommand(command, options = {}) {
  try {
    execSync(command, { stdio: "inherit", ...options });
  } catch (err) {
    console.error(`Error running command "${command}": ${err.message}`);
    process.exit(1);
  }
}

function updatePackageJson() {
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Remove unwanted fields and update required fields
  const updatedPackageJson = {
    ...packageJson,
    name: "app",
    version: "1.0.0",
    description: "create-nttb app description",
  };
  delete updatedPackageJson.author;
  delete updatedPackageJson.bin;

  fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2));
}

function cleanUp() {
  const pathsToRemove = [
    ".git",
    ".github",
    "bin",
    "renovate.json"
  ];

  pathsToRemove.forEach((item) => {
    const itemPath = path.join(projectPath, item);
    if (fs.existsSync(itemPath)) {
      console.log(`Removing ${itemPath}...`);
      runCommand(`npx rimraf ${itemPath}`);
    }
  });
}

async function main() {
  createProjectDirectory();

  console.log("Cloning repository...");
  runCommand(`git clone --depth 1 ${gitRepo} ${projectPath}`);

  process.chdir(projectPath);

  cleanUp();

  if (fs.existsSync("package.json")) {
    console.log("Updating package.json...");
    updatePackageJson();
  }

  console.log("Installing dependencies...");
  runCommand("npm install");

  console.log("Installed create-nttb successfully. Enjoy!");
}

main().catch((error) => {
  console.error(`An unexpected error occurred: ${error.message}`);
  process.exit(1);
});
