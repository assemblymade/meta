module MarkdownHelper
  EXTENDER = Rails.application.routes.url_helpers

  DEFAULT_FILTERS = [
    TextFilters::MarkdownFilter,
    HTML::Pipeline::SanitizationFilter,
    TextFilters::ImgThumbnailFilter
  ]

  PRODUCT_FILTERS = [
    TextFilters::MarkdownFilter,
    HTML::Pipeline::SanitizationFilter,
    TextFilters::UserMentionFilter,
    TextFilters::ShortcutFilter,
    TextFilters::AssetInlineFilter,
    TextFilters::ImgThumbnailFilter,
    HTML::Pipeline::EmojiFilter,
  ]

  def markdown(text)
    @default_pipeline ||= HTML::Pipeline.new(DEFAULT_FILTERS)
    @default_pipeline.call(text)[:output].to_s.html_safe
  end

  def idea_markdown(text)
    @comment_pipeline ||= HTML::Pipeline.new(PRODUCT_FILTERS,
      asset_root: 'https://a248.e.akamai.net/assets.github.com/images/icons',
      whitelist: html_whitelist,
      firesize_url: ENV['FIRESIZE_URL'],
      users_base_url: File.join(EXTENDER.root_url, 'users'))
    begin
      result = @comment_pipeline.call(text)
      result[:output].to_s.html_safe
    rescue => e
      Rails.logger.error("pipeline=#{e.message} text=#{text}")
      text
    end
  end

  # this is used in mailers, so use full urls
  def product_markdown(product, text)
    @product_pipeline ||= HTML::Pipeline.new(PRODUCT_FILTERS,
      asset_root: 'https://a248.e.akamai.net/assets.github.com/images/icons',
      shortcut_root_url:  EXTENDER.product_url(product),
      firesize_url: ENV['FIRESIZE_URL'],
      # FIXME There is no route "users_path"
      product: product,
      users_base_url: File.join(EXTENDER.root_url, 'users'),
      people_base_url: EXTENDER.product_people_url(product),
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
    whitelist = HTML::Pipeline::SanitizationFilter::WHITELIST
    whitelist[:elements] << 'iframe'
    whitelist[:attributes]['iframe'] = %w(src webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder)
    whitelist
  end

end
