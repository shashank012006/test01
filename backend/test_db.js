require('dotenv').config();
const mysql = require('mysql2/promise');

const passwords = ['', 'root', 'password', 'your_password', 'demo_password', '1234', '123456', 'admin'];

(async () => {
    for (let pwd of passwords) {
        try {
            const conn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: pwd });
            console.log('SUCCESS with password:', pwd);
            await conn.end();
            process.exit(0);
        } catch (e) {
            console.log('Failed with:', pwd);
        }
    }
    console.log('ALL FAILED');
    process.exit(1);
})();
