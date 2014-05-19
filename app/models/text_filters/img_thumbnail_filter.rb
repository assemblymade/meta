module TextFilters
  class ImgThumbnailFilter < HTML::Pipeline::Filter

    def call
      doc.css('img').each do |element|
        element['class'] = 'img-thumbnail'
      end
      doc
    end

  end
end
