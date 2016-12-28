const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')

global.sessions = {}

const api = require('./api.js')

const app = express()

app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  layoutsDir: '../views/layouts',
  partialsDir: '../views/partials/'
}))

app.set('view engine', 'handlebars')
app.set('views', '../views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/static', express.static('../static'))
app.use('/favicon.ico', express.static('../static/favicon.ico'))

app.use('/api', api)

app.get('/', (req, res) => {
  res.render('start')
})

app.get('/destroyed', (req, res) => {
  res.render('start', {
    destroyed: true
  })
})

app.get('/expired', (req, res) => {
  res.render('start', {
    expired: true
  })
})

app.get('/test', (req, res) => {
  res.render('test')
})

app.get('/:id', (req, res) => {
  if(global.sessions[req.params.id]) {
    // icrement visits to be able to redirect the initiator
    // to session url when another client connects
    global.sessions[req.params.id].visits = global.sessions[req.params.id].visits + 1
    return res.render('session', {
      id: req.params.id
    })
  } else {
    return res.redirect('/expired')
  }
})

app.listen(5001)
