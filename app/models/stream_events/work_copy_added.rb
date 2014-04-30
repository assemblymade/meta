module StreamEvents
  class WorkCopyAdded < StreamEvent
    def task
      target
    end

    def title_html
      html =<<-HTML
        submitted copy for
        <a href="#{product_wip_path(task.product, task)}">
          #{task.title}
        </a>
        <a class="text-muted" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </a>
      HTML
    end
  end
end
