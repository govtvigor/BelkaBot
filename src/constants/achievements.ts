export interface Achievement {
    id: string;
    name: string;
    description: string;
    condition: (userData: any) => boolean;
  }
  
  export const achievements: Achievement[] = [
    {
      id: 'first_game',
      name: 'First Steps',
      description: 'Play your first game.',
      condition: (userData) => userData.gamesPlayed >= 1,
    },
    {
      id: 'score_20',
      name: 'Scored 20',
      description: 'Score 20 points in a single game.',
      condition: (userData) => userData.highestScore >= 20,
    },
    // Add more achievements as needed
  ];
  