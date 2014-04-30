class window.TipBoxView extends Backbone.View
  events:
    'click .js-add-tip': 'addTipClicked'

  initialize: ->
    options = @$el.data()
    @url = options.tipsUrl
    @total = options.tipsTotal
    @increment = options.tipsIncrement
    @userTip = 0

    @children =
      totalTipView: @$('.js-total-tip-view')
      noTips: @$('.js-no-tips')
      total: @$('.js-total-tips')
      userTip: @$('.js-user-tip')

    @updateTip = _.debounce(@updateTip, 2000)

    @render()

  addTipClicked: (e)->
    @userTip += @increment
    @total += @increment

    @updateTip(@userTip)

    @render()

  render: ->
    if @total > 0
      @children.noTips.hide()
      @children.totalTipView.show()
    else
      @children.noTips.show()
      @children.totalTipView.hide()

    @children.total.text(numeral(@total / 100).format('0,0'))
    @children.userTip.val(numeral(@total / 100).format('0,0'))

  updateTip: ->
    add = @userTip
    @userTip = 0

    $.ajax
      type: "POST"
      url: @url
      data: { tip: { add: add } }
      dataType: "json"

