const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const fs = require('fs')
const del = require('delete')

var upload = multer({ dest: '../uploads/' })

const router = new express.Router()

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

router.post('/:id/file', upload.single('file'), (req, res) => {
  if(global.sessions[req.params.id]) {
    global.global.sessions[req.params.id].files.push({
      id: req.file.filename,
      name: req.file.originalname
    })
    res.json({
      success: true
    })
  } else {
    return res.json({ error: 'Session not found' })
  }
})

router.get('/:id/file/:fileId', (req, res) => {
  if(global.sessions[req.params.id]) {
    const session = global.sessions[req.params.id]
    const toSend = session.files.filter(file => file.id === req.params.fileId)[0]
    if(!toSend) {
      return res.json({ error: 'Session not found' })
    } else {
      const file = __dirname + '/../uploads/' + req.params.fileId
      res.download(file, toSend.name)
    }
  } else {
    return res.json({ error: 'Session not found' })
  }
})

router.post('/start', (req, res) => {
  const new_id = getRandomInt(5000, 60000)
  // blueprint
  global.sessions[new_id] = {
    textData: '',
    files: [],
    visits: 0
  }
  // destroy session after 1 hour
  setTimeout(() => {
    // delete files first
    global.sessions[new_id].files.forEach(file => {
      del(['../uploads/' + file.id])
    })
    // the destroy session completely
    global.sessions[new_id] = undefined
  }, 1000 * 60 * 60)
  return res.json({ id: new_id })
})


router.get('/:id', (req, res) => {
  if(global.sessions[req.params.id]) {
    return res.json(Object.assign({}, global.sessions[req.params.id], {
      ready: global.sessions[req.params.id].visits > 0
    }))
  } else {
    return res.json({ error: 'Session not found' })
  }
})

router.put('/:id', (req, res) => {
  if(global.sessions[req.params.id]) {
    global.sessions[req.params.id].textData = req.body.textData
    return res.json(global.sessions[req.params.id])
  } else {
    return res.json({ error: 'Session not found' })
  }
})

router.delete('/:id', (req, res) => {
  if(global.sessions[req.params.id]) {
    global.sessions[req.params.id].files.forEach(file => {
      del(['../uploads/' + file.id], {
        force: true
      })
    })
    global.sessions[req.params.id] = undefined
    return res.json({ deleted: true })
  } else {
    return res.json({ error: 'Session not found' })
  }
})

module.exports = router
