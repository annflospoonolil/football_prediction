export const QUESTION_TEMPLATES = {
  WINNER: {
    text: 'Who will win?',
    type: 'OPTION',
    generateOptions: (match) => [
      { text: match.teamA.name },
      { text: match.teamB.name },
      { text: 'Draw' },
    ],
  },

  SCORE: {
    text: 'Predict the final score',
    type: 'SCORE',
    generateOptions: () => [],
  },

  GOAL_SCORERS: {
    text: 'Goal scorers prediction',
    type: 'MULTI_SELECT',
    generateOptions: (match) => [
      ...match.teamA.players.map((p) => ({
        id: p.id,
        text: p.name,
        team: 'A',
      })),
      ...match.teamB.players.map((p) => ({
        id: p.id,
        text: p.name,
        team: 'B',
      })),
    ],
  },

  MOTM: {
    text: 'Man of the Match',
    type: 'OPTION',
    generateOptions: (match) => [
      ...match.teamA.players.map((p) => ({ text: p.name })),
      ...match.teamB.players.map((p) => ({ text: p.name })),
    ],
  },

  POSSESSION: {
    text: 'Who will dominate possession?',
    type: 'OPTION',
    generateOptions: (match) => [
      { text: match.teamA.name },
      { text: match.teamB.name },
      { text: '50-50' },
    ],
  },
};
