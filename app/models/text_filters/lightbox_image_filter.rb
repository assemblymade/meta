require 'securerandom'

module TextFilters
  class LightboxImageFilter < HTML::Pipeline::Filter

    def call
      doc.search("img").each do |img|

        if img['class'].present?
          classes = img['class'].split(' ')
          classes.delete('img-thumbnail')
          img['class'] = classes.join(' ')
        end

        html = LightboxImageFilter.wrap_image_with_lightbox(img.to_html)
        img.replace(html)
      end
      doc
    end

    def self.wrap_image_with_lightbox(image_html)
      unique_element_id = ['lightbox', SecureRandom.uuid].join('-')

      <<-ENDHTML
        <a class="thumbnail" href="##{unique_element_id}" data-toggle="lightbox">
          #{image_html}
        </a>
        <div id="#{unique_element_id}" class="lightbox" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="lightbox-dialog">
            <div class="lightbox-content">
              #{image_html}
            </div>
          </div>
        </div>
      ENDHTML
    end
  end
end
