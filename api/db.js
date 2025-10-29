import mysql from 'mysql2';


export const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "cookie2018",
    database: "otis_mvp"
});