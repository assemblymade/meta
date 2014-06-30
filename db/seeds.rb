require "./db/development_seeds.rb"

User.create!(name: "Assembly Bot", is_staff: true, email: "asm_bot@assembly.com", username: "asm-bot", password: SecureRandom.uuid)
