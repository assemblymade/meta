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
          #{role.product_job.category} team
        </a>
      HTML
    end
  end
end
