module TextFilters
  class ImgThumbnailFilter < HTML::Pipeline::Filter

    def call
      doc.css('img').each do |el|
        if context[:firesize_url] && el['src']
          el.name = 'div'

          firesize_args = ['500x']
          if %w[.pdf .psd].include?(File.extname(el['src']))
            firesize_args << 'frame_0'
          end

          preview_url = File.join(context[:firesize_url], firesize_args, el['src'])

          lightbox = Nokogiri::XML::Node.new('div', doc)
          lightbox['data-react-class'] = 'AssetThumbnail'
          lightbox['data-react-props'] = {
            url: el['src'],
            name: el['alt'] ,
            preview: preview_url
          }.to_json
          el.add_child(lightbox)

          img = Nokogiri::XML::Node.new('img', doc)
          img['src'] = preview_url
          img['alt'] = el['alt']
          lightbox.add_child(img)

          el.delete 'src'
          el.delete 'alt'
        end
      end
      doc
    end

  end
end
