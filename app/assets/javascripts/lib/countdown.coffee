#= require moment

window.Countdown = (end) ->
  now = moment()

  days = end.diff(now, 'days')

  now.add('days', days)
  hours = end.diff(now, 'hours')

  now.add('hours', hours)
  minutes = end.diff(now, 'minutes')

  now.add('minutes', minutes)
  seconds = end.diff(now, 'seconds')

  return {
    days: days
    hours: hours
    minutes: minutes
    seconds: seconds
  }
