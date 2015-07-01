module StreamEvents
  class CreateDiscussion < StreamEvent
    def discussion
      subject
    end

    def title_html
      html =<<-HTML
        started discussion on
        <a class="long-link" href="#{product_wip_path(discussion.product, discussion)}">
          #{h(discussion.title)}
        </a>
        <a class="gray-2" href="#{product_wip_path(discussion.product, discussion)}">
          ##{discussion.number}
        </a>
      HTML
    end

    def icon_class
      "green border-green icon icon-plus"
    end
  end
end
