class ChecklistHandler

  DEFAULT_TILTING_THRESHOLD = Idea::DEFAULT_TILTING_THRESHOLD
  COMMENT_MINIMUM = Idea::COMMENT_MINIMUM

  def hearts_checklist(entity)
    hearts = {}
    hearts['name'] = "Validate people want this"
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

    hearts_remaining = DEFAULT_TILTING_THRESHOLD - love

    if hearts['complete'] = love >= DEFAULT_TILTING_THRESHOLD
      subtext = "#{DEFAULT_TILTING_THRESHOLD} or more hearts received"
    else
      subtext = "Get #{hearts_remaining} more #{"heart".pluralize(hearts_remaining)}"
    end
    hearts['subtext'] = subtext
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

    if !name
      name = "Discuss potential names in the comments"
    end

    checklistitem['subtext'] = name.to_s
    checklistitem['complete'] = name.present? && name != "Discuss potential names in the comments"
    checklistitem['editable_button_text'] = "Set tentative name"
    checklistitem['editable_type'] = "tentative_name"
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
    comments_remaining = COMMENT_MINIMUM - comments

    if checklistitem['complete'] = comments >= COMMENT_MINIMUM
      subtext = "#{COMMENT_MINIMUM} or more comments received"
    else
      subtext = "Get #{comments_remaining} more #{"comment".pluralize(comments_remaining)}"
    end
    checklistitem['subtext'] = subtext
    checklistitem
  end

  def idea_checklists(entity)
    idea_checklist = []
    idea_checklist.append(hearts_checklist(entity))
    idea_checklist.append(feedback_checklist(entity))
    idea_checklist.append(pick_name_checklist(entity))
    return idea_checklist
  end

  def committed_people(entity)
    checklistitem = {name: "Find 3 committed people", editable: false, complete: false, subtext: "Comrades at arms"}
  end

  def init_equity(entity)
    checklistitem = {name: "Distribute Founder Ownership", editable: false, complete: false, subtext: "Set up initial ownership"}
  end

  def recruit_checklists(entity)
    recruit_checklist = []
    recruit_checklist.append(committed_people(entity))
    recruit_checklist.append(init_equity(entity))
  end

  def create_repo(entity)
    repo = {}
    repo = {name: "Create a Github repo", editable: false, complete: false, subtext: "Github Repo Link here"}
  end

  def role_roster(entity)
    checklistitem = {name: "Come up with a roles roster", editable: false, complete: false, subtext: "What roles will you need?  You can assign people later."}
  end

  def dev_env_guide(entity)
    checklistitem = {name: "Write a developer", editable: false, complete: false, subtext: ""}
  end

  def first_bounties(entity)
    checklistitem = {name: "Write your first 4 bounties", editable: false, complete: false, subtext: "Layout first steps"}
  end

  def setup_checklists(entity)
    setup_checklist = []
    setup_checklist.append(create_repo(entity))
    setup_checklist.append(role_roster(entity))
  end

  def award_bounties(entity)
    checklistitem = {name: "Award 10 bounties", editable: false, complete: false, subtext: "Award completed bounties."}
  end

  def launch(entity)
    checklistitem = {name: "Officially Launch", editable: false, complete: false, subtext: "Go through Assembly Launch procedures!"}
  end

  def build_checklists(entity)
    build_checklist = []
    build_checklist.append(award_bounties(entity))
    build_checklist.append(launch(entity))
  end

  def monetization(entity)
    checklistitem = {name: "Come up with a Monetization Strategy", editable: false, complete: false, subtext: "Write a post about monetization"}
  end

  def refine(entity)
    checklistitem = {name: "Refine your product with more Bounties", editable: false, complete: false, subtext: "Write 20 more bounties to refine the product"}
  end

  def contributors(entity)
    checklistitem = {name: "Get more contributors to up your game", editable: false, complete: false, subtext: "Get 15 more contributors to get more insight"}
  end

  def growth_checklists(entity)
    growth_checklist = []
    growth_checklist.append(monetization(entity))
    growth_checklist.append(refine(entity))
    growth_checklist.append(contributors(entity))
  end

  def checklist_info(entity, stage_number)
    if stage_number == 0
      checklists = idea_checklists(entity)
    elsif stage_number == 1
      checklists = recruit_checklists(entity)
    elsif stage_number == 2
      checklists = build_checklists(entity)
    elsif stage_number == 3
      checklists = growth_checklists(entity)
    else
      checklists = []
    end
    checklists
  end

  def progressable(info)
    c = true
    info.each do |a|
      if a['complete'] == false
        c = false
      end
    end
    c
  end

  def checklists(entity)
    result = {}
    checklist = []
    s = stages = [["Idea", 0, "Build a Product", "Move this idea forward"], ["Recruitment", 1, "Move to Setup"], ["Building", 2, "To the Moon"], ["Growth", 3, "Grow an Industrial Empire"]]
    s.each do |stage|
      info = checklist_info(entity, stage[1])
      stage_info = {name: stage[0], order: stage[1], items: info, buttonText: stage[2], cta: stage[3], can_progress: progressable(info)}
      checklist.append(stage_info)
    end
    result['stages'] = checklist
    result['current_stage'] = 0
    c = true
    result['button_texts'] = stages.map{|a| a[2]}
    result
  end

end
