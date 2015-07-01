module StreamEvents
  class CreateTask < StreamEvent
    def task
      subject
    end

    def title_html
      html =<<-HTML
        created task
        <a class="long-link" href="#{product_wip_path(task.product, task)}">
          #{h(task.title)}
        </a>
        <span class="gray-2" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </span>
      HTML
    end

    def icon_class
      "green border-green icon icon-plus"
    end

  end
end
