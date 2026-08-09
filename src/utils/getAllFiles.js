import fs from "fs";
import path from "path";

const getAllFiles = (directory, foldersOnly = false) => {
  let fileNames = [];
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(directory, file.name);
    
    const normalizedPath = filePath.replace(/^[a-z]:/, (match) => match.toUpperCase());

    if (foldersOnly) {
      if (file.isDirectory()) {
        fileNames.push(normalizedPath);
      }
    } else {
      if (file.isFile()) {
        fileNames.push(normalizedPath);
      } else {
        fileNames = [...fileNames, ...getAllFiles(normalizedPath, foldersOnly)];
      }
    }
  }

  return fileNames;
};

export default getAllFiles;