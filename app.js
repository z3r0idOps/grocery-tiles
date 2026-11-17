(function () {
  "use strict";

  var STORAGE_KEY = "groceryTiles.v1";
  var CURRENT_VERSION = 1;

  var SEED_POOL = [
    ["Produce", ["Bananas", "Apples", "Tomatoes", "Onions", "Potatoes", "Carrots", "Lettuce", "Avocado"]],
    ["Dairy", ["Milk", "Eggs", "Butter", "Cheese", "Yogurt"]],
    ["Bakery", ["Bread", "Bagels"]],
    ["Meat", ["Chicken", "Ground Beef", "Bacon"]],
    ["Pantry", ["Rice", "Pasta", "Cereal", "Coffee", "Sugar", "Flour", "Olive Oil"]],
    ["Frozen", ["Frozen Pizza", "Ice Cream"]],
    ["Household", ["Paper Towels", "Toilet Paper", "Dish Soap"]]
  ];

  var CATEGORY_ORDER = SEED_POOL.map(function (g) { return g[0]; }).concat(["Other"]);

  function slugify(name) {
    return "p_" + name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  function freshState() {
    var pool = [];
    SEED_POOL.forEach(function (group) {
      var category = group[0];
      group[1].forEach(function (name) {
        pool.push({ id: slugify(name), name: name, category: category });
      });
    });
    return { version: CURRENT_VERSION, pool: pool, list: [] };
  }

  function isValidState(state) {
    if (!state || typeof state !== "object") return false;
    if (!Array.isArray(state.pool) || !Array.isArray(state.list)) return false;
    return state.pool.every(function (t) {
      return t && typeof t.id === "string" && typeof t.name === "string";
    }) && state.list.every(function (e) {
      return e && typeof e.id === "string" && typeof e.collected === "boolean";
    });
  }

  var MIGRATIONS = {
    // 1 -> 2 would go here in the future
  };

  function migrate(state) {
    while (state.version < CURRENT_VERSION && MIGRATIONS[state.version]) {
      state = MIGRATIONS[state.version](state);
      state.version++;
    }
    return state;
  }

  function load() {
    var raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return freshState();
    }
    if (!raw) return freshState();
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return freshState();
    }
    if (!isValidState(parsed)) return freshState();
    return migrate(parsed);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // storage unavailable/full — state stays in-memory for this session
    }
  }

  function makeCustomId() {
    return "c_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  var state = load();
  var currentView = "catalog";
  var addingTile = false;
  var pendingDeleteId = null;
  var pendingClearList = false;
  var pendingUncheckId = null;
  var drag = null;
  var suppressNextClick = false;

  var DRAG_MOVE_THRESHOLD = 6;
  var LONG_PRESS_MS = 350;
  var LONG_PRESS_MOVE_TOLERANCE = 10;

  function poolTileById(id) {
    for (var i = 0; i < state.pool.length; i++) {
      if (state.pool[i].id === id) return state.pool[i];
    }
    return null;
  }

  function listEntryById(id) {
    for (var i = 0; i < state.list.length; i++) {
      if (state.list[i].id === id) return state.list[i];
    }
    return null;
  }

  function addToList(id) {
    if (listEntryById(id)) return;
    state.list.push({ id: id, collected: false });
    save();
  }

  function removeFromList(id) {
    state.list = state.list.filter(function (e) { return e.id !== id; });
    save();
  }

  function toggleCollected(id) {
    var entry = listEntryById(id);
    if (!entry) return;
    entry.collected = !entry.collected;
    save();
  }

  function deleteTile(id) {
    state.pool = state.pool.filter(function (t) { return t.id !== id; });
    state.list = state.list.filter(function (e) { return e.id !== id; });
    save();
  }

  function setTileCategory(id, category) {
    var tile = poolTileById(id);
    if (!tile || tile.category === category) return;
    tile.category = category;
    save();
  }

  function clearDropHighlight() {
    var prev = document.querySelector(".category-group.drop-target");
    if (prev) prev.classList.remove("drop-target");
  }

  function dropTargetCategoryAt(clientX, clientY) {
    var el = document.elementFromPoint(clientX, clientY);
    var group = el ? el.closest(".category-group[data-category]") : null;
    return group ? group.dataset.category : null;
  }

  function startDragVisual(clientX, clientY) {
    var rect = drag.sourceEl.getBoundingClientRect();
    var ghost = drag.sourceEl.cloneNode(true);
    ghost.className = "tile drag-ghost";
    ghost.style.width = rect.width + "px";
    ghost.style.height = rect.height + "px";
    ghost.style.left = rect.left + "px";
    ghost.style.top = rect.top + "px";
    document.body.appendChild(ghost);
    drag.ghostEl = ghost;
    drag.offsetX = clientX - rect.left;
    drag.offsetY = clientY - rect.top;
    drag.wrapEl.classList.add("dragging-source");
    drag.dragging = true;
  }

  function moveDragVisual(clientX, clientY) {
    drag.ghostEl.style.left = (clientX - drag.offsetX) + "px";
    drag.ghostEl.style.top = (clientY - drag.offsetY) + "px";
    var category = dropTargetCategoryAt(clientX, clientY);
    clearDropHighlight();
    if (category) {
      var el = document.elementFromPoint(clientX, clientY);
      var group = el.closest(".category-group[data-category]");
      group.classList.add("drop-target");
    }
  }

  function cleanupDragVisuals() {
    if (drag.ghostEl && drag.ghostEl.parentNode) {
      drag.ghostEl.parentNode.removeChild(drag.ghostEl);
    }
    if (drag.wrapEl) drag.wrapEl.classList.remove("dragging-source");
    clearDropHighlight();
  }

  function finishDrag(clientX, clientY) {
    var newCategory = dropTargetCategoryAt(clientX, clientY);
    cleanupDragVisuals();
    if (newCategory) setTileCategory(drag.id, newCategory);
    drag = null;
  }

  function cancelDrag() {
    cleanupDragVisuals();
    drag = null;
  }

  function createCustomTile(name) {
    var trimmed = name.trim();
    if (!trimmed) return;
    var tile = { id: makeCustomId(), name: trimmed, category: "Other" };
    state.pool.push(tile);
    state.list.push({ id: tile.id, collected: false });
    save();
  }

  function uncheckAll() {
    state.list.forEach(function (e) { e.collected = false; });
    save();
  }

  function clearList() {
    state.list = [];
    save();
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderTabs() {
    document.getElementById("tabCatalog").classList.toggle("active", currentView === "catalog");
    document.getElementById("tabCatalog").setAttribute("aria-selected", currentView === "catalog");
    document.getElementById("tabList").classList.toggle("active", currentView === "list");
    document.getElementById("tabList").setAttribute("aria-selected", currentView === "list");
    document.getElementById("viewCatalog").classList.toggle("hidden", currentView !== "catalog");
    document.getElementById("viewList").classList.toggle("hidden", currentView !== "list");

    var count = state.list.length;
    document.getElementById("listCount").textContent = count > 0 ? String(count) : "";
  }

  function renderCatalog() {
    var container = document.getElementById("catalogGroups");
    container.innerHTML = "";

    var byCategory = {};
    state.pool.forEach(function (tile) {
      if (!byCategory[tile.category]) byCategory[tile.category] = [];
      byCategory[tile.category].push(tile);
    });

    var categories = CATEGORY_ORDER.filter(function (c) { return byCategory[c] && byCategory[c].length; });
    Object.keys(byCategory).forEach(function (c) {
      if (categories.indexOf(c) === -1) categories.push(c);
    });

    categories.forEach(function (category) {
      var group = el("div", "category-group");
      group.dataset.category = category;
      group.appendChild(el("h3", "category-title", category));
      var grid = el("div", "tile-grid");
      byCategory[category].forEach(function (tile) {
        var wrap = el("div", "tile-wrap");

        if (pendingDeleteId === tile.id) {
          var confirmTile = el("div", "tile tile-confirm");
          confirmTile.appendChild(el("div", "confirm-label", "Delete \"" + tile.name + "\"?"));
          var row = el("div", "confirm-row");
          var delBtn = el("button", "confirm-btn confirm-danger", "Delete");
          delBtn.dataset.action = "confirm-delete-tile";
          delBtn.dataset.id = tile.id;
          var cancelBtn = el("button", "confirm-btn confirm-cancel", "Cancel");
          cancelBtn.dataset.action = "cancel-delete-tile";
          row.appendChild(delBtn);
          row.appendChild(cancelBtn);
          confirmTile.appendChild(row);
          wrap.appendChild(confirmTile);
        } else {
          var onList = !!listEntryById(tile.id);
          var btn = el("button", "tile" + (onList ? " on-list" : ""), tile.name);
          btn.dataset.action = "toggle-membership";
          btn.dataset.id = tile.id;
          wrap.appendChild(btn);

          var delToggle = el("button", "tile-delete", "×");
          delToggle.dataset.action = "request-delete-tile";
          delToggle.dataset.id = tile.id;
          delToggle.setAttribute("aria-label", "Delete " + tile.name);
          wrap.appendChild(delToggle);
        }

        grid.appendChild(wrap);
      });
      group.appendChild(grid);
      container.appendChild(group);
    });

    // trailing "+ Add item" tile (or active input) in its own unlabeled group
    var addGroup = el("div", "category-group");
    var addGrid = el("div", "tile-grid");
    if (addingTile) {
      var input = el("input", "tile-input");
      input.type = "text";
      input.placeholder = "Item name";
      input.id = "newTileInput";
      addGrid.appendChild(input);
    } else {
      var addBtn = el("button", "tile add-tile", "+ Add item");
      addBtn.dataset.action = "start-add-tile";
      addGrid.appendChild(addBtn);
    }
    addGroup.appendChild(addGrid);
    container.appendChild(addGroup);

    if (addingTile) {
      var inputEl = document.getElementById("newTileInput");
      inputEl.focus();
      inputEl.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
          createCustomTile(inputEl.value);
          addingTile = false;
          renderAll();
        } else if (ev.key === "Escape") {
          addingTile = false;
          renderAll();
        }
      });
      inputEl.addEventListener("blur", function () {
        if (inputEl.value.trim()) {
          createCustomTile(inputEl.value);
        }
        addingTile = false;
        renderAll();
      });
    }
  }

  function renderListControls() {
    var container = document.getElementById("listControls");
    container.innerHTML = "";

    if (pendingClearList) {
      var wrap = el("div", "clear-confirm");
      wrap.appendChild(el("span", "clear-confirm-label", "Clear entire list?"));
      var confirmBtn = el("button", "confirm-btn confirm-danger", "Clear");
      confirmBtn.dataset.action = "confirm-clear-list";
      var cancelBtn = el("button", "confirm-btn confirm-cancel", "Cancel");
      cancelBtn.dataset.action = "cancel-clear-list";
      wrap.appendChild(confirmBtn);
      wrap.appendChild(cancelBtn);
      container.appendChild(wrap);
      return;
    }

    var uncheckBtn = el("button", "text-btn", "Uncheck All");
    uncheckBtn.dataset.action = "uncheck-all";
    var clearBtn = el("button", "text-btn danger", "Clear List");
    clearBtn.dataset.action = "request-clear-list";
    container.appendChild(uncheckBtn);
    container.appendChild(clearBtn);
  }

  function renderList() {
    var container = document.getElementById("listGroups");
    var emptyMsg = document.getElementById("listEmpty");
    container.innerHTML = "";

    if (state.list.length === 0) {
      emptyMsg.classList.remove("hidden");
      return;
    }
    emptyMsg.classList.add("hidden");

    var byCategory = {};
    state.list.forEach(function (entry) {
      var tile = poolTileById(entry.id);
      if (!tile) return;
      if (!byCategory[tile.category]) byCategory[tile.category] = [];
      byCategory[tile.category].push({ entry: entry, tile: tile });
    });

    var categories = CATEGORY_ORDER.filter(function (c) { return byCategory[c] && byCategory[c].length; });
    Object.keys(byCategory).forEach(function (c) {
      if (categories.indexOf(c) === -1) categories.push(c);
    });

    categories.forEach(function (category) {
      var group = el("div", "category-group");
      group.appendChild(el("h3", "category-title", category));
      var grid = el("div", "tile-grid");
      byCategory[category].forEach(function (pair) {
        if (pair.entry.collected && pendingUncheckId === pair.entry.id) {
          var confirmTile = el("div", "tile tile-confirm");
          confirmTile.appendChild(el("div", "confirm-label", "Uncheck \"" + pair.tile.name + "\"?"));
          var row = el("div", "confirm-row");
          var confirmBtn = el("button", "confirm-btn confirm-danger", "Undo");
          confirmBtn.dataset.action = "confirm-uncheck";
          confirmBtn.dataset.id = pair.entry.id;
          var cancelBtn = el("button", "confirm-btn confirm-cancel", "Cancel");
          cancelBtn.dataset.action = "cancel-uncheck";
          cancelBtn.dataset.id = pair.entry.id;
          row.appendChild(confirmBtn);
          row.appendChild(cancelBtn);
          confirmTile.appendChild(row);
          grid.appendChild(confirmTile);
        } else {
          var stateClass = pair.entry.collected ? "state-done" : "state-todo";
          var btn = el("button", "tile " + stateClass, pair.tile.name);
          btn.dataset.action = pair.entry.collected ? "request-uncheck" : "mark-collected";
          btn.dataset.id = pair.entry.id;
          grid.appendChild(btn);
        }
      });
      group.appendChild(grid);
      container.appendChild(group);
    });
  }

  function renderAll() {
    renderTabs();
    renderCatalog();
    renderList();
    renderListControls();
  }

  document.getElementById("tabCatalog").addEventListener("click", function () {
    currentView = "catalog";
    pendingDeleteId = null;
    pendingClearList = false;
    pendingUncheckId = null;
    renderAll();
  });

  document.getElementById("tabList").addEventListener("click", function () {
    currentView = "list";
    pendingDeleteId = null;
    pendingClearList = false;
    pendingUncheckId = null;
    renderAll();
  });

  document.getElementById("listControls").addEventListener("click", function (ev) {
    var target = ev.target.closest("[data-action]");
    if (!target) return;
    var action = target.dataset.action;

    if (action === "uncheck-all") {
      uncheckAll();
      pendingUncheckId = null;
      renderList();
    } else if (action === "request-clear-list") {
      pendingClearList = true;
      renderListControls();
    } else if (action === "confirm-clear-list") {
      clearList();
      pendingClearList = false;
      pendingUncheckId = null;
      renderAll();
    } else if (action === "cancel-clear-list") {
      pendingClearList = false;
      renderListControls();
    }
  });

  document.getElementById("catalogGroups").addEventListener("pointerdown", function (ev) {
    if (ev.button !== undefined && ev.button !== 0) return;
    var tileBtn = ev.target.closest('.tile[data-action="toggle-membership"]');
    if (!tileBtn) return;
    var wrapEl = tileBtn.closest(".tile-wrap");

    drag = {
      id: tileBtn.dataset.id,
      pointerId: ev.pointerId,
      startX: ev.clientX,
      startY: ev.clientY,
      sourceEl: tileBtn,
      wrapEl: wrapEl,
      pointerType: ev.pointerType,
      dragging: false,
      longPressTimer: null
    };

    if (ev.pointerType !== "mouse") {
      drag.longPressTimer = setTimeout(function () {
        if (!drag || drag.dragging) return;
        drag.longPressTimer = null;
        startDragVisual(ev.clientX, ev.clientY);
      }, LONG_PRESS_MS);
    }
  });

  document.addEventListener("pointermove", function (ev) {
    if (!drag || ev.pointerId !== drag.pointerId) return;
    var dx = ev.clientX - drag.startX;
    var dy = ev.clientY - drag.startY;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (!drag.dragging) {
      if (drag.pointerType === "mouse") {
        if (dist > DRAG_MOVE_THRESHOLD) startDragVisual(ev.clientX, ev.clientY);
      } else if (dist > LONG_PRESS_MOVE_TOLERANCE) {
        if (drag.longPressTimer) clearTimeout(drag.longPressTimer);
        drag = null;
      }
      return;
    }

    ev.preventDefault();
    moveDragVisual(ev.clientX, ev.clientY);
  });

  document.addEventListener("pointerup", function (ev) {
    if (!drag || ev.pointerId !== drag.pointerId) return;
    if (drag.longPressTimer) clearTimeout(drag.longPressTimer);

    if (drag.dragging) {
      suppressNextClick = true;
      finishDrag(ev.clientX, ev.clientY);
      renderAll();
    } else {
      drag = null;
    }
  });

  document.addEventListener("pointercancel", function (ev) {
    if (!drag || ev.pointerId !== drag.pointerId) return;
    if (drag.longPressTimer) clearTimeout(drag.longPressTimer);
    if (drag.dragging) cancelDrag();
    else drag = null;
  });

  document.getElementById("catalogGroups").addEventListener("click", function (ev) {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    var target = ev.target.closest("[data-action]");
    if (!target) return;
    var action = target.dataset.action;

    if (action === "toggle-membership") {
      var id = target.dataset.id;
      if (listEntryById(id)) {
        removeFromList(id);
      } else {
        addToList(id);
      }
      pendingDeleteId = null;
      renderAll();
    } else if (action === "start-add-tile") {
      addingTile = true;
      pendingDeleteId = null;
      renderCatalog();
    } else if (action === "request-delete-tile") {
      pendingDeleteId = target.dataset.id;
      renderCatalog();
    } else if (action === "confirm-delete-tile") {
      deleteTile(target.dataset.id);
      pendingDeleteId = null;
      renderAll();
    } else if (action === "cancel-delete-tile") {
      pendingDeleteId = null;
      renderCatalog();
    }
  });

  document.getElementById("listGroups").addEventListener("click", function (ev) {
    var target = ev.target.closest("[data-action]");
    if (!target) return;
    var action = target.dataset.action;
    var id = target.dataset.id;

    if (action === "mark-collected") {
      toggleCollected(id);
      renderList();
      renderTabs();
    } else if (action === "request-uncheck") {
      pendingUncheckId = id;
      renderList();
    } else if (action === "confirm-uncheck") {
      toggleCollected(id);
      pendingUncheckId = null;
      renderList();
      renderTabs();
    } else if (action === "cancel-uncheck") {
      pendingUncheckId = null;
      renderList();
    }
  });

  renderAll();
})();
