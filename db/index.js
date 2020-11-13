const { STRING } = require('sequelize')
const Sequelize = require('sequelize')
const db = new Sequelize(
    process.env.DATABASE_URL || 'postgres://localhost/bookmarks'
)

const Bookmarker = db.define('Bookmarker', {
    siteName: {
        type: STRING,
        allowNull: false,
    },
    siteURL: {
        type: STRING,
        allowNull: false,
        validate: {
            isURL: true,
        },

        unique: true,
    },
    category: {
        type: STRING,
    },
})

const syncAndSeed = async () => {
    await db.sync({ force: true })
    await Bookmarker.create({
        siteName: 'Stack Overflow Jobs',
        siteURL: 'https://stackoverflow.com/jobs',
        category: 'job search',
    })
    await Bookmarker.create({
        siteName: 'Indeed',
        siteURL: 'www.indeed.com',
        category: 'job search',
    })
    await Bookmarker.create({
        siteName: 'LinkedIn',
        siteURL: 'www.linkedin.com',
        category: 'job search',
    })
}

module.exports = {
    db,
    syncAndSeed,
    models: {
        Bookmarker,
    },
}
