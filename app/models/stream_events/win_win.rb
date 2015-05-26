module StreamEvents
  class WinWin < StreamEvent

    def task
      target
    end

    def title_html
      html =<<-HTML
        earned #{product.name} coins for finishing
        <a class="long-link" href="#{product_wip_path(task.product, task)}">
          #{h(task.title)}
        </a>
        <a class="gray-2" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </a>
      HTML
    end

    def icon_class
      "yellow border-yellow icon-star"
    end
  end
end
