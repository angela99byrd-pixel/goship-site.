(function () {
  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fetchJSON(path) {
    return fetch(path, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("failed " + path);
      return res.json();
    });
  }

  // ---- SEO: title + meta description (editable per page from admin) ----
  fetchJSON("content/seo.json").then(function (seo) {
    var page = location.pathname.split("/").pop() || "index.html";
    var entry = seo[page];
    if (!entry) return;
    if (entry.title) document.title = entry.title;
    if (entry.description) {
      var meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", entry.description);
    }
  }).catch(function () {});

  // ---- Contact info (top bar + footer + CTA phone link) ----
  fetchJSON("content/settings.json").then(function (s) {
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.setAttribute("href", "tel:" + s.phone_tel);
      var icon = a.querySelector("i");
      a.innerHTML = "";
      if (icon) a.appendChild(icon);
      a.appendChild(document.createTextNode(" " + s.phone));
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      a.setAttribute("href", "mailto:" + s.email);
      var icon = a.querySelector("i");
      a.innerHTML = "";
      if (icon) a.appendChild(icon);
      a.appendChild(document.createTextNode(" " + s.email));
    });
  }).catch(function () {});

  // ---- Services scroller on homepage ----
  var scroller = document.querySelector(".serv .scroller");
  if (scroller) {
    fetchJSON("content/services.json").then(function (data) {
      scroller.innerHTML = data.services.map(function (svc) {
        return '<a href="services.html#' + svc.slug + '" class="scard">' +
          '<div class="thumb"><img src="' + svc.image + '" alt=""></div>' +
          '<div class="body"><div class="ico"><i class="fa-solid ' + svc.icon + '"></i></div>' +
          "<h3>" + esc(svc.title) + "</h3><p>" + esc(svc.description) + "</p>" +
          '<span class="more">Learn more <i class="fa-solid fa-chevron-right"></i></span></div></a>';
      }).join("");
    }).catch(function () {});
  }

  // ---- Reviews grid on homepage ----
  var revgrid = document.querySelector(".revgrid");
  if (revgrid) {
    fetchJSON("content/reviews.json").then(function (data) {
      revgrid.innerHTML = data.reviews.map(function (r) {
        var stars = "";
        for (var i = 0; i < 5; i++) {
          stars += '<i class="fa-solid fa-star' + (i < r.rating ? "" : " off") + '"></i>';
        }
        return '<div class="rcard"><div class="stars">' + stars + '</div>' +
          '<p class="txt">' + esc(r.text) + '</p>' +
          '<div class="who"><img src="' + r.avatar + '" alt=""><div><div class="n">' + esc(r.name) + '</div><div class="l">' + esc(r.route) + "</div></div></div></div>";
      }).join("");
    }).catch(function () {});
  }

  // ---- FAQ grid (homepage + help.html) ----
  ["faqgrid", "help-faq"].forEach(function (id) {
    var el = id === "faqgrid" ? document.querySelector(".faqgrid") : document.getElementById(id);
    if (!el) return;
    fetchJSON("content/faq.json").then(function (data) {
      el.innerHTML = data.faq.map(function (item, index) {
        return "<details" + (index === 0 ? " open" : "") + "><summary>" + esc(item.question) +
          ' <span class="pm"><i class="fa-solid fa-plus plus"></i><i class="fa-solid fa-minus minus"></i></span></summary>' +
          '<div class="ans">' + esc(item.answer) + "</div></details>";
      }).join("");
    }).catch(function () {});
  });

  // ---- Blog list on blog.html ----
  var blogList = document.getElementById("blog-list");
  if (blogList) {
    fetchJSON("content/blog.json").then(function (data) {
      blogList.innerHTML = data.posts.map(function (post) {
        var d = new Date(post.date);
        var dateStr = isNaN(d) ? post.date : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        return '<div class="card"><div class="thumb"><img src="' + post.image + '" alt=""></div>' +
          '<div class="body"><div class="ico"><i class="fa-solid fa-newspaper"></i></div>' +
          '<p style="font-size:12px;color:var(--slate-500)">' + esc(dateStr) + "</p>" +
          "<h3>" + esc(post.title) + "</h3><p>" + esc(post.excerpt) + "</p>" +
          '<p style="margin-top:10px;font-size:13px;color:var(--slate-600)">' + esc(post.body) + "</p></div></div>";
      }).join("");
    }).catch(function () {});
  }

  // ---- Contact page info ----
  fetchJSON("content/settings.json").then(function (s) {
    var phoneEl = document.getElementById("contact-phone");
    var emailEl = document.getElementById("contact-email");
    var hoursEl = document.getElementById("contact-hours");
    if (phoneEl) phoneEl.textContent = s.phone;
    if (emailEl) emailEl.textContent = s.email;
    if (hoursEl) hoursEl.innerHTML = esc(s.hours_weekday) + "<br>" + esc(s.hours_weekend);
  }).catch(function () {});

})();
