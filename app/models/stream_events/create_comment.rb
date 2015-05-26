module StreamEvents
  class CreateComment < StreamEvent
    def comment
      subject
    end

    def wip
      subject.wip
    end

    def title_html
      html =<<-HTML
        commented on
        <a class="long-link" href="#{product_wip_path(wip.product, wip)}">
          #{h(wip.title)}
        </a>
        <a class="gray-2" href="#{product_wip_path(wip.product, wip)}">
          ##{wip.number}
        </a>
      HTML
    end

    def chat_message(raw_text)
      body = subject.body.gsub(/\s+\r|\n\s+/, ' ').truncate(250)
      "[#{product.slug}##{wip.number}] @#{actor.username}: #{body}"
    end

    def icon_class
      "gray-5 border-gray-5 icon-speech-bubble"
    end
  end
end
