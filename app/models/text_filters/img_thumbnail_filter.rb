module TextFilters
  class ImgThumbnailFilter < HTML::Pipeline::Filter

    def call
      doc.css('img').each do |element|
        element['src'] = File.join(context[:firesize_url], 'frame_0', element['src'])
        element['class'] = 'img-thumbnail'
      end
      doc
    end

  end
end
