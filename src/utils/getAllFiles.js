import fs from "fs";
import path from "path";

const getAllFiles = (directory, foldersOnly = false) => {
  let fileNames = [];
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(directory, file.name);
    
    const normalizedPath = filePath.replace(/^[a-z]:/i, (match) => match.toUpperCase());

        if (file.isDirectory()) {
  if (foldersOnly) {
      fileNames.push(normalizedPath);
  }
      fileNames.push(...getAllFiles(normalizedPath, foldersOnly));
  } else if (file.isFile() && !foldersOnly) {
    fileNames.push(normalizedPath);
}
   }

  return fileNames;
};

export default getAllFiles;
