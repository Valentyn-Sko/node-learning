import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const dirPath = process.argv[2] || '.';

async function listDirectory(dirPath) {
    try {
        const items = await readdir(dirPath, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            const stats = await stat(fullPath);

            const type = item.isDirectory() ? 'dir' : 'file';
            const size = stats.size;

            console.log(`${item.name} | ${type} | ${size}`);
        }
    } catch (error) {
        console.error(`Cannot read directory "${dirPath}": ${error.message}`);
        process.exitCode = 1;
    }
}

await listDirectory(dirPath);