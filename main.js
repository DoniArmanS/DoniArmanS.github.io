// Builds the 8x8 board behind the portrait and, on load, sends a light trail
// along a knight's tour that starts where White's knight starts (g1).
(function () {
  const grid = document.querySelector(".board-grid");
  const coords = document.querySelector(".board-coords");
  if (!grid || !coords) return;

  const files = "abcdefgh";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const squares = {}; // "e4" -> element

  // Rows run from rank 8 (top) to rank 1 (bottom), as on a real board.
  for (let rank = 8; rank >= 1; rank--) {
    for (let f = 0; f < 8; f++) {
      const sq = document.createElement("div");
      sq.className = "sq";
      if ((f + rank) % 2 === 1) sq.append(span("tint"));
      squares[files[f] + rank] = sq;
      grid.append(sq);

      const cell = document.createElement("div");
      cell.className = "cell";
      if (f === 0) cell.append(span("coord rank", rank));
      if (rank === 1) cell.append(span("coord file", files[f]));
      coords.append(cell);
    }
  }

  function span(className, text) {
    const el = document.createElement("span");
    el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  if (reduceMotion || !Element.prototype.animate) return;

  const step = 22;
  knightsTour(6, 0).forEach(([f, r], i) => {
    const sq = squares[files[f] + (r + 1)];
    const delay = 300 + i * step;
    const flash = span("flash");
    sq.append(flash);
    flash
      .animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 520, delay, easing: "ease-out" })
      .finished.then(() => flash.remove());
    const tint = sq.querySelector(".tint");
    if (tint) tint.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay, easing: "ease-out", fill: "backwards" });
  });

  // Warnsdorff's rule: always jump to the square with the fewest onward moves.
  function knightsTour(startFile, startRank) {
    const jumps = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
    const seen = new Set();
    const key = (f, r) => f * 8 + r;
    const onBoard = (f, r) => f >= 0 && f < 8 && r >= 0 && r < 8;
    const next = (f, r) =>
      jumps.map(([df, dr]) => [f + df, r + dr]).filter(([nf, nr]) => onBoard(nf, nr) && !seen.has(key(nf, nr)));

    const path = [];
    let cur = [startFile, startRank];
    while (cur) {
      path.push(cur);
      seen.add(key(...cur));
      const options = next(...cur);
      options.sort((a, b) => next(...a).length - next(...b).length);
      cur = options[0];
    }
    // If the heuristic dead-ends early, finish the remaining squares in board order.
    for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) if (!seen.has(key(f, r))) path.push([f, r]);
    return path;
  }
})();
