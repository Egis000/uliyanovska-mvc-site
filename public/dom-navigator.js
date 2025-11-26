(function () {
    const pages = ["index.html", "page1.html", "page2.html", "page3.html"];

    document.addEventListener("DOMContentLoaded", () => {
        const startBtn = document.getElementById("startDomNav");
        if (!startBtn) return;

        startBtn.addEventListener("click", () => {
            startBtn.disabled = true;
            loadAllPages(pages, (err, allPages) => {
                startBtn.disabled = false;
                if (err) {
                    alert("Помилка при завантаженні сторінок: " + err);
                    return;
                }
                const combined = buildCombinedList(allPages);
                startNavigation(combined);
            });
        });
    });

    function loadAllPages(list, callback) {
        const results = [];
        let i = 0;

        function next() {
            if (i >= list.length) {
                callback(null, results);
                return;
            }
            const url = list[i];
            fetch(url, {cache: "no-store"})
                .then(resp => {
                    if (!resp.ok) throw new Error(`${url} - status ${resp.status}`);
                    return resp.text();
                })
                .then(text => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, "text/html");
                    results.push({ name: url, doc: doc });
                    i++;
                    next();
                })
                .catch(err => {
                    callback(err.message || String(err));
                });
        }

        next();
    }

    function buildCombinedList(pagesData) {
        const combined = [];

        pagesData.forEach(pageObj => {
            const pageName = pageObj.name;
            const doc = pageObj.doc;
            const body = doc.body;
            if (!body) return;
            const elems = Array.from(body.getElementsByTagName("*"));
            elems.forEach(el => {
                const path = buildPath(el);
                const text = (el.textContent || "").trim();
                const snippet = text.length ? text.split(/\s+/).slice(0, 8).join(" ") + (text.split(/\s+/).length > 8 ? "..." : "") : "";
                combined.push({
                    page: pageName,
                    node: el,
                    path: path,
                    snippet: snippet
                });
            });
        });

        return combined;
    }

    function buildPath(node) {
        const parts = [];
        let cur = node;
        while (cur && cur.tagName) {
            const tag = cur.tagName.toLowerCase();
            let name = tag;

            if (cur.id) {
                name += `#${cur.id}`;
            }

            if (cur.className && typeof cur.className === "string") {
                const cls = cur.className.trim().split(/\s+/).filter(Boolean).join(".");
                if (cls) name += `.${cls}`;
            }

            parts.unshift(name);

            if (tag === "body") break;
            cur = cur.parentElement;
        }
        return parts.join(" > ");
    }

    function startNavigation(combined) {
        if (!combined || combined.length === 0) {
            alert("Немає елементів для навігації.");
            return;
        }

        let idx = 0;

        function showNode(cb) {
            const item = combined[idx];
            const page = item.page;
            const path = item.path || "(шлях не визначено)";
            const snippet = item.snippet ? ` [ ${item.snippet} ]` : "";

            let message = `${page} > ${path}${snippet}\n\n`;

            if (idx === 0) {
                message = `Перший вузол:\n${page} > ${path}${snippet}\n\nПерейти далі (OK) чи завершити (Скасувати)?`;
                cb(confirm(message) ? "next" : "exit");
                return;
            }

            if (idx === combined.length - 1) {
                message = `Останній вузол:\n${page} > ${path}${snippet}\n\nПовернутись назад (OK) чи завершити (Скасувати)?`;
                cb(confirm(message) ? "back" : "exit");
                return;
            }

            message = `Поточний вузол:\n${page} > ${path}${snippet}\n\nПерейти далі (OK) чи повернутись (Скасувати)?`;
            cb(confirm(message) ? "next" : "back");
        }

        function navigate() {
            showNode(action => {
                if (action === "next") {
                    if (idx < combined.length - 1) idx++;
                    navigate();
                } else if (action === "back") {
                    if (idx > 0) idx--;
                    navigate();
                } else { // exit
                    alert("Навігацію завершено.");
                }
            });
        }

        navigate();
    }

})();
