import fs from 'fs';
import path from 'path';
import createReport from 'docx-templates';
import ExcelJS from 'exceljs';

/**
 * Shared Document Generation Service
 * Handles filling docx/xlsx templates and applying smart formatting (shrink-to-fit, etc.)
 */

/**
 * Generate a filled Word (.docx) document
 */
export async function generateWordDocument(templatePath, outputPath, data, fieldsMetadata) {
    const template = fs.readFileSync(templatePath);
    
    // Preparation for Smart Font Sizing
    // We build a list of commands that docx-templates can use
    const commands = {};
    for (const field of fieldsMetadata) {
        if (field.shrinkToFit) {
            const rawVal = data[field.field] || '';
            const threshold = field.maxLength || 20;
            
            // If the text is too long, we calculate a smaller font size
            if (rawVal.length > threshold) {
                const reducedSize = Math.max(6, 12 - (rawVal.length - threshold) / 4);
                // Return a docx-templates compatible raw XML run if needed
                // For now, we'll provide the value and assume the template uses formatting
                // In a production environment, we could use a custom 'f:' function to return XML
            }
        }
    }

    const buffer = await createReport({
        template,
        data: data,
        cmdDelimiter: ['{{', '}}'],
        additionalJsContext: {
            // Helper for dynamic formatting if the user wants to use {{f:shrink(name)}}
            shrink: (text, threshold = 20) => {
                if (!text) return '';
                if (text.length > threshold) {
                    // Logic to return a smaller font version
                    return text;
                }
                return text;
            }
        }
    });

    fs.writeFileSync(outputPath, buffer);
    return outputPath;
}

/**
 * Generate a filled Excel (.xlsx) document
 */
export async function generateExcelDocument(templatePath, outputPath, data, fieldsMetadata) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    workbook.eachSheet((sheet) => {
        sheet.eachRow((row) => {
            row.eachCell((cell) => {
                if (typeof cell.value === 'string') {
                    // Match {{tag}}
                    const matches = cell.value.match(/{{(.+?)}}/g);
                    if (matches) {
                        let cellText = cell.value;
                        for (const match of matches) {
                            const tagName = match.replace(/{{|}}/g, '');
                            const val = data[tagName] || '';
                            cellText = cellText.replace(match, val);

                            // Apply Style Metadata if found
                            const meta = fieldsMetadata.find(f => f.field === tagName);
                            if (meta) {
                                cell.alignment = {
                                    ...cell.alignment,
                                    horizontal: meta.align || cell.alignment.horizontal,
                                    wrapText: meta.isMultiLine || cell.alignment.wrapText,
                                    shrinkToFit: meta.shrinkToFit || cell.alignment.shrinkToFit
                                };
                                if (meta.bold) cell.font = { ...cell.font, bold: true };
                            }
                        }
                        cell.value = cellText;
                    }
                }
            });
        });
    });

    await workbook.xlsx.writeFile(outputPath);
    return outputPath;
}

export async function generateDocument(templatePath, outputPath, data, fieldsMetadataJson) {
    const fieldsMetadata = typeof fieldsMetadataJson === 'string' ? JSON.parse(fieldsMetadataJson) : (fieldsMetadataJson || []);
    const ext = path.extname(templatePath).toLowerCase();
    
    if (ext === '.docx') return await generateWordDocument(templatePath, outputPath, data, fieldsMetadata);
    if (ext === '.xlsx') return await generateExcelDocument(templatePath, outputPath, data, fieldsMetadata);
    throw new Error(`Unsupported document extension: ${ext}`);
}
