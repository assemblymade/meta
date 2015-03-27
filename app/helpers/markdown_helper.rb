module MarkdownHelper
  EXTENDER = Rails.application.routes.url_helpers

  DEFAULT_FILTERS = [
    TextFilters::MarkdownFilter,
    HTML::Pipeline::SanitizationFilter,
    TextFilters::ImgThumbnailFilter,
    TextFilters::UserMentionFilter,
    HTML::Pipeline::EmojiFilter,
    TextFilters::NoFollowLinksFilter,
    TextFilters::TaskListFilter,
  ]

  PRODUCT_FILTERS = [
    TextFilters::MarkdownFilter,
    HTML::Pipeline::SanitizationFilter,
    TextFilters::ShortcutFilter,
    TextFilters::AssetInlineFilter,
    TextFilters::ImgThumbnailFilter,
    TextFilters::UserMentionFilter,
    HTML::Pipeline::EmojiFilter,
    TextFilters::NoFollowLinksFilter,
    TextFilters::TaskListFilter,
  ]

  def markdown(text)
    @default_pipeline ||= HTML::Pipeline.new(DEFAULT_FILTERS,
      asset_root: 'https://a248.e.akamai.net/assets.github.com/images/icons',
      firesize_url: ENV['FIRESIZE_URL'],
      users_base_url: File.join(EXTENDER.root_url, 'users')
    )
    @default_pipeline.call(text)[:output].to_s.html_safe
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

  def highlighted_mentions(text, user, product=nil)
    highlighted_text = text.clone
    TextFilters::UserMentionFilter.mentioned_usernames_in(text, product) do |username, mentioned_users|
      if Array(mentioned_users).include?(user)
        highlighted_text.gsub!("@#{username}", %Q{<span class="callout">@#{user.username}</span>}.html_safe)
      end
    end
    highlighted_text
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
    whitelist = HTML::Pipeline::SanitizationFilter::WHITELIST.dup
    whitelist[:elements] << 'iframe'
    whitelist[:attributes]['iframe'] = %w(src webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder)
    whitelist
  end

end
