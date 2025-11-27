const { parseVTT, parseVTTWithTimestamps } = require('../src/services/vttParser');

describe('VTT Parser', () => {
  describe('parseVTT', () => {
    it('should extract plain text from VTT content', () => {
      const vtt = `WEBVTT

00:00:00.000 --> 00:00:05.000
Hello, welcome to the lesson.

00:00:05.000 --> 00:00:10.000
Today we will learn about present perfect.`;

      const result = parseVTT(vtt);
      expect(result).toBe('Hello, welcome to the lesson. Today we will learn about present perfect.');
    });

    it('should handle empty content', () => {
      expect(parseVTT('')).toBe('');
      expect(parseVTT(null)).toBe('');
    });

    it('should remove VTT formatting tags', () => {
      const vtt = `WEBVTT

00:00:00.000 --> 00:00:05.000
<v Speaker>Hello everyone</v>`;

      const result = parseVTT(vtt);
      expect(result).toBe('Hello everyone');
    });
  });

  describe('parseVTTWithTimestamps', () => {
    it('should return segments with timestamps', () => {
      const vtt = `WEBVTT

00:00:00.000 --> 00:00:05.000
First segment

00:00:05.000 --> 00:00:10.000
Second segment`;

      const result = parseVTTWithTimestamps(vtt);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        start: '00:00:00.000',
        end: '00:00:05.000',
        text: 'First segment'
      });
    });
  });
});
