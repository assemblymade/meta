module StreamEvents
  class AllocateTask < StreamEvent
    def task
      subject
    end

    def title_html
      html =<<-HTML
        started working on
        <a class="long-link" href="#{product_wip_path(task.product, task)}">
          #{task.title}
        </a>
        <a class="text-muted" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </a>
      HTML
    end

    def icon_class
      "marker-default icon-plus"
    end
  end
end
