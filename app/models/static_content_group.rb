require 'nokogiri'
require 'redcarpet'

class StaticContentGroup

  def self.find_by_slug!(slug)
    all.find {|faq_group| faq_group.slug == slug } || raise(ActiveRecord::RecordNotFound)
  end

  def self.cache_key(faq_group)
    [faq_group, faq_group.last_updated_at]
  end

  def self.base_path=(path)
    @base_path = Pathname(path)
  end

  attr_reader :slug
  attr_reader :name
  attr_reader :renderer

  def initialize(slug, name)
    @slug = slug
    @name = name.to_s

    @renderer = Redcarpet::Markdown.new(Redcarpet::Render::HTML,
      autolink: true,
      fenced_code_block: true,
      lax_spacing: true,
      space_after_headers: true,
      superscript: true
    )
  end

  def self.anchor_for_question(question)
    question.to_s.parameterize
  end

  def body
    doc = Nokogiri::HTML(raw_markdown)
    doc.css('h1').each do |node|
      node.name = 'h3'
      node[:id] = self.class.anchor_for_question(node.text)
    end
    doc.to_html
  end

  def questions
    doc = Nokogiri::HTML(raw_markdown)
    doc.css('h1').map do |node|
      {
        name: node.text,
        anchor: self.class.anchor_for_question(node.text)
      }
    end
  end

  def last_updated_at
    file.mtime.to_i
  end

  def to_param
    slug.to_param
  end

  def file
    self.class.base_path.join("#{slug}.md")
  end

  def raw_markdown
    renderer.render(file.read)
  end
end
