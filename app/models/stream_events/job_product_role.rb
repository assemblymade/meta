module StreamEvents
  class JobProductRole < StreamEvent

    def role
      subject
    end

    def product
      target
    end

    def title_html
      html =<<-HTML
        joined the
        <a href="#{product_jobs_path(product)}">
          #{h(role.product_job.category)} team
        </a>
      HTML
    end

    def icon_class
      "marker-default icon-chevron-right"
    end
  end
end
