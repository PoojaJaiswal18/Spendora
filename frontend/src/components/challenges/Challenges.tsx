import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Fade,
  Grow,
  useTheme,
  Tab,
  Tabs,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  EmojiEvents,
  LocalCafe,
  ShoppingCart,
  DirectionsCar,
  Restaurant,
  Star,
  Timer,
  Group,
  TrendingUp,
  Share,
  Add,
} from '@mui/icons-material';

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'daily';
  target: number;
  current: number;
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard';
  participants: number;
  timeLeft: string;
  icon: React.ReactNode;
  category: string;
  isJoined: boolean;
}

const Challenges: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const challenges: Challenge[] = [
    {
      id: 1,
      title: 'No Coffee Week',
      description: 'Skip coffee purchases for a week and save money',
      type: 'weekly',
      target: 7,
      current: 3,
      reward: '50 points + $25 saved',
      difficulty: 'medium',
      participants: 1247,
      timeLeft: '4 days left',
      icon: <LocalCafe />,
      category: 'Food & Dining',
      isJoined: true,
    },
    {
      id: 2,
      title: 'Under $50 Grocery Challenge',
      description: 'Keep your weekly grocery spending under $50',
      type: 'weekly',
      target: 50,
      current: 32,
      reward: '75 points + Badge',
      difficulty: 'hard',
      participants: 892,
      timeLeft: '2 days left',
      icon: <ShoppingCart />,
      category: 'Shopping',
      isJoined: true,
    },
    {
      id: 3,
      title: 'Walk Instead of Ride',
      description: 'Use public transport or walk instead of rideshare',
      type: 'weekly',
      target: 5,
      current: 0,
      reward: '30 points',
      difficulty: 'easy',
      participants: 2156,
      timeLeft: '6 days left',
      icon: <DirectionsCar />,
      category: 'Transportation',
      isJoined: false,
    },
    {
      id: 4,
      title: 'Home Cooking Month',
      description: 'Cook at home for 20 days this month',
      type: 'monthly',
      target: 20,
      current: 12,
      reward: '200 points + Premium Badge',
      difficulty: 'hard',
      participants: 567,
      timeLeft: '18 days left',
      icon: <Restaurant />,
      category: 'Food & Dining',
      isJoined: true,
    },
  ];

  const completedChallenges = [
    {
      id: 5,
      title: 'Weekend Saver',
      description: 'Spend less than $100 on weekends',
      reward: '100 points earned',
      completedDate: '2024-01-15',
      icon: <EmojiEvents />,
    },
    {
      id: 6,
      title: 'Daily Budget Master',
      description: 'Stay under daily budget for 10 days',
      reward: '150 points earned',
      completedDate: '2024-01-10',
      icon: <Star />,
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah Johnson', points: 2850, avatar: 'S' },
    { rank: 2, name: 'Mike Chen', points: 2720, avatar: 'M' },
    { rank: 3, name: 'Emily Davis', points: 2650, avatar: 'E' },
    { rank: 4, name: 'You', points: 2480, avatar: 'Y', isUser: true },
    { rank: 5, name: 'Alex Wilson', points: 2350, avatar: 'A' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'hard': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Fade in timeout={300}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            className="gradient-text responsive-text-lg"
            sx={{ mb: 1 }}
          >
            Spending Challenges 🏆
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Join challenges, save money, and compete with friends
          </Typography>
        </Box>
      </Fade>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={500}>
            <Card
              className="interactive-card"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.primary.dark}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    animation: 'float 3s ease-in-out infinite',
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" fontWeight="bold">
                  2,480
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Points
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={600}>
            <Card
              className="interactive-card"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main}10, ${theme.palette.success.dark}05)`,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '0.5s',
                  }}
                >
                  <Star sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" fontWeight="bold">
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={700}>
            <Card
              className="interactive-card"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.warning.main}10, ${theme.palette.warning.dark}05)`,
                border: `1px solid ${theme.palette.warning.main}20`,
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '1s',
                  }}
                >
                  <Timer sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" fontWeight="bold">
                  3
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={800}>
            <Card
              className="interactive-card"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}10, ${theme.palette.secondary.dark}05)`,
                border: `1px solid ${theme.palette.secondary.main}20`,
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '1.5s',
                  }}
                >
                  <TrendingUp sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" fontWeight="bold">
                  #4
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rank
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Fade in timeout={900}>
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
              },
              '& .MuiTabs-indicator': {
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                height: 3,
                borderRadius: 2,
              },
            }}
          >
            <Tab label="Active Challenges" />
            <Tab label="Completed" />
            <Tab label="Leaderboard" />
          </Tabs>
        </Box>
      </Fade>

      {/* Active Challenges Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {challenges.map((challenge, index) => (
            <Grid item xs={12} lg={6} key={challenge.id}>
              <Grow in timeout={1000 + index * 100}>
                <Card
                  className="interactive-card"
                  sx={{
                    background: challenge.isJoined 
                      ? `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.primary.dark}05)`
                      : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover}50 100%)`,
                    border: challenge.isJoined 
                      ? `1px solid ${theme.palette.primary.main}30`
                      : `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            background: `linear-gradient(135deg, ${getDifficultyColor(challenge.difficulty)}, ${getDifficultyColor(challenge.difficulty)}80)`,
                            width: 48,
                            height: 48,
                          }}
                        >
                          {challenge.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {challenge.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {challenge.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Share Challenge">
                          <IconButton size="small">
                            <Share />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {challenge.current}/{challenge.target}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getProgressPercentage(challenge.current, challenge.target)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: `${getDifficultyColor(challenge.difficulty)}20`,
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${getDifficultyColor(challenge.difficulty)}, ${getDifficultyColor(challenge.difficulty)}80)`,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                      <Chip
                        label={challenge.difficulty.toUpperCase()}
                        size="small"
                        sx={{
                          background: `${getDifficultyColor(challenge.difficulty)}20`,
                          color: getDifficultyColor(challenge.difficulty),
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={challenge.type}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Group />}
                        label={`${challenge.participants} joined`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Reward: {challenge.reward}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {challenge.timeLeft}
                        </Typography>
                      </Box>
                      <Button
                        variant={challenge.isJoined ? 'outlined' : 'contained'}
                        size="small"
                        sx={{
                          background: !challenge.isJoined 
                            ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                            : 'transparent',
                          '&:hover': {
                            background: !challenge.isJoined 
                              ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                              : `${theme.palette.primary.main}10`,
                          },
                        }}
                      >
                        {challenge.isJoined ? 'View Progress' : 'Join Challenge'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Completed Challenges Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {completedChallenges.map((challenge, index) => (
            <Grid item xs={12} md={6} key={challenge.id}>
              <Grow in timeout={1000 + index * 100}>
                <Card
                  className="hover-lift"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.main}10, ${theme.palette.success.dark}05)`,
                    border: `1px solid ${theme.palette.success.main}20`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {challenge.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {challenge.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {challenge.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          {challenge.reward}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed on {challenge.completedDate}
                        </Typography>
                      </Box>
                      <Chip
                        label="COMPLETED"
                        size="small"
                        sx={{
                          background: `${theme.palette.success.main}20`,
                          color: theme.palette.success.main,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 2 && (
        <Fade in timeout={1000}>
          <Card className="hover-lift">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Global Leaderboard 🏆
              </Typography>
              
              {leaderboard.map((user, index) => (
                <Fade in timeout={1100 + index * 100} key={user.rank}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 2,
                      mb: 1,
                      background: user.isUser 
                        ? `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.primary.dark}05)`
                        : 'transparent',
                      border: user.isUser 
                        ? `1px solid ${theme.palette.primary.main}30`
                        : '1px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: user.isUser 
                          ? `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.dark}08)`
                          : `${theme.palette.action.hover}`,
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          color: user.rank <= 3 
                            ? user.rank === 1 
                              ? '#FFD700' 
                              : user.rank === 2 
                                ? '#C0C0C0' 
                                : '#CD7F32'
                            : theme.palette.text.secondary,
                          minWidth: 30,
                        }}
                      >
                        #{user.rank}
                      </Typography>
                      <Avatar
                        sx={{
                          background: user.isUser 
                            ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                            : `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                          width: 40,
                          height: 40,
                        }}
                      >
                        {user.avatar}
                      </Avatar>
                      <Typography variant="body1" fontWeight={user.isUser ? 'bold' : 'normal'}>
                        {user.name}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {user.points.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        points
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ))}
            </CardContent>
          </Card>
        </Fade>
      )}
    </Box>
  );
};

export default Challenges;
