import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
export const logsDir = path.join(process.cwd(), 'src/storage/logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export const auditLogStream = fs.createWriteStream(
  path.join(logsDir, 'audit.log'),
  { flags: 'a' }
);
