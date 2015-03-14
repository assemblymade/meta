class ChecklistHandler

  DEFAULT_TILTING_THRESHOLD = 10
  COMMENT_MINIMUM = 5

  def hearts_checklist(entity)
    hearts = {}
    hearts['title'] = "Get some love"
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

    hearts['state'] = love >= DEFAULT_TILTING_THRESHOLD
    if hearts['state']
      hearts['smalltext'] = love.to_s + " hearts"
    else
      hearts['smalltext'] = love.to_s + " / "+DEFAULT_TILTING_THRESHOLD.to_s+" hearts"
    end
    hearts
  end

  def pick_name_checklist(entity)
    checklistitem = {}
    checklistitem['title'] = "Pick a name"
    checklistitem['editable'] = true
    if entity.class.name == "Idea"
      name = entity.tentative_name
    elsif entity.class.name == "Product"
      name = entity.name
    end
    checklistitem['smalltext'] = name.to_s
    checklistitem['state'] = ((name != "Unnamed") && (name != nil))
    checklistitem
  end

  def feedback_checklist(entity)
    checklistitem = {}
    checklistitem['title'] = "Get feedback"
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
    checklistitem['state'] = comments >= COMMENT_MINIMUM
    checklistitem['smalltext'] = comments.to_s + " comments"
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
    checklistitem = {title: "Find 3 committed people", editable: false, state: false, smalltext: "Comrades at arms"}
  end

  def recruit_checklists(entity)
    recruit_checklist = []
    recruit_checklist.append(committed_people(entity))
  end

  def create_repo(entity)
    repo = {}
    repo = {title: "Create a Github repo", editable: false, state: false, smalltext: "Github Repo Link here"}
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
    s = stages = [["Idea", 1], ["Recruiting", 2], ["Setup", 3], ["Building", 4], ["Growth", 5]]
    s.each do |stage|
      stage_info = {name: stage[0], order: stage[1], items: checklist_info(entity, stage[1])}
      checklist.append(stage_info)
    end
    result['checklist_items'] = checklist
    result['current_stage'] = 1  #fix later
    result
  end

end
