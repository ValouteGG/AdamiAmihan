const express = require('express')
const app = express()
const port = process.env.PORT || 4000

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({status: 'ok', now: Date.now()})
})

app.listen(port, ()=>{
  console.log(`Backend server listening on http://localhost:${port}`)
})
