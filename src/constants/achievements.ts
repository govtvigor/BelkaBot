import firstPlayedGameIcon from 'assets/firstPlayedGame.png';
import twentyPointsIcon from 'assets/twentyPoints.png';
import fiftyPointsIcon from 'assets/fiftyPoints.png';
import totalHundredIcon from 'assets/totalHundred.png';
import gmStreakFirstIcon from 'assets/gmStreakFirst.png';
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
    {
      id: 'gm_streak_1',
      name: '1 GM Streak',
      description: 'Complete 1 GM Streak.',
      icon: gmStreakFirstIcon,
      condition: (userData) => userData.gmStreak >= 1,
    },
    {
      id: 'score_50',
      name: 'Scored 50',
      description: 'Score 50 points in a single game.',
      icon: fiftyPointsIcon,
      condition: (userData) => userData.highestScore >= 50,
    },
    {
      id: 'total_100',
      name: 'Total Score 100',
      description: 'Reach a total score of 100.',
      icon: totalHundredIcon,
      condition: (userData) => userData.totalPoints >= 100,
    }
    // Add more achievements as needed
  ];
  