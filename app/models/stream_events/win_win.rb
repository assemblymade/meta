module StreamEvents
  class WinWin < StreamEvent

    def task
      target
    end

    def title_html
      html =<<-HTML
        earned #{product.name} coins for finishing
        <a class="long-link" href="#{product_wip_path(task.product, task)}">
          #{task.title}
        </a>
        <a class="text-muted" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </a>
      HTML
    end

    def icon_class
      "marker-yellow icon-star"
    end
  end
end
