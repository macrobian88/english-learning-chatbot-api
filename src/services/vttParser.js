/**
 * Parse VTT content and extract plain text
 */
function parseVTT(vttContent) {
  if (!vttContent || typeof vttContent !== 'string') return '';

  const lines = vttContent.split('\n');
  const textLines = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    if (trimmedLine.startsWith('WEBVTT')) continue;
    if (trimmedLine.startsWith('NOTE')) continue;
    if (trimmedLine.startsWith('STYLE')) continue;
    if (trimmedLine.startsWith('REGION')) continue;
    if (/^[a-zA-Z0-9-]+$/.test(trimmedLine) && !trimmedLine.includes(' ')) continue;
    if (trimmedLine.includes('-->')) continue;
    if (/^\d{2}:\d{2}/.test(trimmedLine)) continue;

    let cleanedLine = trimmedLine
      .replace(/<v[^>]*>/g, '')
      .replace(/<\/v>/g, '')
      .replace(/<c[^>]*>/g, '')
      .replace(/<\/c>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();

    if (cleanedLine) textLines.push(cleanedLine);
  }

  return textLines.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Parse VTT with timestamps preserved
 */
function parseVTTWithTimestamps(vttContent) {
  if (!vttContent || typeof vttContent !== 'string') return [];

  const segments = [];
  const lines = vttContent.split('\n');
  let currentSegment = null;
  let textBuffer = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    const timestampMatch = trimmedLine.match(
      /(\d{2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})/
    );

    if (timestampMatch) {
      if (currentSegment && textBuffer.length > 0) {
        currentSegment.text = textBuffer.join(' ').replace(/<[^>]+>/g, '').trim();
        if (currentSegment.text) segments.push(currentSegment);
      }
      currentSegment = { start: timestampMatch[1], end: timestampMatch[2], text: '' };
      textBuffer = [];
    } else if (currentSegment && trimmedLine && !trimmedLine.startsWith('WEBVTT')) {
      if (!/^[a-zA-Z0-9-]+$/.test(trimmedLine) || trimmedLine.includes(' ')) {
        textBuffer.push(trimmedLine);
      }
    }
  }

  if (currentSegment && textBuffer.length > 0) {
    currentSegment.text = textBuffer.join(' ').replace(/<[^>]+>/g, '').trim();
    if (currentSegment.text) segments.push(currentSegment);
  }

  return segments;
}

module.exports = { parseVTT, parseVTTWithTimestamps };
