const express = require("express")
const path = require("path")
const nanoid = require("nanoid")
const methodOverride = require("method-override")
const app = express()
const sqlite3 = require("sqlite3").verbose()
const bcrypt = require('bcrypt')
const db = new sqlite3.Database("./database.db")
app.set("view engine", "ejs")
app.set('views', path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS pasties (
            id TEXT PRIMARY KEY,
            content TEXT,
            password TEXT,
            expireTime INTEGER
        )
    `)
})


app.get("/", (req, res) => {
    res.render("home")
})

app.get("/new", (req, res) => {
    res.render("pasty/new")
})

app.post('/new', async (req, res) => {
    const { content, passwd, duration } = req.body
    const id = nanoid.nanoid(8)
    const expireTime = Date.now() + (Number(duration) * 1000)
    const hashedPasswd = await bcrypt.hash(passwd, 10)
    db.run(
        `INSERT INTO pasties (id, content, password, expireTime) VALUES (?, ?, ?, ?)`,
        [id, content, hashedPasswd, expireTime],
        (err) => {
            if (err) return res.send("Something went wrong!")
            res.redirect("/" + id)
        }
    )
})

app.get("/expired", (req, res) => {
    res.render("expired.ejs")
})

app.get("/:id", (req, res) => {
    const { id } = req.params

    db.get(
        `SELECT * FROM pasties WHERE id = ?`,
        [id],
        (err, pasty) => {
            if (err || !pasty || Date.now() >= pasty.expireTime) {
                return res.redirect("/expired")
            }

            res.render("pasty/show", { pasty, passwd: "", invalidPassword: false })
        }
    )
})

app.post("/:id", (req, res) => {
    const { id } = req.params
    const passwd = req.body.passwd

    db.get(
        `SELECT * FROM pasties WHERE id = ?`,
        [id],
        async (err, pasty) => {
            if (err || !pasty || Date.now() >= pasty.expireTime) {
                return res.redirect("/expired")
            }
            const isMatch = await bcrypt.compare(passwd, pasty.password)
            if (isMatch) {
                res.render("pasty/show", { pasty, passwd, invalidPassword: false })
            } else {
                res.render("pasty/show", { pasty, passwd: "", invalidPassword: true })
            }
        }
    )
})


app.delete("/:id", (req, res) => {
    const { id } = req.params
    db.run(
        `DELETE FROM pasties WHERE id = ?`,
        [id],
        () => {
            res.redirect("/")
        }
    )
})


app.listen(8080)

setInterval(() => {
    db.run(`DELETE FROM pasties WHERE expireTime < ?`, [Date.now()])
}, 60000)
