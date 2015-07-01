module StreamEvents
  class WorkCopyAdded < StreamEvent
    def task
      target
    end

    def title_html
      html =<<-HTML
        submitted copy for
        <a href="#{product_wip_path(task.product, task)}">
          #{h(task.title)}
        </a>
        <a class="gray-2" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </a>
      HTML
    end

    def icon_class
      "blue border-blue icon-pencil"
    end
  end
end
