const { splitIntoChunks } = require('../src/services/chunkingService');

describe('Chunking Service', () => {
  describe('splitIntoChunks', () => {
    it('should return single chunk for short text', () => {
      const text = 'This is a short text.';
      const chunks = splitIntoChunks(text, 100, 10);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(text);
    });

    it('should split long text into overlapping chunks', () => {
      const words = Array.from({ length: 100 }, (_, i) => `word${i}`);
      const text = words.join(' ');
      
      const chunks = splitIntoChunks(text, 30, 5);
      
      expect(chunks.length).toBeGreaterThan(1);
      
      const chunk1Words = chunks[0].split(' ');
      const chunk2Words = chunks[1].split(' ');
      const lastWordsOfChunk1 = chunk1Words.slice(-5);
      const firstWordsOfChunk2 = chunk2Words.slice(0, 5);
      
      expect(lastWordsOfChunk1).toEqual(firstWordsOfChunk2);
    });

    it('should handle empty text', () => {
      const chunks = splitIntoChunks('', 100, 10);
      expect(chunks).toHaveLength(0);
    });
  });
});
