// TODO In application.js (chrislloyd)
// var moment = require('moment')

(function() {

  var second = 1e3
  var minute = 6e4
  var hour = 36e5
  var day = 864e5
  var week = 6048e5

  var formats = {
    seconds: 's',
    minutes: 'm',
    hours:   'h',
    days:    'd'
  }

  var formatShortTime = function (time) {
    var diff = Math.abs(time.diff(moment()))
    var unit = null
    var num = null

    if(diff <= second) {
      unit = 'seconds'
      num = 1
    } else if (diff < minute) {
      unit = 'seconds'
    } else if (diff < hour) {
      unit = 'minutes'
    } else if (diff < day) {
      unit = 'hours'
    } else if (diff < week) {
      unit = 'days'
    } else {
      return time.format('M/D/YY')
    }

    if (!(num && unit)) {
      num = moment.duration(diff)[unit]()
    }

    return num + formats[unit]
  }

  if (typeof module !== 'undefined') {
    module.exports = formatShortTime
  }

})()
