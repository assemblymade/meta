module Filters
  class WiplinkFilter < HTML::Pipeline::Filter
    def self.mentioned_wips_in(text)
      text.gsub WipPattern do |match|
        yield match, $1.to_i
      end
    end

    WipPattern = /
      \#(\d+)             # wip number
      (?=
        [^0-9a-zA-Z_]|   # non-word character except dot
        $                 # end of line
      )
    /ix

    IGNORE_PARENTS = %w(pre code a).to_set

    def call
      result[:mentioned_wips] ||= []

      doc.search('text()').each do |node|
        content = node.to_html
        next if !content.include?('#')
        next if has_ancestor?(node, IGNORE_PARENTS)
        html = wip_link_filter(content, context[:wips_base_url])
        next if html == content
        node.replace(html)
      end
      doc
    end

    def wip_link_filter(text, base_url='/')
      self.class.mentioned_wips_in(text) do |match, wip|
        link_to_wip(wip)
      end
    end

    def link_to_wip(wip)
      result[:mentioned_wips] |= [wip]
      url = File.join(context[:wips_base_url], wip.to_s)
      "<a href='#{url}' class='wip-mention'>" +
      "##{wip}" +
      "</a>"
    end
  end
end