module MarkdownHelper

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
      shortcut_root_url:  Rails.application.routes.url_helpers.product_url(product),
      firesize_url: ENV['FIRESIZE_URL'],
      # FIXME There is no route "users_path"
      users_base_url: '/users'
    )

    @product_pipeline.call(text)[:output].to_s.html_safe
  end

# --

  def markdown_mtime(name)
    f = "#{name}.markdown"
    File.mtime(f)
  end

  def markdown_content(name)
    f = "#{name}.markdown"
    Rails.cache.fetch("#{f}#{markdown_mtime(name)}") do
      markdown(File.read(f))
    end
  end

end
