module StreamEvents
  class WorkDesignDeliverable < StreamEvent
    SUPPORTS_PREVIEW = ['image/png', 'image/jpeg']

    def task
      target
    end

    def attachment
      AttachmentSerializer.new(subject.attachment)
    end

    def preview_image_path
      attachment.href
    end

    def display_preview?
      #TODO: Solve previewing for 'application/pdf', 'image/vnd.adobe.photoshop', 'application/zip', 'image/tiff'
      SUPPORTS_PREVIEW.include?(attachment.content_type)
    end

    def title_html
      html =<<-HTML
        submitted design for
        <a class="long-link"  href="#{product_wip_path(task.product, task)}">
          #{h(task.title)}
        </a>
        <a class="text-muted" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </a>
      HTML
      if display_preview?
        image = TextFilters::LightboxImageFilter.wrap_image_with_lightbox("<img src='#{preview_image_path}' />")
        html << <<-HTML
          <div class="stream-event-attachment">
            #{image}
          </div>
        HTML
      end
      html
    end

    def icon_class
      "marker-blue icon-document"
    end
  end
end
