/**
 * SILEX SERVICES ERP — Moteur d'exportation natif OpenXML (.XLSX)
 * Conforme ECMA-376 / ISO/IEC 29500 sans dépendance externe bloquante.
 * Génère des classeurs Excel 100% valides avec types numériques réels,
 * devise DZD (#,##0 "DA"), dates ISO et en-têtes stylisés.
 */

function crc32(buf: Uint8Array): number {
  let table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

class OpenXmlZip {
  private files: { name: string; data: Uint8Array }[] = [];

  addFile(name: string, content: string | Uint8Array) {
    const data = typeof content === 'string' ? new TextEncoder().encode(content) : content;
    this.files.push({ name, data });
  }

  build(): Uint8Array {
    const fileEntries: {
      nameBuf: Uint8Array;
      localHeader: Uint8Array;
      data: Uint8Array;
      crc: number;
      size: number;
      offset: number;
    }[] = [];

    let offset = 0;

    for (const file of this.files) {
      const nameBuf = new TextEncoder().encode(file.name);
      const crc = crc32(file.data);
      const size = file.data.length;

      const localHeader = new Uint8Array(30 + nameBuf.length);
      const view = new DataView(localHeader.buffer, localHeader.byteOffset, localHeader.byteLength);

      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, 0, true); // Stored (uncompressed)
      view.setUint16(10, 0, true);
      view.setUint16(12, 0, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, size, true);
      view.setUint32(22, size, true);
      view.setUint16(26, nameBuf.length, true);
      view.setUint16(28, 0, true);
      localHeader.set(nameBuf, 30);

      fileEntries.push({
        nameBuf,
        localHeader,
        data: file.data,
        crc,
        size,
        offset,
      });

      offset += localHeader.length + size;
    }

    const cdOffset = offset;
    const cdEntries: Uint8Array[] = [];

    for (const entry of fileEntries) {
      const cdHeader = new Uint8Array(46 + entry.nameBuf.length);
      const view = new DataView(cdHeader.buffer, cdHeader.byteOffset, cdHeader.byteLength);

      view.setUint32(0, 0x02014b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 20, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, 0, true);
      view.setUint16(14, 0, true);
      view.setUint32(16, entry.crc, true);
      view.setUint32(20, entry.size, true);
      view.setUint32(24, entry.size, true);
      view.setUint16(28, entry.nameBuf.length, true);
      view.setUint16(30, 0, true);
      view.setUint16(32, 0, true);
      view.setUint16(34, 0, true);
      view.setUint16(36, 0, true);
      view.setUint32(38, 0, true);
      view.setUint32(42, entry.offset, true);
      cdHeader.set(entry.nameBuf, 46);

      cdEntries.push(cdHeader);
      offset += cdHeader.length;
    }

    const cdSize = offset - cdOffset;

    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer, eocd.byteOffset, eocd.byteLength);
    eocdView.setUint32(0, 0x06054b50, true);
    eocdView.setUint16(4, 0, true);
    eocdView.setUint16(6, 0, true);
    eocdView.setUint16(8, fileEntries.length, true);
    eocdView.setUint16(10, fileEntries.length, true);
    eocdView.setUint32(12, cdSize, true);
    eocdView.setUint32(16, cdOffset, true);
    eocdView.setUint16(20, 0, true);

    const totalLength = offset + eocd.length;
    const finalBuffer = new Uint8Array(totalLength);
    let cur = 0;

    for (const entry of fileEntries) {
      finalBuffer.set(entry.localHeader, cur);
      cur += entry.localHeader.length;
      finalBuffer.set(entry.data, cur);
      cur += entry.data.length;
    }

    for (const cd of cdEntries) {
      finalBuffer.set(cd, cur);
      cur += cd.length;
    }

    finalBuffer.set(eocd, cur);
    return finalBuffer;
  }
}

export interface XlsxColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'percent' | 'date';
}

export interface XlsxOptions {
  sheetName?: string;
  columns: XlsxColumn[];
  rows: Record<string, any>[];
  companyName?: string;
}

function colLetter(index: number): string {
  let s = '';
  while (index >= 0) {
    s = String.fromCharCode((index % 26) + 65) + s;
    index = Math.floor(index / 26) - 1;
  }
  return s;
}

function escapeXml(str: any): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateXlsxBuffer(options: XlsxOptions): Uint8Array {
  const { sheetName = 'Feuille1', columns, rows } = options;
  const zip = new OpenXmlZip();

  // 1. [Content_Types].xml
  zip.addFile(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.addFile(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  );

  // 3. xl/_rels/workbook.xml.rels
  zip.addFile(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  );

  // 4. xl/workbook.xml
  zip.addFile(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
  );

  // 5. xl/styles.xml (Palette officielle SILEX: #07164D, #0B207D, police Segoe UI)
  zip.addFile(
    'xl/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="2">
    <numFmt numFmtId="164" formatCode="#,##0 &quot;DA&quot;"/>
    <numFmt numFmtId="165" formatCode="0.0%"/>
  </numFmts>
  <fonts count="3">
    <font><name val="Segoe UI"/><sz val="10"/></font>
    <font><b/><name val="Segoe UI"/><sz val="10"/><color rgb="FFFFFFFF"/></font>
    <font><b/><name val="Segoe UI"/><sz val="10"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF07164D"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/></border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="164" fontId="2" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>`
  );

  // 6. xl/worksheets/sheet1.xml
  let sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>`;

  // En-tête des colonnes (style 1 = Fond bleu marine SILEX #07164D, texte blanc gras)
  sheetXml += `\n    <row r="1">`;
  columns.forEach((col, idx) => {
    const cellRef = `${colLetter(idx)}1`;
    sheetXml += `<c r="${cellRef}" t="inlineStr" s="1"><is><t>${escapeXml(col.label || col.key)}</t></is></c>`;
  });
  sheetXml += `</row>`;

  // Lignes de données
  rows.forEach((row, rIdx) => {
    const rowNum = rIdx + 2;
    sheetXml += `\n    <row r="${rowNum}">`;

    columns.forEach((col, cIdx) => {
      const cellRef = `${colLetter(cIdx)}${rowNum}`;
      const val = row[col.key];

      if (val === null || val === undefined || val === '') {
        // cellule vide
      } else if (typeof val === 'number') {
        let style = ' s="0"';
        if (col.type === 'currency') style = ' s="2"';
        else if (col.type === 'percent') style = ' s="3"';
        sheetXml += `<c r="${cellRef}"${style}><v>${val}</v></c>`;
      } else if (typeof val === 'boolean') {
        sheetXml += `<c r="${cellRef}" t="b" s="0"><v>${val ? 1 : 0}</v></c>`;
      } else {
        sheetXml += `<c r="${cellRef}" t="inlineStr" s="0"><is><t>${escapeXml(val)}</t></is></c>`;
      }
    });
    sheetXml += `</row>`;
  });

  sheetXml += `\n  </sheetData>\n</worksheet>`;
  zip.addFile('xl/worksheets/sheet1.xml', sheetXml);

  return zip.build();
}

/**
 * Déclenche le téléchargement du fichier XLSX dans le navigateur client
 */
export function downloadXLSX(filename: string, options: XlsxOptions): void {
  const buffer = generateXlsxBuffer(options);
  const blob = new Blob([buffer as any], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
