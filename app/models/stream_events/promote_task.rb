module StreamEvents
  class PromoteTask < StreamEvent
    def task
      subject
    end

    def title_html
      html =<<-HTML
        promoted task
        <a class="long-link" href="#{product_wip_path(task.product, task)}">
          #{task.title}
        </a>
        <a class="text-muted" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </a>
      HTML
    end

    def icon_class
      "marker-purple icon-double-chevron-up"
    end
  end
end
