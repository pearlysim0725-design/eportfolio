# Pearly Sim — SUSS HRM ePortfolio

A static website: plain HTML, CSS and JavaScript. Nothing to install, no build step. Opening `index.html` in a browser shows the full site.

## Put it online with GitHub Pages (free, about 15 minutes)

1. **Create a GitHub account** at https://github.com/signup. Your username becomes part of your link. For example, `pearlysim` gives `https://pearlysim.github.io/eportfolio/`.
2. **Create a repository.** Click **+** (top right), then **New repository**. Name it `eportfolio`, set it to **Public**, and click **Create repository**.
3. **Upload the files.** On the new repository page, click **uploading an existing file**. Unzip `eportfolio.zip` on your computer and drag in everything inside the `eportfolio` folder: `index.html`, `README.md`, and the `css`, `js` and `assets` folders. Click **Commit changes**.
   - Check that `index.html` sits at the top level of the repository, not inside another folder.
4. **Turn on Pages.** Go to **Settings**, then **Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, Branch to **main**, and folder to **/ (root)**. Click **Save**.
5. After one or two minutes, refresh the page. Your link appears at the top: `https://<your-username>.github.io/eportfolio/`.
6. **If your username is not `pearlysim`**, open `index.html` on GitHub (pencil icon) and replace `https://pearlysim.github.io/eportfolio/` in the `<head>` with your real link. It appears three times. Commit.
7. Open the link on your phone and on a laptop to check it, then paste it into the SUSS ePortfolio submission form.

## Editing the site yourself (no coding needed)

1. Open your site with `#edit` added to the end of the address, for example `https://pearlysim.github.io/eportfolio/#edit`. You can also open `index.html` on your computer and add `#edit` to the address.
2. A dark toolbar appears at the bottom of the page. Click any text to change it. Click any photo, or any dashed placeholder box, to choose a photo from your computer. Use the red **Remove** buttons to delete an item.
3. Click **Save page**. A file called `index.html` is saved to your downloads. Photos you add are stored inside this file, so you do not need to upload them separately.
4. On GitHub, open your `eportfolio` repository, click **Add file**, then **Upload files**, drag in the new `index.html`, and click **Commit changes**. The live site updates within a minute or two.
5. If **Save page** does not produce a file, click **Copy page code**. Then open `index.html` on GitHub, click the pencil icon, select all the old text, paste, and commit.

Visitors never see editing mode. It only appears when `#edit` is at the end of the address.

## Filling in the remaining artefact slots by hand

Dashed boxes that read `[ARTEFACT: ... — to be inserted by student]` are placeholders. To replace one with a photo:

1. Upload the photo into the right folder under `assets/` (e.g. `assets/penang/penang-hill.jpg`). Keep photos under about 500 KB; resizing to 1600px wide is plenty.
2. In `index.html`, find the placeholder line, for example:
   ```html
   <div class="artefact-slot">[ARTEFACT: Penang Hill forest catchment ... — to be inserted by student]</div>
   ```
3. Replace it with:
   ```html
   <figure class="artefact">
     <div class="frame" data-zoom tabindex="0" role="button" aria-label="Enlarge photo: Penang Hill" data-caption="Penang Hill forest catchment, NIE351, May 2025.">
       <img src="assets/penang/penang-hill.jpg" alt="Describe what is in the photo" loading="lazy">
     </div>
     <figcaption><strong>Penang Hill</strong><span class="lo">Learning outcome:</span> what this photo shows you learnt.</figcaption>
   </figure>
   ```
   Placeholders inside the Showcase grid sit inside `<div class="item" data-cat="...">`. Keep that outer `div`, or move its `data-cat` value onto the new `<figure class="artefact item" data-cat="...">`.

### Embedding the NIE351 group video

Upload the video to YouTube as **Unlisted**. Click **Share**, then **Embed**, and copy the code. Replace the video placeholder with:

```html
<div class="artefact-slot wide" style="padding:0;border:0;box-shadow:none">
  <iframe style="width:100%;height:100%;border:0" src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="NIE351 group video presentation" allowfullscreen loading="lazy"></iframe>
</div>
```

A Google Drive link set to "Anyone with the link" also works if you would rather not use YouTube.

## Remaining placeholders

| Section | Artefact |
|---|---|
| Across Borders | Penang Hill and Kampung Sungai Chenaam photos; NIE351 group video |
| In the Workplace | Photo from the 2026 internship |
| In the Community | SUSS STARs Experiential Teambuilding photo |
| Showcase | STARs photo; Taekwondo photo; 2026 internship photo; Penang photos |

## Timeline

- SUSS reviews early submissions if you submit at least **2 months before the deadline**. For the 30 June 2027 deadline, submit by **30 April 2027** and email ePortfolio@suss.edu.sg to ask for a review.
- After HRM499 (Jan 2027), you may wish to add your capstone, and update "Last updated" in the footer.

## File structure

```
eportfolio/
├── index.html
├── css/style.css
├── js/main.js
├── assets/
│   ├── shenzhen/  penang/  aalborg/
│   ├── forvis-mazars/  bank-of-america/  community/
│   ├── certs/  profile/  icons/
└── README.md
```
