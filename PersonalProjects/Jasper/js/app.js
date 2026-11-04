(function () {
  "use strict";

  const data = window.JASPER_FANFIC_DATA;
  const storySelect = document.getElementById("storySelect");
  const chapterSelect = document.getElementById("chapterSelect");
  const previousButton = document.getElementById("previousButton");
  const nextButton = document.getElementById("nextButton");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const storyMeta = document.getElementById("storyMeta");
  const chapterTitle = document.getElementById("chapterTitle");
  const chapterSubtitle = document.getElementById("chapterSubtitle");
  const chapterCopy = document.getElementById("chapterCopy");
  const progressKey = "jasper-fanfiction-linear-progress-v1";

  if (!data || !Array.isArray(data.series) || !data.series.length) {
    chapterTitle.textContent = "The library could not be opened";
    chapterCopy.textContent = "The story collection is unavailable in this browser.";
    return;
  }

  let seriesIndex = 0;
  let chapterIndex = 0;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(progressKey) || "{}"); } catch (_) {}

  function saveProgress() {
    try {
      saved[data.series[seriesIndex].series_slug] = chapterIndex;
      localStorage.setItem(progressKey, JSON.stringify(saved));
    } catch (_) {}
  }

  function renderChapter() {
    const series = data.series[seriesIndex];
    const chapter = series.chapters[chapterIndex];
    storyMeta.textContent = series.fandom + " · " + series.series_title + " · " + series.rating;
    chapterTitle.textContent = chapter.title;
    chapterSubtitle.textContent = chapter.subtitle || "";
    chapterSubtitle.hidden = !chapter.subtitle;
    chapterCopy.replaceChildren();
    String(chapter.content || "").split(/\n\s*\n/).filter(Boolean).forEach(function (text) {
      const paragraph = document.createElement("p");
      paragraph.textContent = text.trim();
      chapterCopy.appendChild(paragraph);
    });
    const count = series.chapters.length;
    progressText.textContent = "Chapter " + (chapterIndex + 1) + " of " + count;
    progressBar.value = Math.round(((chapterIndex + 1) / count) * 100);
    previousButton.disabled = chapterIndex === 0;
    nextButton.disabled = chapterIndex === count - 1;
    chapterSelect.value = String(chapterIndex);
    document.title = chapter.title + " · " + series.series_title;
    saveProgress();
  }

  function fillChapters() {
    const series = data.series[seriesIndex];
    chapterSelect.replaceChildren();
    series.chapters.forEach(function (chapter, index) {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = index + 1 + ". " + chapter.title;
      chapterSelect.appendChild(option);
    });
  }

  data.series.forEach(function (series, index) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = series.series_title;
    storySelect.appendChild(option);
  });

  storySelect.addEventListener("change", function () {
    seriesIndex = Number(storySelect.value);
    const slug = data.series[seriesIndex].series_slug;
    chapterIndex = Number.isInteger(saved[slug]) ? saved[slug] : 0;
    fillChapters();
    renderChapter();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  chapterSelect.addEventListener("change", function () {
    chapterIndex = Number(chapterSelect.value);
    renderChapter();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  previousButton.addEventListener("click", function () {
    if (chapterIndex > 0) { chapterIndex -= 1; renderChapter(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  });
  nextButton.addEventListener("click", function () {
    const count = data.series[seriesIndex].chapters.length;
    if (chapterIndex < count - 1) { chapterIndex += 1; renderChapter(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  });

  fillChapters();
  chapterIndex = Number.isInteger(saved[data.series[0].series_slug]) ? saved[data.series[0].series_slug] : 0;
  chapterIndex = Math.max(0, Math.min(chapterIndex, data.series[0].chapters.length - 1));
  renderChapter();
})();
