const {
    db,
    syncAndSeed,
    models: { Bookmarker },
} = require('./db')

const express = require('express')
const path = require('path')
const app = express()
const { QueryTypes } = require('sequelize')

//middleware that parses incoming requests
app.use(express.urlencoded({ extended: false }))
app.use(require('method-override')('_method'))

app.get('/styles.css', async (req, res) =>
    res.sendFile(path.join(__dirname, 'styles.css'))
)

app.delete('/users/:category', async (req, res, next) => {
    try {
        const bookmark = await Bookmarker.findByPk(req.params.category)
        await bookmark.destroy()
        res.redirect(`/bookmarks`)
    } catch (ex) {
        next(ex)
    }
})

app.post('/bookmarks', async (req, res, next) => {
    try {
        const bookmark = await Bookmarker.create(req.body)
        res.redirect(`/bookmarks/${bookmark.category}`)
    } catch (ex) {
        next(ex)
    }
})

app.get('/', async (req, res) => res.redirect('/bookmarks'))

app.get('/bookmarks', async (req, res) => {
    try {
        const bookmarks = await Bookmarker.findAll()
        //raw SQL query that pulls the distinc category from Bookmarkers table
        const bookmark_cat = await db.query(
            'SELECT DISTINCT category FROM "Bookmarkers"',
            { type: QueryTypes.SELECT }
        )

        // creates an object count for how many of each object are in the database
        let bookmark_count = bookmarks.reduce((accum, element) => {
            if (!accum[element.category]) {
                accum[element.category] = 0
            }
            accum[element.category]++
            return accum
        }, {})

        console.log(bookmark_count) // ex: { 'job search': 3 }

        res.send(
            `<html>
                <head>
                <link rel="stylesheet" href="/styles.css"/>
                </head>
                    <body>
                    <h1>Bookmarks (${bookmarks.length})</h1>
                    <form method = "POST" id = bookmark-form>
                        <input name = 'siteName' placeholder = 'enter site name'/>
                        <input name = 'siteURL' placeholder = 'enter site url'/>
                        <input name = 'category' placeholder = 'enter category'/>
                        <button>Create Bookmark</button>
                    </form>
                    ${bookmark_cat
                        .map(
                            (_category) => `
                    
                        <li>
                        <a href = ''>
                        ${_category.category}(${
                                bookmark_count[_category.category]
                            })
                        </a>
                        </li>`
                        )
                        .join('')} 
                   
                    </body>
                    </body>
            </html>`
        )
    } catch (ex) {
        console.log(ex)
    }
})

app.get('/bookmarks/:category', async (req, res) => {
    try {
        // finds the category parameter that was sent in by the get request
        const bookmarks = await Bookmarker.findAll({
            where: { category: req.params.category },
        })

        //raw SQL query that pulls the distinc category from Bookmarkers table
        const bookmark_cat = await db.query(
            'SELECT DISTINCT category FROM "Bookmarkers"',
            { type: QueryTypes.SELECT }
        )

        // creates an object count for how many of each object are in the database
        let bookmark_count = bookmarks.reduce((accum, element) => {
            if (!accum[element.category]) {
                accum[element.category] = 0
            }
            accum[element.category]++
            return accum
        }, {})

        console.log(bookmarks)

        res.send(
            `<html>
                <head>
                <link rel="stylesheet" href="/styles.css"/>
                </head>
                    <body>
                    <h1>Bookmarker ${bookmarks.length}</h1>
                    <h1>Category: ${req.params.category} (${
                bookmark_count[req.params.category]
            })</h1>
            <h1> 
                <a href ='/bookmarks/'>
                << Back
            </h1>
                    ${bookmarks
                        .map(
                            (bookmark) => `
                    
                        <li>
                        <a href = '${bookmark.siteURL}'>
                        ${bookmark.siteName}
                        </a>
                        <form method = 'POST' action = '/bookmarks/${bookmark.id}?_method=DELETE'>
                        <button>x</button>
                        </form>
                        
                        </li>`
                        )
                        .join('')} 
                   
                    </body>
            </html>`
        )
    } catch (ex) {
        console.log(ex)
    }
})

const init = async () => {
    try {
        await db.authenticate()
        await syncAndSeed()
        const port = process.env.PORT || 3000
        app.listen(port, () => console.log(`listening on port : ${port}`))
    } catch (ex) {
        console.log(ex)
    }
}

init()
