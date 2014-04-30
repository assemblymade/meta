module StreamEvents
  class CreateDiscussion < StreamEvent
    def discussion
      subject
    end

    def title_html
      html =<<-HTML
        started discussion on
        <a class="long-link" href="#{product_wip_path(discussion.product, discussion)}">
          #{discussion.title}
        </a>
        <a class="text-muted" href="#{product_wip_path(discussion.product, discussion)}">
          ##{discussion.number}
        </a>
      HTML
    end
  end
end
