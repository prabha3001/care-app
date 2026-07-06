require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');

const TEST_EMAIL = 'carer@test.com';
const TEST_PASSWORD = 'password123';

db.get('SELECT id FROM carers WHERE email = ?', [TEST_EMAIL], (err, existingCarer) => {
  if (err) throw err;

  if (existingCarer) {
    console.log(`Seed data already exists (carer id ${existingCarer.id}). Skipping.`);
    process.exit(0);
  }

  bcrypt.hash(TEST_PASSWORD, 10, (err, hash) => {
    if (err) throw err;

    db.run(
      'INSERT INTO carers (name, email, password_hash) VALUES (?, ?, ?)',
      ['Test Carer', TEST_EMAIL, hash],
      function (err) {
        if (err) throw err;
        const carerId = this.lastID;

        db.run(
          'INSERT INTO clients (name, address, phone) VALUES (?, ?, ?)',
          ['Jane Doe', '123 Main St', '555-1234'],
          function (err) {
            if (err) throw err;
            const clientId = this.lastID;

            const now = new Date();
            const scheduledStart = new Date(now.getTime() + 5 * 60000).toISOString();
            const scheduledEnd = new Date(now.getTime() + 65 * 60000).toISOString();

            db.run(
              'INSERT INTO visits (carer_id, client_id, scheduled_start, scheduled_end) VALUES (?, ?, ?, ?)',
              [carerId, clientId, scheduledStart, scheduledEnd],
              function (err) {
                if (err) throw err;
                console.log('Seed complete.');
                console.log(`Login: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
                console.log(`Visit id: ${this.lastID}`);
                process.exit(0);
              }
            );
          }
        );
      }
    );
  });
});
