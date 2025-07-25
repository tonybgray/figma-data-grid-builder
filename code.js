"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__, { width: 260, height: 300 });
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.mode === "create") {
        const { columns, rows } = msg;
        yield createDataGrid(columns, rows);
    }
    else if (msg.mode === "realign") {
        yield realignDataGrid();
    }
    figma.closePlugin();
});
function createDataGrid(columns, rows) {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.loadFontAsync({ family: "Roboto", style: "Regular" });
        yield figma.loadFontAsync({ family: "Roboto", style: "Bold" });
        const gridFrame = figma.createFrame();
        gridFrame.name = "data-grid";
        gridFrame.layoutMode = "VERTICAL";
        gridFrame.counterAxisSizingMode = "AUTO";
        gridFrame.primaryAxisSizingMode = "AUTO";
        gridFrame.itemSpacing = 0;
        const headerRow = createRow("row-header", columns, "#DDDDDD", true);
        gridFrame.appendChild(headerRow);
        for (let i = 0; i < rows; i++) {
            const isLight = i % 2 === 0;
            const rowName = isLight ? "row-content-light" : "row-content-dark";
            const bgColor = isLight ? "#FFFFFF" : "#F5F5F5";
            const row = createRow(rowName, columns, bgColor, false);
            gridFrame.appendChild(row);
        }
        figma.currentPage.selection = [gridFrame];
        figma.viewport.scrollAndZoomIntoView([gridFrame]);
    });
}
function createRow(name, columns, background, isHeader) {
    const row = figma.createFrame();
    row.name = name;
    row.layoutMode = "HORIZONTAL";
    row.counterAxisSizingMode = "AUTO";
    row.primaryAxisSizingMode = "AUTO";
    row.fills = [{ type: "SOLID", color: hexToRgb(background) }];
    row.itemSpacing = 0;
    for (let c = 0; c < columns; c++) {
        const cell = figma.createFrame();
        cell.name = `cell-${c + 1}`;
        cell.layoutMode = "VERTICAL";
        cell.counterAxisSizingMode = "AUTO";
        cell.primaryAxisSizingMode = "FIXED";
        cell.resize(150, 40);
        cell.paddingLeft = 8;
        cell.paddingRight = 8;
        cell.paddingTop = 4;
        cell.paddingBottom = 4;
        const text = figma.createText();
        text.characters = isHeader ? `Header ${c + 1}` : `Cell`;
        text.fontSize = 14;
        text.fontName = { family: "Roboto", style: isHeader ? "Bold" : "Regular" };
        text.textAlignHorizontal = "LEFT";
        text.textAutoResize = "WIDTH_AND_HEIGHT";
        cell.appendChild(text);
        row.appendChild(cell);
    }
    return row;
}
function realignDataGrid() {
    return __awaiter(this, void 0, void 0, function* () {
        const selection = figma.currentPage.selection;
        if (selection.length !== 1 ||
            selection[0].type !== "FRAME" ||
            selection[0].name !== "data-grid") {
            figma.notify("Please select a single data-grid frame.");
            return;
        }
        const grid = selection[0];
        const header = grid.children.find((n) => n.name === "row-header");
        if (!header) {
            figma.notify("Header row not found.");
            return;
        }
        const headerWidths = header.children.map((c) => c.width);
        for (const row of grid.children) {
            if (row.name === "row-header")
                continue;
            row.children.forEach((cell, idx) => {
                cell.resize(headerWidths[idx], cell.height);
            });
        }
        figma.notify("Columns realigned to match header widths.");
    });
}
function hexToRgb(hex) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    return {
        r: ((bigint >> 16) & 255) / 255,
        g: ((bigint >> 8) & 255) / 255,
        b: (bigint & 255) / 255,
    };
}
