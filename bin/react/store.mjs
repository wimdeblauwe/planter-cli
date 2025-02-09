// import { files } from "../helpers/files.mjs";
import camelcase from "camelcase";
import path from "path";
import fs from "fs";
import {DIRNAME} from "../helpers/globals/globals.js";
import chalk from "chalk";
import {detect} from "../helpers/detect.mjs";
import inquirer from "inquirer";

const store = {
  create: async (name, persisted) => {
    detect
      .package("zustand")
      .then(() => {
        return inquirer.prompt([
          {
            type: "confirm",
            name: "persisted",
            message: "Does the store need persistence?",
            default: false,
          },
        ]);
      })
      .then(persist => {
        const changeFiles = copyDataFolder(name, persist.persisted);
        replace(changeFiles, name);
        console.log(chalk.green("Store file created..."));
      })
      .catch(err => {
        console.log(chalk.red(err));
      });
  },
};

function copyDataFolder(name, persisted) {
  const settings = JSON.parse(fs.readFileSync(path.join(process.cwd(), "planter.config.json").toString()));

  const pascalCase = camelcase(name, {pascalCase: true});
  const storeFile = `use${persisted ? "Persistent" : ""}${pascalCase}Store.${settings.hasTs ? "ts" : "js"}`;

  const storePathName = path.join(process.cwd(), "src", "state", "stores");
  let storeExamplePathName = path.join(
    settings.hasTs ? "ts" : "js",
    persisted ? "persist" : "nopersist",
    `use${persisted ? "Persistent" : ""}ExampleStore.${settings.hasTs ? "ts" : "js"}`
  );
  const storePath = copyFile(storePathName, storeFile, storeExamplePathName);
  return [storePath];
}

function copyFile(pathName, fileName, exampleFile) {
  const fullPath = path.join(pathName, fileName);
  const localsettings = JSON.parse(fs.readFileSync(path.join(process.cwd(), "planter.config.json").toString()));
  fs.copyFileSync(
    path.resolve(
      DIRNAME,
      "..",
      "..",
      localsettings.library === "react" ? "react" : "reactnative",
      "examples",
      "state",
      "zustand",
      exampleFile
    ),
    fullPath
  );
  return fullPath;
}

function replace(filePaths, name) {
  const pascalCase = camelcase(name, {pascalCase: true});
  const camelCaseName = camelcase(name);
  for (let path of filePaths) {
    let data = fs.readFileSync(path, "utf8");
    let result = data.replace(/example/g, camelCaseName).replace(/Example/g, pascalCase);
    fs.writeFileSync(path, result, "utf8");
  }
  return;
}

export default store;
