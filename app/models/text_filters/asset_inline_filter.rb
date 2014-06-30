module TextFilters
  class AssetInlineFilter < HTML::Pipeline::Filter
    def call
      result[:assets] ||= { images: [], wips: [], unknown: []}
      doc.search("a").each do |el|
        inline_image el
        inline_wip el
      end
      doc
    end

    def inline_image(el)
      return if el['href'] =~ /^https?:\/\/github.com/
      return if el['href'] =~ /^mailto:/

      if el['href'] =~ /\.(gif|jpg|jpeg|png)$/
        result[:assets][:images] |= [el['href']]

        img = Nokogiri::XML::Node.new('img',doc)
        img['src'] = el['href']

        el.content = ''
        el.add_child img
      else
        result[:assets][:unknown] |= [el['href']]
      end
    end

    def inline_wip(el)
      if el['href'] =~ /https?:\/\/.*assembly.com(:\d+)?\/[\w-]+\/wips\/(\d+)/i
        el.content = "##{$2}"
      end
    end
  end
end
