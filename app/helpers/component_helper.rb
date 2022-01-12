module ComponentHelper
  def navigation_items
    # TODO: Populate this list with all the same links as the Bootstrap template
    [
      { text: "Home", href: "/" },
      { text: "People", href: "/government/admin/people" }, # TODO: use helpers here
    ]
  end
end
