/// <reference types="@figma/plugin-typings" />
// Show the UI
figma.showUI(__html__, { width: 260, height: 320 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "create-grid") {
    const { columns, rows, rowHeight } = msg;
    await createDataGrid(columns, rows, rowHeight);
    figma.closePlugin();
  }

  if (msg.type === "realign-columns") {
    realignColumns();
    figma.closePlugin();
  }
};

async function createDataGrid(columns: number, rows: number, rowHeight: number) {
  // Load fonts
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // Create the main frame
  const gridFrame = figma.createFrame();
  gridFrame.name = "Data Grid";
  gridFrame.layoutMode = "VERTICAL";
  gridFrame.primaryAxisSizingMode = "AUTO";
  gridFrame.counterAxisSizingMode = "FIXED";
  gridFrame.resize(800, rowHeight * (rows + 1));
  gridFrame.itemSpacing = 0;

  // Header row
  const headerRow = createRow("row-header", columns, "#333333", true, rowHeight);
  gridFrame.appendChild(headerRow);

  // Data rows
  for (let i = 0; i < rows; i++) {
    const bg = i % 2 === 0 ? "#ffffff" : "#dddddd";
    const row = createRow(`row-${i + 1}`, columns, bg, false, rowHeight);
    gridFrame.appendChild(row);
  }

  figma.currentPage.selection = [gridFrame];
  figma.viewport.scrollAndZoomIntoView([gridFrame]);
}

function createRow(
  name: string,
  columns: number,
  background: string,
  isHeader: boolean,
  rowHeight: number
): FrameNode {
  const row = figma.createFrame();
  row.name = name;
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "FIXED";
  row.resize(800, rowHeight);
  row.fills = [
    {
      type: "SOLID",
      color: hexToRgb(background)
    }
  ];
  row.itemSpacing = 0;

  for (let i = 0; i < columns; i++) {
    const cell = figma.createFrame();
    cell.layoutMode = "VERTICAL";
    cell.primaryAxisSizingMode = "FIXED";
    cell.counterAxisSizingMode = "FIXED";
    cell.resizeWithoutConstraints(160, rowHeight);
    cell.layoutGrow = 1;
    cell.paddingLeft = 8;
    cell.paddingRight = 8;
    cell.paddingTop = 4;
    cell.paddingBottom = 4;
    cell.fills = []; // transparent background

    const text = figma.createText();
    text.characters = isHeader ? `Header ${i + 1}` : `Row Item ${i + 1}`;
    text.fontName = { family: "Inter", style: isHeader ? "Bold" : "Regular" };
    text.fills = [
      {
        type: "SOLID",
        color: isHeader ? { r: 1, g: 1, b: 1 } : { r: 0, g: 0, b: 0 }
      }
    ];

    cell.appendChild(text);
    row.appendChild(cell);
  }

  return row;
}

function realignColumns() {
  const selection = figma.currentPage.selection;
  if (selection.length !== 1) {
    figma.notify("Please select a single data-grid frame.");
    return;
  }

  const grid = selection[0];
  if (grid.type !== "FRAME") {
    figma.notify("Selection must be a frame.");
    return;
  }

  const header = grid.children.find((n) => n.name === "row-header");
  if (!header || header.type !== "FRAME") {
    figma.notify("Header row not found.");
    return;
  }

  const headerWidths = header.children.map((c) => c.width);

  grid.children.forEach((row) => {
    if (row.name === "row-header") return;
    if (row.type !== "FRAME") return;

    row.children.forEach((cell, idx) => {
      if (cell.type === "FRAME") {
        cell.resizeWithoutConstraints(headerWidths[idx], row.height);
      }
    });
  });

  figma.notify("Columns realigned to match header widths.");
}

function hexToRgb(hex: string): RGB {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255
  };
}
