/* Editing mode for Pearly's ePortfolio.
   Open the site with #edit at the end of the address (e.g. index.html#edit)
   to edit text, replace photos and remove items, then download the updated page.
   Visitors never see this mode. */
(function () {
  "use strict";
  if (location.hash !== "#edit") return;

  var body = document.body;
  var dirty = false;
  var host = null; /* set when the page is hosted on Claude and can save itself */
  if (window.claude && typeof window.claude.use === "function") {
    window.claude.use("artifact").then(function (ns) {
      host = ns || null;
      if (host) {
        bar.querySelector("[data-act=publish]").hidden = false;
        bar.querySelector("p").innerHTML = '<strong>Editing mode.</strong> Click any text to change it, click a photo or dashed box to replace it, and use Remove to delete an item. When you are done, click Publish changes and the live page updates straight away.';
      }
    }, function () { host = null; });
  }
  body.classList.add("editing");
  document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });

  /* ---------- 1. Editable text ---------- */
  var TEXT = [
    "main h1", "main h2", "main h3", "main h5", "main p", "main li",
    "main figcaption", "main blockquote", "main .badge", "main .meta > span",
    ".contact h2", ".contact p.lead", ".footer-row span"
  ].join(",");
  document.querySelectorAll(TEXT).forEach(function (el) {
    if (el.closest(".filters, .edit-toolbar")) return;
    if (el.parentElement && el.parentElement.closest("[contenteditable='true']")) return;
    el.setAttribute("contenteditable", "true");
    el.setAttribute("spellcheck", "true");
  });
  document.addEventListener("input", function () { dirty = true; setStatus(""); });

  /* Links inside the page should not navigate while editing */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (a && !a.hasAttribute("download") && !a.closest(".site-nav") && !a.closest(".edit-toolbar")) e.preventDefault();
  }, true);

  /* Paste as plain text so formatting from Word or Docs does not come along */
  document.addEventListener("paste", function (e) {
    if (!e.target.closest || !e.target.closest("[contenteditable='true']")) return;
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, text);
  });

  /* ---------- 2. Remove buttons ---------- */
  var REMOVABLE = [
    ".artefact-grid > figure", ".artefact-grid > .artefact-slot",
    ".showcase-grid > .item", ".timeline > li", ".cc-card", ".award-card",
    ".module-card", ".module-card li", ".relation", ".actions > li",
    ".vsk-card", ".exchange-panel li", ".threads li", ".hero-meta .badge",
    ".kolb-stage h5"
  ].join(",");
  function addRemove(el) {
    if (el.querySelector(":scope > .rm-btn")) return;
    el.classList.add("rm-host");
    var b = document.createElement("button");
    b.type = "button"; b.className = "rm-btn"; b.textContent = "Remove";
    b.setAttribute("contenteditable", "false");
    b.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      el.remove(); dirty = true;
      setStatus("Item removed. Reload the page without saving if this was a mistake.");
    });
    el.appendChild(b);
  }
  document.querySelectorAll(REMOVABLE).forEach(addRemove);

  /* ---------- 3. Replace photos and fill placeholders ---------- */
  var picker = document.createElement("input");
  picker.type = "file"; picker.accept = "image/*"; picker.className = "edit-file"; picker.hidden = true;
  body.appendChild(picker);
  var target = null;

  function resize(file, done) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1600, w = img.width, h = img.height;
        if (w > max || h > max) { var r = Math.min(max / w, max / h); w = Math.round(w * r); h = Math.round(h * r); }
        var c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        done(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function slotToFigure(slot, src) {
    var fig = document.createElement("figure");
    fig.className = "artefact";
    fig.innerHTML =
      '<div class="frame" data-zoom tabindex="0" role="button" aria-label="Enlarge photo" data-caption="">' +
      '<img src="" alt="" loading="lazy"></div>' +
      '<figcaption><strong>Title of this artefact</strong>' +
      '<span class="lo">Learning outcome</span>Describe what this artefact shows about your learning.</figcaption>';
    fig.querySelector("img").src = src;
    var cap = fig.querySelector("figcaption");
    cap.setAttribute("contenteditable", "true");
    var item = slot.closest(".showcase-grid > .item");
    if (item) {
      fig.classList.add("item");
      fig.setAttribute("data-cat", item.getAttribute("data-cat") || "");
      var tag = document.createElement("span");
      tag.className = "tag"; tag.textContent = "Category";
      cap.insertBefore(tag, cap.firstChild);
      item.replaceWith(fig);
    } else if (slot.closest(".award-img")) {
      var holder = slot.closest(".award-img");
      holder.innerHTML = ""; var im = document.createElement("img"); im.src = src; im.alt = ""; holder.appendChild(im);
      holder.setAttribute("data-zoom", ""); holder.setAttribute("tabindex", "0"); holder.setAttribute("role", "button");
      return;
    } else {
      slot.replaceWith(fig);
    }
    addRemove(fig);
    cap.focus();
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest(".rm-btn, .add-art")) return;
    var hit = e.target.closest(".frame, .award-img, .portrait-frame, .artefact-slot");
    if (!hit) return;
    e.preventDefault();
    target = hit;
    picker.value = "";
    picker.click();
  });

  picker.addEventListener("change", function () {
    var file = picker.files && picker.files[0];
    if (!file || !target) return;
    resize(file, function (src) {
      if (target.classList.contains("artefact-slot")) {
        slotToFigure(target, src);
      } else {
        var img = target.querySelector("img");
        if (img) { img.src = src; img.removeAttribute("srcset"); }
      }
      dirty = true;
      setStatus("Photo added. Remember to edit its title and learning outcome, then save.");
    });
  });

  /* ---------- 3b. Add more artefacts to any section ---------- */
  document.querySelectorAll(".artefact-grid, .showcase-grid").forEach(function (grid) {
    var add = document.createElement("button");
    add.type = "button"; add.className = "add-art"; add.textContent = "+ Add another artefact";
    add.setAttribute("contenteditable", "false");
    add.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      var slot = document.createElement("div");
      slot.className = "artefact-slot";
      slot.textContent = "[ARTEFACT: New artefact — to be inserted by student]";
      if (grid.classList.contains("showcase-grid")) {
        var item = document.createElement("div");
        item.className = "item"; item.setAttribute("data-cat", add.getAttribute("data-cat") || "");
        item.appendChild(slot); grid.insertBefore(item, add); addRemove(item);
      } else {
        grid.insertBefore(slot, add); addRemove(slot);
      }
      dirty = true;
      target = slot; picker.value = ""; picker.click();
    });
    grid.appendChild(add);
  });

  /* ---------- 4. Toolbar ---------- */
  var bar = document.createElement("div");
  bar.className = "edit-toolbar";
  bar.innerHTML =
    '<p><strong>Editing mode.</strong> Click any text to change it, click a photo or dashed box to replace it, and use Remove to delete an item. When you are done, save the page and upload it to GitHub in place of index.html.</p>' +
    '<button type="button" class="primary" data-act="publish" hidden>Publish changes</button>' +
    '<button type="button" data-act="download">Save page</button>' +
    '<button type="button" data-act="copy">Copy page code</button>' +
    '<button type="button" data-act="exit">Exit</button>' +
    '<span class="edit-status" role="status" aria-live="polite"></span>';
  body.appendChild(bar);
  var status = bar.querySelector(".edit-status");
  function setStatus(t) { status.textContent = t; }

  /* ---------- 5. Build a clean copy of the page ---------- */
  function cleanHTML() {
    var root = document.documentElement.cloneNode(true);
    root.querySelectorAll(".edit-toolbar, .rm-btn, .edit-file, .edit-code, .add-art").forEach(function (n) { n.remove(); });
    root.querySelectorAll("[contenteditable]").forEach(function (n) { n.removeAttribute("contenteditable"); n.removeAttribute("spellcheck"); });
    root.querySelectorAll("[aria-current]").forEach(function (n) { n.removeAttribute("aria-current"); });
    ["in", "editing", "scrolled", "active", "open", "rm-host"].forEach(function (c) {
      root.querySelectorAll("." + c).forEach(function (n) { n.classList.remove(c); });
    });
    root.querySelectorAll("[class='']").forEach(function (n) { n.removeAttribute("class"); });
    var b = root.querySelector("body"); if (b) { b.removeAttribute("style"); if (!b.getAttribute("class")) b.removeAttribute("class"); }
    var t = root.querySelector(".nav-toggle"); if (t) t.setAttribute("aria-expanded", "false");
    var lb = root.querySelector(".lightbox");
    if (lb) { lb.setAttribute("aria-hidden", "true"); var li = lb.querySelector("img"); if (li) li.setAttribute("src", ""); var lc = lb.querySelector("figcaption"); if (lc) lc.textContent = ""; }
    root.querySelectorAll("main p, main li, main h5").forEach(function (n) {
      if (!n.textContent.trim() && !n.querySelector("img")) n.remove();
    });
    root.querySelectorAll("figure.artefact").forEach(function (f) {
      var img = f.querySelector("img"); var title = f.querySelector("figcaption strong");
      var name = title ? title.textContent.trim() : "";
      if (img && !img.getAttribute("alt") && name) img.setAttribute("alt", name);
      var fr = f.querySelector(".frame");
      if (fr && name) { fr.setAttribute("aria-label", "Enlarge photo of " + name); if (!fr.getAttribute("data-caption")) fr.setAttribute("data-caption", name); }
    });
    return "<!DOCTYPE html>\n" + root.outerHTML;
  }

  function fromSource(done) {
    var clean = new DOMParser().parseFromString(cleanHTML(), "text/html");
    fetch("index.html", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("fetch"); return r.text(); })
      .then(function (src) {
        var start = src.indexOf('<main id="main">');
        var end = src.search(/<script src="(js\/)?main\.js"/);
        var main = clean.querySelector("main"), foot = clean.querySelector("footer.contact"), lb = clean.querySelector(".lightbox");
        if (start < 0 || end < 0 || !main || !foot || !lb) throw new Error("shape");
        done(src.slice(0, start) + main.outerHTML + "\n\n" + foot.outerHTML + "\n\n" + lb.outerHTML + "\n\n" + src.slice(end));
      })
      .catch(function () { done(cleanHTML()); });
  }

  function showCode(html) {
    var wrap = document.createElement("div");
    wrap.className = "edit-code";
    wrap.innerHTML = '<div><p>Select all of the code below, copy it, and paste it into index.html on GitHub.</p><textarea readonly></textarea><button type="button">Close</button></div>';
    wrap.querySelector("textarea").value = html;
    wrap.querySelector("button").addEventListener("click", function () { wrap.remove(); });
    body.appendChild(wrap);
    wrap.querySelector("textarea").select();
  }

  bar.addEventListener("click", function (e) {
    var act = e.target.getAttribute && e.target.getAttribute("data-act");
    if (!act) return;
    if (act === "publish") {
      if (!host) { setStatus("Publishing is only available on the page hosted on Claude. Use Save page instead."); return; }
      e.target.disabled = true;
      setStatus("Publishing your changes...");
      fromSource(function (html) {
        host.publish(html).then(function () {
          dirty = false;
          setStatus("Published. The page will reload with your changes. Add #edit to the address again to keep editing.");
        }, function (err) {
          e.target.disabled = false;
          var msg = (err && (err.code || err.message)) || "";
          if (String(msg).indexOf("conflict") !== -1) setStatus("The page was changed elsewhere and has reloaded. Please make your edit again.");
          else if (/not_granted|not_writer/.test(String(msg))) setStatus("Only the owner of this page can publish changes.");
          else setStatus("The changes could not be published. Please try again, or use Save page.");
        });
      });
      return;
    }
    if (act === "download") {
      fromSource(function (html) {
      try {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
        a.download = "index.html";
        body.appendChild(a); a.click(); a.remove();
        dirty = false;
        setStatus("Saved as index.html in your downloads. If no file appeared, use Copy page code instead.");
      } catch (err) {
        showCode(html);
      }
      });
    }
    if (act === "copy") {
      fromSource(function (code) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function () {
          dirty = false;
          setStatus("Page code copied. Paste it into index.html on GitHub and commit.");
        }, function () { showCode(code); });
      } else { showCode(code); }
      });
    }
    if (act === "exit") {
      if (dirty) {
        var leave = true;
        try { leave = window.confirm("You have unsaved changes. Leave editing mode anyway?"); } catch (err) { leave = true; }
        if (!leave) return;
      }
      dirty = false;
      location.hash = "";
      location.reload();
    }
  });

  window.addEventListener("beforeunload", function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ""; }
  });
})();
