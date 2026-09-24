const pool = require('./db');

async function checkDatabase() {
  try {
    const connectionResult = await pool.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user
    `);

    console.log('Database connection successful:');
    console.log(connectionResult.rows[0]);

    const tasksResult = await pool.query(`
      SELECT id, title, category, completed, created_at
      FROM tasks
      ORDER BY id
    `);

    console.log(`Tasks found: ${tasksResult.rows.length}`);
    console.table(tasksResult.rows);
  } catch (error) {
    console.error('Database check failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

checkDatabase();