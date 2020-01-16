const warn = console.warn
const log = window.console.log
export function WebSocketRetry(url: string, protocol: string, options: any) {
  options = options || {}
  var maxInterval = options.maxInterval || 5
  var retry = 0

  const x = {
    onmessage: function() {} as any,
    onopen: function() {} as any,
    send: notReady as any
  }

  createConnection()

  function createConnection() {
    var ws = new WebSocket(url, protocol)
    let intervalId: number
    // ws.send = notReady
    ws.onclose = function() {
      retry++
      var gap = Math.min(maxInterval, retry)
      var interval = 1000 * gap
      warn('Websocket connection was lost.')
      log(
        'Retry(' +
          retry +
          ') websocket connection after ' +
          gap +
          ' seconds...\n'
      )
      setTimeout(function() {
        clearInterval(intervalId)
        createConnection()
      }, interval)
      log(gap-- + 's')
      intervalId = setInterval(function() {
        log(gap-- + 's')
      }, 1000)
    }
    ws.onopen = function() {
      retry = 0
      clearInterval(intervalId)
      log('Websocket connection established.')
      ws.onmessage = x.onmessage
      x.send = function() {
        window.console.log('x.send called', ws)
      }
      x.send = ws.send.bind(ws)
      x.onopen()
    }
    return ws
  }

  return x
}

function notReady() {
  warn('Invalid sending message before connection is ready.')
}
