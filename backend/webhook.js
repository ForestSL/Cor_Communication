const http = require('http')
const createHandler = require('github-webhook-handler')
const handler = createHandler({
  path: '/',
  secret: 'root' 
})
 
const rumCommand = (cmd, args, callback) => {
    const child = spawn(cmd, args)
    let response = ''
    child.stdout.on('data', buffer => response += buffer.toString())
    child.stdout.on('end', () => callback(response))
}
 
http.createServer((req, res) => {
  handler(req, res, function(err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(7777)
 
handler.on('error', err => {
  console.error('Error:', err.message)
})
 
handler.on('push', event => {
    rumCommand('sh', ['./auto_build.sh'], txt => {
      console.log(txt)
  })
})