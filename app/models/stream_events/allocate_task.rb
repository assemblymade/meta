module StreamEvents
  class AllocateTask < StreamEvent
    def task
      subject
    end

    def title_html
      html =<<-HTML
        started working on
        <a class="long-link" href="#{product_wip_path(task.product, task)}">
          #{h(task.title)}
        </a>
        <a class="gray-2" href="#{product_wip_path(task.product, task)}">
          ##{h(task.number)}
        </a>
      HTML
    end

    def icon_class
      "gray-5 border-gray-5 icon-plus"
    end
  end
end
