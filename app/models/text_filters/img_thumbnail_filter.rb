module TextFilters
  class ImgThumbnailFilter < HTML::Pipeline::Filter

    def call
      doc.css('img').each do |element|
        if element['src']
          element['src'] = File.join(context[:firesize_url], 'frame_0', element['src'])
        end
        element['class'] = 'img-thumbnail'
      end
      doc
    end

  end
end
