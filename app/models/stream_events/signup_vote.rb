module StreamEvents
  class SignupVote < StreamEvent
    def title_html
      html =<<-HTML
        signed up
        <span class="long-link">
          for
          <a href="#{product_path(product)}">
            #{product.name}
          </a>
        </span>
      HTML
    end
  end
end
