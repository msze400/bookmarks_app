const {
    db,
    syncAndSeed,
    models: { Bookmarker },
} = require('./db')

const express = require('express')
const app = express()

//middleware that parses incoming requests
app.use(express.urlencoded({ extended: false }))

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
        res.send(
            `<html>
                <head>
                <link rel="stylesheet" href="/styles.css"/>
                </head>
                    <body>
                    <h1>Bookmarks ${bookmarks.length}</h1>
                    <form method = "POST" id = bookmark-form>
                        <input name = 'siteName' placeholder = 'enter site name'/>
                        <input name = 'siteURL' placeholder = 'enter site url'/>
                        <input name = 'category' placeholder = 'enter category'/>
                        <button>Create Bookmark</button>
                    </form>
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

        console.log(bookmarks)

        res.send(
            `<html>
                <head>
                <link rel="stylesheet" href="/styles.css"/>
                </head>
                    <body>
                    <h1>Bookmarker ${bookmarks.length}</h1>
                    <h1>Category: ${req.params.category}</h1>
                    ${bookmarks
                        .map(
                            (bookmark) => `
                    
                        <li>
                        <a href = '${bookmark.siteURL}'>
                        ${bookmark.siteName}
                        </a>
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

// module.exports = {
//     db,
//     syncAndSeed,
//     models: {
//         Bookmarker,
//     },
// }
