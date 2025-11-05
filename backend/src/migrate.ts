import fs from 'fs';
import path from 'path';
import pool from './database/db';

async function migrate() {
  try {
    console.log('Running database migrations...');
    
    // Try multiple paths (for tsx dev and compiled)
    const possiblePaths = [
      path.join(__dirname, 'database', 'schema.sql'),
      path.join(process.cwd(), 'src', 'database', 'schema.sql'),
      path.join(process.cwd(), 'backend', 'src', 'database', 'schema.sql'),
    ];
    
    let schemaPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        schemaPath = possiblePath;
        break;
      }
    }
    
    if (!schemaPath) {
      throw new Error(`Schema file not found. Tried: ${possiblePaths.join(', ')}`);
    }
    
    console.log(`Using schema file: ${schemaPath}`);
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await pool.query(schema);
    
    console.log('✅ Database migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

