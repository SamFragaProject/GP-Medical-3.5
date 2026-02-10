const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrations = [
    'supabase/migrations/20250208_01_dictamenes.sql',
    'supabase/migrations/20250208_02_nom011.sql',
    'supabase/migrations/20250208_03_nom036.sql',
    'supabase/migrations/20250208_04_episodios.sql',
    'supabase/migrations/20260209_setup_permisos.sql'
];

async function runMigration(file) {
    return new Promise((resolve, reject) => {
        console.log(`\nStarting migration: ${file}`);
        const filePath = path.join(__dirname, file);

        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return reject(new Error('File not found'));
        }

        const content = fs.readFileSync(filePath, 'utf8');

        // Use npx supabase db query
        const child = spawn('npx.cmd', ['supabase', 'db', 'query'], {
            stdio: ['pipe', 'inherit', 'inherit']
        });

        child.on('error', (err) => {
            console.error(`Spawn error: ${err.message}`);
            reject(err);
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ Migration ${file} successful.`);
                resolve();
            } else {
                console.error(`❌ Migration ${file} failed with code ${code}.`);
                reject(new Error(`Exit code ${code}`));
            }
        });

        // Write content to stdin
        try {
            child.stdin.write(content);
            child.stdin.end();
        } catch (err) {
            console.error(`Write error: ${err.message}`);
            reject(err);
        }
    });
}

async function main() {
    for (const file of migrations) {
        try {
            await runMigration(file);
        } catch (err) {
            console.error('Stopping execution due to error.');
            process.exit(1);
        }
    }
    console.log('\n🎉 All migrations completed successfully!');
}

main();
