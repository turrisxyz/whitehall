When /^I visit the list of policies awaiting review$/ do
  visit submitted_admin_policies_path
end

When /^I view the policy titled "([^"]*)"$/ do |title|
  click_link title
end

Then /^I should see that "([^"]*)" is the policy author$/ do |name|
  assert page.has_css?(".policy .author", :text => name)
end

Then /^I should see that "([^"]*)" is the policy body$/ do |policy_body|
  assert page.has_css?(".policy .body", :text => policy_body)
end

When /^I publish the policy called "([^"]*)"$/ do |arg1|
  click_button "Publish"
end

Then /^I should be warned that I am not the second set of eyes$/ do
  assert page.has_css?(".flash.warning", :text => "You are not the second set of eyes")
end