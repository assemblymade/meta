module StreamEvents
  class CreateTask < StreamEvent
    def task
      subject
    end

    def title_html
      html =<<-HTML
        created task
        <a class="long-link" href="#{product_wip_path(task.product, task)}">
          #{task.title}
        </a>
        <span class="text-muted" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </span>
      HTML
    end
  end
end
