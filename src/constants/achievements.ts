import firstPlayedGameIcon from 'assets/firstGamePlayed.png';
import twentyPointsIcon from 'assets/twentyPoints.png';
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
      description: 'Play your first g ame.',
      icon: firstPlayedGameIcon,
      condition: (userData) => userData.gamesPlayed >= 1,
    },
    {
      id: 'score_20',
      name: 'Scored 20',
      description: 'Score 20 points in a single game.',
      icon: twentyPointsIcon,
      condition: (userData) => userData.highestScore >= 20,
    },
    // Add more achievements as needed
  ];
  