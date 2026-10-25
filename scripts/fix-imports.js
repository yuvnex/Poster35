import fs from 'node:fs';
import path from 'node:path';

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Replace import { Router, Request, Response } from 'express';
      content = content.replace(
        /import\s+\{\s*Router\s*,\s*Request\s*,\s*Response\s*\}\s+from\s+['"]express['"];/g,
        "import express from 'express';\nimport type { Request, Response } from 'express';\nconst Router = express.Router;"
      );

      // Replace import { Request, Response, NextFunction } from 'express';
      content = content.replace(
        /import\s+\{\s*Request\s*,\s*Response\s*,\s*NextFunction\s*\}\s+from\s+['"]express['"];/g,
        "import type { Request, Response, NextFunction } from 'express';"
      );

      // In server.ts: import express, { Request, Response, NextFunction } from 'express';
      content = content.replace(
        /import\s+express\s*,\s*\{\s*Request\s*,\s*Response\s*,\s*NextFunction\s*\}\s+from\s+['"]express['"];/g,
        "import express from 'express';\nimport type { Request, Response, NextFunction } from 'express';"
      );

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Fixed express imports in:', entry.name);
    }
  }
}

processDir(path.resolve('backend/src'));
console.log('Express imports normalized!');
