export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: (userData: any) => boolean;
  }
  
  export const achievements: Achievement[] = [
    {
      id: 'first_game',
      name: 'First Steps',
      description: 'Play your first game.',
      icon: '/assets/firstGamePlayed.png',
      condition: (userData) => userData.gamesPlayed >= 1,
    },
    {
      id: 'score_20',
      name: 'Scored 20',
      description: 'Score 20 points in a single game.',
      icon: '/assets/twentyPoints.png',
      condition: (userData) => userData.highestScore >= 20,
    },
    // Add more achievements as needed
  ];
  