module StreamEvents
  class UnallocateTask < StreamEvent
    def task
      subject
    end

    def title_html
      html =<<-HTML
        stopped working on
        <a class="long-link" href="#{product_wip_path(task.product, task)}">
          #{h(ask.title)}
        </a>
        <a class="gray-2" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </a>
      HTML
    end
  end
end
