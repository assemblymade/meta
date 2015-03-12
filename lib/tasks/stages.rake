namespace :stages do

  task :create_stages => :environment do
    Stage.all.delete_all
    ChecklistType.delete_all

    idea = Stage.create!({name: "Idea", description: "Every great business begins as an idea", order: 1})
    name = ChecklistType.create!({name: "Pick a name", description: "Your name need not be permanent.  But you'll need a placeholder.", stage_id: idea.id})
    affirmation = ChecklistType.create({name: "Find 10 people to heart your idea", description:
      "Getting people to review your idea is crucial!", stage_id: idea.id})
    describe = ChecklistType.create({name: "Describe your Idea", description: "Describe the idea: how it works, why is it awesome.", stage_id: idea.id})

    recruitment = Stage.create!({name: "Recruitment", description:
      "Find the partners who can help build something amazing", order: 2})
    ChecklistType.create!({name: "Create a Role Roster", stage_id: recruitment.id})
    ChecklistType.create!({name: "Find 3 Committed People", stage_id: recruitment.id})
    ChecklistType.create!({name: "Initialize Equity", stage_id: recruitment.id})
    ChecklistType.create!({name: "Reach out to 10 people", stage_id: recruitment.id})

    setup = Stage.create!({name: "Get Started", description: "Lay the groundwork for a thriving project.", order: 3})
    ChecklistType.create!({name: "Create a Github Repo", stage_id: setup.id})
    ChecklistType.create!({name: "Write a Product FAQ", stage_id: setup.id})
    ChecklistType.create!({name: "Write dev environment instructions", stage_id: setup.id})

    mvp = Stage.create!({name: "Build an MVP", description: "Build a minimum viable product.  Create something beautiful.", order: 4})
    launch = Stage.create!({name: "Launch", description: "Take your product to the people.  Let it soar.", order: 5})
    grow = Stage.create!({name: "Grow", description: "Take your product to the next level. Iterate, improve, and grow. The world is yours for the taking.", order: 6})

  end





end
