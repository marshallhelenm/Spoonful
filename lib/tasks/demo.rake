namespace :demo do
  desc "Reset the shared demo account to just the sample recipes (run nightly in production)"
  task reset: :environment do
    user = DemoAccount.reset!
    puts "Reset demo account #{user.email_address}: #{user.recipes.count} recipes"
  end
end
