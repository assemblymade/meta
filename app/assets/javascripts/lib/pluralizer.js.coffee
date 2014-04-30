$.fn.extend
  pluralizer: (options) ->
    self = $.fn.pluralizer
    opts = $.extend {}, self.default_options, options

    $(this).each (i, el) ->
      self.init el, opts

$.extend $.fn.pluralizer,
  default_options:
      pluralizeCount: 0

  init: (el, opts) ->
    opts = $.extend opts, $(el).data()

    $(el).text(@label(opts.pluralizeCount, opts.pluralizeLabel))

  label: (count, label) ->
    if count == 1
      "#{count} #{label}"
    else
      "#{count} #{label}s"
