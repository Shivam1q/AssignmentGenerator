const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateLocalPdf(resultDoc) {
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `paper-${resultDoc.assignmentId}-${Date.now()}.pdf`;
  const filePath = path.join(uploadDir, fileName);

  const sectionsHtml = resultDoc.sections.map((sec) => `
    <div class="section">
      <div class="section-title">${sec.title}</div>
      <div style="font-style: italic; margin-bottom: 10px;">${sec.instruction}</div>
      ${sec.questions.map((q) => `
        <div class="question" style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px;">
          <div style="flex: 1; padding-right: 20px;">
            <strong style="margin-right: 8px;">Q${q.number}.</strong> ${q.text}
            ${q.options && q.options.length > 0 ? `
              <ol type="A" style="margin-top: 8px; margin-bottom: 0; padding-left: 20px;">
                ${q.options.map(opt => `<li>${opt}</li>`).join('')}
              </ol>
            ` : ''}
          </div>
          <div style="flex-shrink: 0; text-align: right; font-size: 11px; color: #555; background: #fafafa; padding: 6px 10px; border: 1px solid #eaeaea; border-radius: 6px;">
             <span style="text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 0.5px;">${q.difficulty}</span> <br/>
             <span style="color: #2b2b2b; font-size: 13px; margin-top: 6px; display: inline-block; font-weight: bold;">${q.marks} Marks</span>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');

  const answerKeyHtml = resultDoc.answerKey.map((ans) => `
    <div class="answer">
      <strong>A${ans.number}.</strong> ${ans.answer}
    </div>
  `).join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Question Paper</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
      .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
      .school-name { font-size: 24px; font-weight: bold; text-transform: uppercase; }
      .subject { font-size: 20px; margin-top: 5px; }
      .meta { display: flex; justify-content: space-between; margin-top: 15px; font-weight: bold; }
      .section { margin-top: 30px; }
      .section-title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 10px; text-decoration: underline; }
      .question { margin-bottom: 15px; font-size: 14px; line-height: 1.5; }
      .page-break { page-break-before: always; }
      .answer { margin-bottom: 10px; font-size: 13px; line-height: 1.4; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="school-name">${resultDoc.schoolName || 'Assessment'}</div>
      <div class="subject">${resultDoc.className ? `Class ${resultDoc.className} • ` : ''}${resultDoc.subject || ''}</div>
      <div class="meta">
        <span>Time Allowed: ${resultDoc.timeAllowed || 'N/A'}</span>
        <span>Maximum Marks: ${resultDoc.maximumMarks || 'N/A'}</span>
      </div>
    </div>
    
    <div style="margin-bottom: 20px; font-style: italic; font-size: 14px;">
      ${resultDoc.generalInstruction || ''}
    </div>

    ${sectionsHtml}

    <div class="page-break"></div>
    <div class="header">
      <div class="school-name">Answer Key</div>
    </div>
    ${answerKeyHtml}
  </body>
  </html>
  `;

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: filePath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
  });

  await browser.close();

  return fileName;
}

module.exports = { generateLocalPdf };
