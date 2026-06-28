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
        text: p.name,
        teamId: match.teamA.id,
        teamSide: 'A',
      })),
      ...match.teamB.players.map((p) => ({
        text: p.name,
        teamId: match.teamB.id,
        teamSide: 'B',
      })),
      {
        text: 'Own Goal (Conceded by Team A)',
        teamId: match.teamA.id,
        teamSide: 'A',
      },
      {
        text: 'Own Goal (Conceded by Team B)',
        teamId: match.teamB.id,
        teamSide: 'B',
      },
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
