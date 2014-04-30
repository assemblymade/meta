# You can use `rake secret` to generate a secure secret key.
ASM::Application.config.secret_key_base = ENV['SECRET_KEY_BASE'] || 'asm-secret'
