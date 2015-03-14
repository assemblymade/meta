class ChecklistHandler

  DEFAULT_TILTING_THRESHOLD = 10
  COMMENT_MINIMUM = 5

  def hearts_checklist(entity)
    hearts = {}
    hearts['name'] = "Get some love"
    hearts['editable'] = false

    if entity.class.name == "Idea"
      love = entity.love
    elsif entity.class.name == "Product"
      if entity.idea
        love = entity.idea.love
      else
        love = 0
      end
    else
      love = 0
    end

    hearts['complete'] = love >= DEFAULT_TILTING_THRESHOLD
    if hearts['complete']
      hearts['subtext'] = love.to_s + " hearts"
    else
      hearts['subtext'] = love.to_s + " / "+DEFAULT_TILTING_THRESHOLD.to_s+" hearts"
    end
    hearts
  end

  def pick_name_checklist(entity)
    checklistitem = {}
    checklistitem['name'] = "Pick a name"
    checklistitem['editable'] = true
    if entity.class.name == "Idea"
      name = entity.tentative_name
    elsif entity.class.name == "Product"
      name = entity.name
    end
    checklistitem['subtext'] = name.to_s
    checklistitem['complete'] = ((name != "Unnamed") && (name != nil))
    checklistitem
  end

  def feedback_checklist(entity)
    checklistitem = {}
    checklistitem['name'] = "Get feedback"
    checklistitem['editable'] = false
    if entity.class.name == "Idea"
      comments = entity.comments.count
    elsif entity.class.name == "Product"
      if entity.idea
        comments = entity.idea.comments.count
      else
        comments = 0
      end
    end
    checklistitem['complete'] = comments >= COMMENT_MINIMUM
    checklistitem['subtext'] = comments.to_s + " comments"
    checklistitem
  end

  def idea_checklists(entity)
    idea_checklist = []
    idea_checklist.append(hearts_checklist(entity))
    idea_checklist.append(pick_name_checklist(entity))
    idea_checklist.append(feedback_checklist(entity))
    return idea_checklist
  end

  def committed_people(entity)
    checklistitem = {name: "Find 3 committed people", editable: false, complete: false, subtext: "Comrades at arms"}
  end

  def recruit_checklists(entity)
    recruit_checklist = []
    recruit_checklist.append(committed_people(entity))
  end

  def create_repo(entity)
    repo = {}
    repo = {name: "Create a Github repo", editable: false, complete: false, subtext: "Github Repo Link here"}
  end

  def setup_checklists(entity)
    setup_checklist = []
    setup_checklist.append(create_repo(entity))
  end

  def build_checklists(entity)
  end

  def growth_checklists(entity)
  end

  def checklist_info(entity, stage_number)
    if stage_number == 1
      checklists = idea_checklists(entity)
    elsif stage_number == 2
      checklists = recruit_checklists(entity)
    elsif stage_number == 3
      checklists = setup_checklists(entity)
    elsif stage_number == 4
      checklists = build_checklists(entity)
    elsif stage_number == 5
      checklists = growth_checklists(entity)
    else
      checklists = []
    end
    checklists
  end

  def checklists(entity)
    result = {}
    checklist = []
    s = stages = [["Idea", 1, "Build a Product"], ["Recruiting", 2, "Move to Setup"], ["Setup", 3, "Start Building"], ["Building", 4, "To the Moon"], ["Growth", 5, ""]]
    s.each do |stage|
      stage_info = {name: stage[0], order: stage[1], items: checklist_info(entity, stage[1]), buttonText: stage[2]}
      checklist.append(stage_info)
    end
    result['stages'] = checklist
    result['current_stage'] = 1  #fix later
    result
  end

end
