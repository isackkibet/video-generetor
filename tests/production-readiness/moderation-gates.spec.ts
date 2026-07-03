describe('Moderation gates', () => {
  function canPublish(status: string, latestAction?: string) {
    return status === 'APPROVED' && ['ALLOW', 'LIMIT'].includes(latestAction || '');
  }
  it('allows publishing only after ALLOW moderation', () => {
    expect(canPublish('APPROVED', 'ALLOW')).toBe(true);
  });
  it('allows publishing only after LIMIT moderation', () => {
    expect(canPublish('APPROVED', 'LIMIT')).toBe(true);
  });
  it('blocks REVIEW content from publishing', () => {
    expect(canPublish('MODERATION', 'REVIEW')).toBe(false);
  });
  it('blocks BLOCK content from publishing', () => {
    expect(canPublish('REJECTED', 'BLOCK')).toBe(false);
  });
});
