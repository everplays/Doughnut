import Logger from '../logger'

const MIGRATIONS = [
  // 1: Create Podcasts
  `CREATE TABLE podcasts (
    id INTEGER PRIMARY KEY,
    title TEXT,
    feed TEXT,
    description TEXT,
    link TEXT,
    author TEXT,
    pub_date DATETIME,
    language TEXT,
    copyright TEXT,
    image_url TEXT,
    image_blob TEXT,
    last_parsed DATE,
    created_at DATE,
    updated_at DATE
  )
  `
]

export default class Migrations {
  static nextUpVersion(db, callback) {
    db.query("PRAGMA user_version").spread((results, m) => {
      callback(results[0].user_version)
    })
  }

  static perform(db, version, callback) {
    db.query(MIGRATIONS[version]).spread((results, m) => {
      const nextUpVersion = version + 1
      db.query(`PRAGMA user_version = ${nextUpVersion}`).spread((results, m) => {
        callback()
      })
    })
  }

  static migrate(sequelize, done) {
    // Subtract 1 from both sides so that we end up with an 0 based index
    const latest = MIGRATIONS.length;

    Migrations.nextUpVersion(sequelize, (nextUp) => {
      if (nextUp < latest) {
        Migrations.perform(sequelize, nextUp, () => {
          Migrations.migrate(sequelize, done)
        })
      } else {
        // We are up to date
        done()
      }
    })
  }
}