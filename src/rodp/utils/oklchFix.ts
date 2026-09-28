function oklchToRgb(l: number, c: number, h: number, a?: number): string {
  if (isNaN(l)) l = 0;
  if (isNaN(c)) c = 0;
  if (isNaN(h)) h = 0;

  const rad = (h * Math.PI) / 180;
  const a_lab = c * Math.cos(rad);
  const b_lab = c * Math.sin(rad);

  const l_ = l + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
  const m_ = l - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
  const s_ = l - 0.0894841775 * a_lab - 1.2914855480 * b_lab;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  const gamma = (x: number) => {
    x = Math.max(0, Math.min(1, x));
    return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  };

  const r255 = Math.round(gamma(r) * 255);
  const g255 = Math.round(gamma(g) * 255);
  const b255 = Math.round(gamma(b) * 255);

  if (a !== undefined && !isNaN(a) && a < 1) {
    return `rgba(${r255}, ${g255}, ${b255}, ${a})`;
  }
  return `rgb(${r255}, ${g255}, ${b255})`;
}

export function convertOklchToRgb(str: string): string {
  if (!str || typeof str !== 'string' || !str.includes('oklch')) {
    return str;
  }

  return str.replace(
    /oklch\(\s*([\d.%]+)\s+([\d.%]+)\s+([\d.%]+|none)(?:\s*\/\s*([\d.%]+))?\s*\)/gi,
    (match, p1, p2, p3, p4) => {
      try {
        const l = p1.endsWith('%') ? parseFloat(p1) / 100 : parseFloat(p1);
        const c = p2.endsWith('%') ? parseFloat(p2) / 100 : parseFloat(p2);
        const h = p3 === 'none' ? 0 : parseFloat(p3);
        let a: number | undefined = undefined;
        if (p4 !== undefined) {
          a = p4.endsWith('%') ? parseFloat(p4) / 100 : parseFloat(p4);
        }
        return oklchToRgb(l, c, h, a);
      } catch (e) {
        return 'rgb(0, 0, 0)';
      }
    }
  );
}

export function sanitizeDocForHtml2Canvas(clonedDoc: Document) {
  // 1. Process style tags
  const styleElements = clonedDoc.querySelectorAll('style');
  styleElements.forEach((style) => {
    if (style.textContent && style.textContent.includes('oklch')) {
      style.textContent = convertOklchToRgb(style.textContent);
    }
  });

  // 2. Process elements with inline style or css text
  const allElements = clonedDoc.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.style && htmlEl.style.cssText && htmlEl.style.cssText.includes('oklch')) {
      htmlEl.style.cssText = convertOklchToRgb(htmlEl.style.cssText);
    }
  });

  // 3. Process stylesheets
  try {
    Array.from(clonedDoc.styleSheets).forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach((rule, idx) => {
          if (rule.cssText && rule.cssText.includes('oklch')) {
            const newText = convertOklchToRgb(rule.cssText);
            try {
              sheet.deleteRule(idx);
              sheet.insertRule(newText, idx);
            } catch (e) {
              // Ignore rule error
            }
          }
        });
      } catch (e) {
        // Ignore cross-origin sheet
      }
    });
  } catch (e) {
    // Ignore error
  }
}
