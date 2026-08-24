const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  ImageRun, AlignmentType, BorderStyle, WidthType, PageBreak, Header, Footer,
  PageNumber, NumberFormat, ShadingType, VerticalAlign, TabStopType, TabStopPosition,
} = require("docx");

const COLOR_PRIMARY = "C0392B";   // rojo MINEDUC
const COLOR_DARK = "2C2C2C";
const COLOR_GRAY = "6D6D6D";
const COLOR_LIGHT_BG = "F5F5F5";

const OUT_DIR = path.join(__dirname, "diagrams", "out");

function img(file) {
  return fs.readFileSync(path.join(OUT_DIR, file));
}

// Escala una imagen respetando proporcion, limitada a maxW x maxH (px)
function dims(naturalW, naturalH, maxW = 580, maxH = 850) {
  let w = naturalW, h = naturalH;
  const ratio = w / h;
  if (w > maxW) { w = maxW; h = w / ratio; }
  if (h > maxH) { h = maxH; w = h * ratio; }
  return { width: Math.round(w), height: Math.round(h) };
}

const IMAGE_NATURAL_SIZES = {
  "arch_deployment.png": [742, 1398],
  "arch_layers.png": [1568, 2184],
  "arch_modules_map.png": [1188, 2060],
  "er_diagram.png": [1568, 1466],
  "flow_login.png": [1568, 2184],
  "flow_registro_caso.png": [1170, 4634],
  "flow_carga_masiva.png": [1568, 3854],
  "flow_seguimiento_estado.png": [1064, 5366],
  "flow_auditoria_exportacion.png": [1568, 4046],
};

function imageParagraph(file, maxW, maxH, captionText) {
  const [nw, nh] = IMAGE_NATURAL_SIZES[file];
  const size = dims(nw, nh, maxW, maxH);
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: captionText ? 80 : 200 },
      children: [
        new ImageRun({
          type: "png",
          data: img(file),
          transformation: { width: size.width, height: size.height },
        }),
      ],
    }),
  ];
  if (captionText) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: captionText, italics: true, size: 18, color: COLOR_GRAY }),
        ],
      })
    );
  }
  return children;
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, color: COLOR_PRIMARY, bold: true })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, color: COLOR_DARK, bold: true })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 100 },
    children: [new TextRun({ text, color: COLOR_DARK, bold: true })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, ...opts })],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60 },
    children: [new TextRun({ text })],
  });
}

function code(text) {
  return new Paragraph({
    spacing: { after: 120 },
    shading: { type: ShadingType.CLEAR, fill: COLOR_LIGHT_BG },
    children: [new TextRun({ text, font: "Consolas", size: 19 })],
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// Celda de tabla con texto, opcionalmente encabezado
function cell(text, opts = {}) {
  const { header = false, width, bold = false } = opts;
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    shading: header ? { type: ShadingType.CLEAR, fill: COLOR_PRIMARY } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: header || bold,
            color: header ? "FFFFFF" : COLOR_DARK,
            size: header ? 20 : 19,
          }),
        ],
      }),
    ],
  });
}

function table(headerCells, rows, widths) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headerCells.map((t, i) => cell(t, { header: true, width: widths ? widths[i] : undefined })),
      }),
      ...rows.map(
        (r) => new TableRow({ children: r.map((t, i) => cell(String(t), { width: widths ? widths[i] : undefined })) })
      ),
    ],
  });
}

function buildHeader(docTitle) {
  return new Header({
    children: [
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_PRIMARY } },
        children: [
          new TextRun({ text: "SIGEC - Sistema de Información y Gestión de Casos", bold: true, size: 16, color: COLOR_PRIMARY }),
          new TextRun({ text: "\tMINEDUC", size: 16, color: COLOR_GRAY }),
        ],
      }),
    ],
  });
}

function buildFooter(docCode) {
  return new Footer({
    children: [
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
        children: [
          new TextRun({ text: `${docCode} · Documentación Técnica SIGEC`, size: 14, color: COLOR_GRAY }),
          new TextRun({ text: "\tPágina ", size: 14, color: COLOR_GRAY }),
          new TextRun({ children: [PageNumber.CURRENT], size: 14, color: COLOR_GRAY }),
          new TextRun({ text: " de ", size: 14, color: COLOR_GRAY }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: COLOR_GRAY }),
        ],
      }),
    ],
  });
}

function titlePage({ code, title, subtitle, version = "1.0", date }) {
  const today = date || new Date().toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" });
  return [
    new Paragraph({ spacing: { before: 2000 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "MINEDUC", bold: true, size: 32, color: COLOR_PRIMARY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "Sistema de Información y Gestión de Casos (SIGEC)", size: 26, color: COLOR_DARK })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 200 },
      children: [new TextRun({ text: code, bold: true, size: 24, color: COLOR_GRAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [new TextRun({ text: title, bold: true, size: 44, color: COLOR_PRIMARY })],
    }),
    subtitle
      ? new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 1200 },
          children: [new TextRun({ text: subtitle, size: 24, color: COLOR_DARK, italics: true })],
        })
      : new Paragraph({ children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Versión ${version}`, size: 20, color: COLOR_GRAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 2000 },
      children: [new TextRun({ text: today, size: 20, color: COLOR_GRAY })],
    }),
    pageBreak(),
  ];
}

function buildDocument({ code, title, children }) {
  return new Document({
    creator: "MINEDUC - SIGEC",
    title,
    description: `Documentación técnica SIGEC - ${title}`,
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1100, bottom: 1100, left: 1100, right: 1100 },
          },
        },
        headers: { default: buildHeader(title) },
        footers: { default: buildFooter(code) },
        children,
      },
    ],
  });
}

async function writeDocx(doc, outFile) {
  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "..", "docs", outFile);
  fs.writeFileSync(outPath, buffer);
  console.log("Generado:", outPath, `(${(buffer.length / 1024).toFixed(1)} KB)`);
}

module.exports = {
  h1, h2, h3, p, bullet, code, pageBreak, table, cell,
  imageParagraph, titlePage, buildDocument, writeDocx,
  AlignmentType, TextRun, Paragraph, HeadingLevel,
  COLOR_PRIMARY, COLOR_DARK, COLOR_GRAY,
};
