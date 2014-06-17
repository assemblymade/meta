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
        <a href="#{product_people_path(product)}">
          team
        </a>
      HTML
    end

    def icon_class
      "marker-default icon-chevron-right"
    end
  end
end
