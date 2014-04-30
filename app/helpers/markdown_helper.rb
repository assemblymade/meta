# TODO: Remove the `.html_safe` here. Escaping should be controlled by the
#       template with the triple-mustache.
module MarkdownHelper

  MARKDOWN_PIPELINE_FILTERS = [
    TextFilters::MarkdownFilter
  ]

  PRODUCT_MARKDOWN_PIPELINE_FILTERS = [
    TextFilters::MarkdownFilter,
    HTML::Pipeline::SanitizationFilter,
    HTML::Pipeline::AutolinkFilter,
    Filters::UserMentionFilter,
    TextFilters::ShortcutFilter,
    ::Filters::AssetInlineFilter,
    ::Filters::LightboxImageFilter
  ]


  def html_markdown(text)
    @pipeline ||= HTML::Pipeline.new([
      TextFilters::MarkdownFilter,
    ])
    @pipeline.call(text)[:output].to_s.html_safe
  end

  def markdown(text)
    unescaped_markdown(text).html_safe
  end

  def product_markdown(product, text)
    @product_markdown_pipline ||= HTML::Pipeline.new(
      PRODUCT_MARKDOWN_PIPELINE_FILTERS,
      product_url: product_url(product),
      # FIXME There is no route "users_path"
      users_base_url: '/users'
    )

    @product_markdown_pipline.call(text)[:output].to_s
  end

  def unescaped_markdown(text)
    @pipeline ||= HTML::Pipeline.new([
      TextFilters::MarkdownFilter,
      HTML::Pipeline::SanitizationFilter,
    ])
    @pipeline.call(text)[:output].to_s
  end

  def wip_markdown(text, wips_base_url)
    @wip_pipeline ||= HTML::Pipeline.new([
      TextFilters::MarkdownFilter,
      HTML::Pipeline::SanitizationFilter,
      HTML::Pipeline::AutolinkFilter,
      ::Filters::UserMentionFilter,
      ::Filters::WiplinkFilter,
      ::Filters::AssetInlineFilter,
      ::Filters::LightboxImageFilter
    ], wips_base_url: wips_base_url, users_base_url: '/users')

    @wip_pipeline.call(text)[:output].to_s.html_safe rescue ''
  end

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
