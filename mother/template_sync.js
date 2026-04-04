import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { DOMParser, XMLSerializer } from 'xmldom';

/**
 * Advanced Template Sync Utility
 * Commits formatting changes from the web UI directly to the .docx / .xlsx files.
 */

/**
 * Syncs styling to an Excel (.xlsx) file
 */
export async function syncExcelStyle(filePath, fields) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Backup
    const backupPath = filePath + '.bak';
    if (!fs.existsSync(backupPath)) fs.copyFileSync(filePath, backupPath);

    workbook.eachSheet((sheet) => {
        sheet.eachRow((row) => {
            row.eachCell((cell) => {
                if (typeof cell.value === 'string') {
                    for (const field of fields) {
                        if (cell.value.includes(`{{${field.field}}}`)) {
                            // Apply Styles
                            cell.alignment = {
                                ...cell.alignment,
                                horizontal: field.align || 'left',
                                vertical: 'middle',
                                wrapText: field.isMultiLine || false,
                                shrinkToFit: field.shrinkToFit || false
                            };
                            
                            if (field.bold) {
                                cell.font = { ...cell.font, bold: true };
                            }
                        }
                    }
                }
            });
        });
    });

    await workbook.xlsx.writeFile(filePath);
    return true;
}

/**
 * Syncs styling to a Word (.docx) file
 * Uses XML manipulation for bolding and alignment since Word doesn't have a simple library for this.
 */
export async function syncWordStyle(filePath, fields) {
    const data = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(data);
    const docXml = await zip.file("word/document.xml").async("string");
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(docXml, "text/xml");

    // Backup
    const backupPath = filePath + '.bak';
    if (!fs.existsSync(backupPath)) fs.copyFileSync(filePath, backupPath);

    const ts = xmlDoc.getElementsByTagName("w:t");
    
    for (let i = 0; i < ts.length; i++) {
        const t = ts[i];
        const textContent = t.textContent;

        for (const field of fields) {
            if (textContent.includes(`{{${field.field}}}`)) {
                const tag = field.field;
                
                // 1. Bold Stylings (on <w:r> level)
                const runNode = t.parentNode; // <w:r>
                if (field.bold && runNode && runNode.nodeName === "w:r") {
                    let rPr = runNode.getElementsByTagName("w:rPr")[0];
                    if (!rPr) {
                        rPr = xmlDoc.createElement("w:rPr");
                        runNode.insertBefore(rPr, t);
                    }
                    let b = rPr.getElementsByTagName("w:b")[0];
                    if (!b) {
                        b = xmlDoc.createElement("w:b");
                        rPr.appendChild(b);
                    }
                }

                // 2. Alignment (on <w:p> level)
                let pNode = runNode.parentNode;
                while (pNode && pNode.nodeName !== "w:p") {
                    pNode = pNode.parentNode;
                }

                if (field.align && pNode && pNode.nodeName === "w:p") {
                    let pPr = pNode.getElementsByTagName("w:pPr")[0];
                    if (!pPr) {
                        pPr = xmlDoc.createElement("w:pPr");
                        pNode.insertBefore(pPr, pNode.firstChild);
                    }
                    let jc = pPr.getElementsByTagName("w:jc")[0];
                    if (!jc) {
                        jc = xmlDoc.createElement("w:jc");
                        pPr.appendChild(jc);
                    }
                    // Word values: left, center, right, both (justified)
                    jc.setAttribute("w:val", field.align === 'center' ? 'center' : (field.align === 'right' ? 'right' : 'left'));
                }
            }
        }
    }

    const serializer = new XMLSerializer();
    const newXml = serializer.serializeToString(xmlDoc);
    zip.file("word/document.xml", newXml);

    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync(filePath, buffer);
    return true;
}

/**
 * Main Sync Entry Point
 */
export async function syncTemplateStyle(filePath, fields) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.xlsx') return await syncExcelStyle(filePath, fields);
    if (ext === '.docx') return await syncWordStyle(filePath, fields);
    return false;
}
