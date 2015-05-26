module StreamEvents
  class DemoteTask < StreamEvent
    def task
      subject
    end

    def title_html
      html =<<-HTML
        demoted task
        <a class="long-link" href="#{product_wip_path(task.product, task)}">
          #{h(task.title)}
        </a>
        <a class="gray-2" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </a>
      HTML
    end

    def icon_class
      "purple border-purple icon-chevron-down"
    end
  end
end
