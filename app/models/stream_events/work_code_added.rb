module StreamEvents
  class WorkCodeAdded < StreamEvent

    def task
      target
    end

    def title_html
      html =<<-HTML
        made a pull request for
        <a class="long-link" href="#{product_wip_path(task.product, task)}">
          #{h(task.title)}
        </a>
        <a class="gray-2" href="#{product_wip_path(task.product, task)}">
          ##{task.number}
        </a>
      HTML
    end

    def icon_class
      "blue border-blue icon-pull-request"
    end
  end
end
