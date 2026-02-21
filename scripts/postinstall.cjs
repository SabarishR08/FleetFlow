const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const prismaRoot = path.join(repoRoot, "node_modules", ".prisma");
const clientRoot = path.join(repoRoot, "node_modules", "@prisma", "client");
const target = path.join(clientRoot, ".prisma");

try {
  if (!fs.existsSync(prismaRoot) || !fs.existsSync(clientRoot)) {
    process.exit(0);
  }

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
    fs.cpSync(prismaRoot, target, { recursive: true });
    console.log("Prisma client files copied for local tooling.");
  }
} catch (error) {
  console.warn("Prisma postinstall skipped:", error.message || error);
}
