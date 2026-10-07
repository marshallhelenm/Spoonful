ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "inertia_rails/minitest"

# Build frontend assets once, before tests fork into parallel workers. Otherwise
# every worker tries to rebuild them at the same moment after a frontend change,
# and some page requests fail while the build output is half-written.
ViteRuby.commands.build || abort("Vite build failed; see log/test.log")

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end
