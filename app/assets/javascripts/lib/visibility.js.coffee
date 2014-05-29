visibility = ->
  keys =
    hidden: "visibilitychange",
    webkitHidden: "webkitvisibilitychange",
    mozHidden: "mozvisibilitychange",
    msHidden: "msvisibilitychange"

  for stateKey, value of keys
    if (stateKey of document)
      eventKey = keys[stateKey]
      break

  (c) ->
    if (c)
      document.addEventListener eventKey, -> c(!document[stateKey])
    !document[stateKey]

window.visibility = visibility()
