module MarkdownHelper
  EXTENDER = Rails.application.routes.url_helpers

  DEFAULT_FILTERS = [
    TextFilters::MarkdownFilter,
    HTML::Pipeline::SanitizationFilter,
    TextFilters::ImgThumbnailFilter
  ]

  PRODUCT_FILTERS = DEFAULT_FILTERS + [
    TextFilters::UserMentionFilter,
    TextFilters::ShortcutFilter,
    TextFilters::AssetInlineFilter,
    TextFilters::LightboxImageFilter,
    HTML::Pipeline::EmojiFilter,
  ]

  def markdown(text)
    @default_pipeline ||= HTML::Pipeline.new(DEFAULT_FILTERS)
    @default_pipeline.call(text)[:output].to_s.html_safe
  end

  def product_markdown(product, text)
    @product_pipeline ||= HTML::Pipeline.new(PRODUCT_FILTERS,
      asset_root: 'https://a248.e.akamai.net/assets.github.com/images/icons',
      shortcut_root_url:  EXTENDER.product_url(product),
      firesize_url: ENV['FIRESIZE_URL'],
      # FIXME There is no route "users_path"
      product: product,
      users_base_url: '/users',
      people_base_url: EXTENDER.product_people_path(product),
      whitelist: html_whitelist
    )

    begin
      result = @product_pipeline.call(text)
      result[:output].to_s.html_safe
    rescue => e
      Rails.logger.error("pipeline=#{e.message} text=#{text}")
      text
    end
  end

# --

  def markdown_mtime(name)
    f = "#{name}.markdown"
    File.mtime(f)
  end

  def markdown_content(name)
    f = "#{name}.markdown"
    Rails.cache.fetch("#{f}#{markdown_mtime(name)}") do
      content_tag :div, markdown(File.read(f)), class: 'markdown markdown-content'
    end
  end

  def html_whitelist
    {
      :elements => %w(
        h1 h2 h3 h4 h5 h6 h7 h8 br b i strong em a pre code img tt
        div ins del sup sub p ol ul table thead tbody tfoot blockquote
        dl dt dd kbd q samp var hr ruby rt rp li tr td th s strike
        iframe
      ),
      :remove_contents => ['script'],
      :attributes => {
        'a' => ['href'],
        'img' => ['src'],
        'iframe' => %w(src webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder),
        'div' => ['itemscope', 'itemtype'],
        :all  => ['abbr', 'accept', 'accept-charset',
                  'accesskey', 'action', 'align', 'alt', 'axis',
                  'border', 'cellpadding', 'cellspacing', 'char',
                  'charoff', 'charset', 'checked', 'cite',
                  'clear', 'cols', 'colspan', 'color',
                  'compact', 'coords', 'datetime', 'dir',
                  'disabled', 'enctype', 'for', 'frame',
                  'headers', 'height', 'hreflang',
                  'hspace', 'ismap', 'label', 'lang',
                  'longdesc', 'maxlength', 'media', 'method',
                  'multiple', 'name', 'nohref', 'noshade',
                  'nowrap', 'prompt', 'readonly', 'rel', 'rev',
                  'rows', 'rowspan', 'rules', 'scope',
                  'selected', 'shape', 'size', 'span',
                  'start', 'summary', 'tabindex', 'target',
                  'title', 'type', 'usemap', 'valign', 'value',
                  'vspace', 'width', 'itemprop']
      }
    }
  end

end
