module StreamEvents
  class CompleteCompletedMission < StreamEvent

    def highlight?
      true
    end

    def important?
      true
    end

    def completed_mission
      subject
    end

    def title_html
      #I18n.t("missions.#{mission_id}.reward_description")
      #{I18n.t("missions.#{completed_mission.id}.reward")}
      html =<<-HTML
        completed a goal

        <span class="long-link">
          and unlocked the
          <a href="#{product_path(product)}">
            #{I18n.t("missions.#{completed_mission.mission_id}.reward")}
          </a>
        </span>
      HTML
    end

    def icon_class
      "marker-green icon-star"
    end

  end
end
