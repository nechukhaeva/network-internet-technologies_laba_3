'use strict'

const Database = require('better-sqlite3')

class Db {
    constructor(file) {
        this.db = new Database(file)

        this.createTables()
    }

    createTables(){
        let sql = ''

        sql = `CREATE TABLE IF NOT EXISTS files (
            id integer PRIMARY KEY,
            name text,
            size text,
            path text
		)`
        this.db.prepare(sql).run()
    }

    insertFiles(files){
        if(files){
            for(let file of files){
                this.db.prepare('INSERT INTO files (name, size, path) VALUES (?,?,?)').run(file.name, file.size, file.path)
            }
            return this.selectFiles()
        }
        return null
    }

    selectFiles(){
        return this.db.prepare(`SELECT * FROM files`).all()
    }

    selectPathFile(name){
        return this.db.prepare(`SELECT path FROM files WHERE name = ?`).get(name).path
    }

    deleteFile(name){
        let file = this.db.prepare(`SELECT * FROM files WHERE name = ?`).get(name)
        let stmt = this.db.prepare('DELETE FROM files WHERE name = ?').run(name)
        if (stmt.changes) return file
        return null 
    }
}

module.exports = Db