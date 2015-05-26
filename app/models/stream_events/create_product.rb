module StreamEvents
  class CreateProduct < StreamEvent

    def highlight?
      true
    end

    def important?
      true
    end

    def title_html
      html =<<-HTML
        created a new product
        <span class="long-link">
          named
          <a href="#{product_path(product)}">
            #{h(product.name)}
          </a>
        </span>
      HTML
    end

    def icon_class
      "yellow border-yellow icon icon-plus"
    end

  end
end
