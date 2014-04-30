module StreamEvents
  class DemoteTask < StreamEvent
    def task
      subject
    end

    def title_html
      html =<<-HTML
        demoted task
        <a class="long-link" href="#{product_wip_path(task.product, task)}">
          #{task.title}
        </a>
        <a class="text-muted" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </a>
      HTML
    end
  end
end
