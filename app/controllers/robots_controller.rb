class RobotsController < ApplicationController

  TEMPLATE = <<~TEXT.freeze
    # See http://www.robotstxt.org/robotstxt.html for documentation on how to use the robots.txt file

    User-agent: *
    Allow: /
    Disallow: *?fbclid=*
    Disallow: *?_ke=*
    Disallow: *q=*
    Disallow: /*?utm_source=
    Disallow: /maintenance
    Disallow: /users

    Sitemap: https://%s/sitemap.xml.gz
  TEXT

  def txt
    expires_in 1.day, public: true
    text = format TEMPLATE, request.host
    render plain: text
  end

end
