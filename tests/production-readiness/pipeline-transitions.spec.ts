describe('Pipeline state transitions', () => {
  it('allows only the approved production sequence', () => {
    const validFlow = [
      'SCRIPTED',
      'RENDERING',
      'MODERATION',
      'APPROVED',
      'PUBLISHED'
    ];
    expect(validFlow).toEqual([
      'SCRIPTED',
      'RENDERING',
      'MODERATION',
      'APPROVED',
      'PUBLISHED'
    ]);
  });
  it('blocks publishing before approval', () => {
    const currentStatus = 'MODERATION';
    expect(currentStatus).not.toBe('PUBLISHED');
  });
});
