import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid, // Using new Grid (formerly Grid2)
  Chip,
  Avatar,
  LinearProgress,
  Fade,
  Grow,
  useTheme,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Analytics as AnalyticsIcon,
  PieChart,
  BarChart,
  Timeline,
  Insights,
  Compare,
  CalendarMonth,
} from '@mui/icons-material';
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale,
} from 'chart.js';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { COLORS, ANIMATION_DURATIONS } from '../../utils/constants';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale
);

const Analytics: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<string>('month');

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: string | null
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
      
      // Store user preference in localStorage
      try {
        localStorage.setItem('analyticsTimeRange', newTimeRange);
      } catch (error) {
        console.warn('Failed to save analytics time range preference:', error);
      }
    }
  };

  const spendingTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'This Year',
        data: [1200, 1900, 800, 1500, 2000, 1700],
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}20`,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: COLORS.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Last Year',
        data: [1000, 1600, 900, 1300, 1800, 1500],
        borderColor: COLORS.secondary,
        backgroundColor: `${COLORS.secondary}20`,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: COLORS.secondary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const categoryData = {
    labels: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills', 'Healthcare'],
    datasets: [
      {
        data: [35, 20, 25, 10, 8, 2],
        backgroundColor: [
          COLORS.primary,
          COLORS.secondary,
          COLORS.success,
          COLORS.warning,
          COLORS.error,
          COLORS.info,
        ],
        borderWidth: 0,
        hoverBorderWidth: 4,
        hoverBorderColor: '#fff',
      },
    ],
  };

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Spending',
        data: [120, 80, 150, 200, 180, 300, 250],
        backgroundColor: `${COLORS.primary}80`,
        borderColor: COLORS.primary,
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: COLORS.primary,
      },
    ],
  };

  const spendingPatternData = {
    labels: ['Morning', 'Afternoon', 'Evening', 'Night', 'Weekend', 'Weekday'],
    datasets: [
      {
        label: 'Spending Pattern',
        data: [65, 85, 90, 45, 80, 70],
        backgroundColor: `${COLORS.primary}30`,
        borderColor: COLORS.primary,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.palette.text.primary,
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Inter, sans-serif',
            weight: 500 as const, // FIXED: Use proper type
          },
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        cornerRadius: 12,
        titleFont: {
          family: 'Inter, sans-serif',
          weight: 600 as const, // FIXED: Use proper type
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          weight: 'normal' as const, // FIXED: Use proper type
        },
      },
    },
    scales: {
      x: {
        ticks: { 
          color: theme.palette.text.secondary,
          font: { family: 'Inter, sans-serif' }
        },
        grid: { color: theme.palette.divider },
      },
      y: {
        ticks: { 
          color: theme.palette.text.secondary,
          font: { family: 'Inter, sans-serif' }
        },
        grid: { color: theme.palette.divider },
      },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: theme.palette.text.primary,
          usePointStyle: true,
          padding: 15,
          font: {
            family: 'Inter, sans-serif',
            weight: 500 as const, // FIXED: Use proper type
          },
        },
      },
      tooltip: chartOptions.plugins.tooltip,
    },
  };

  const radarOptions = {
    ...chartOptions,
    scales: {
      r: {
        ticks: { 
          color: theme.palette.text.secondary,
          font: { family: 'Inter, sans-serif' }
        },
        grid: { color: theme.palette.divider },
        pointLabels: { 
          color: theme.palette.text.primary,
          font: { family: 'Inter, sans-serif' }
        },
      },
    },
  };

  const insights = [
    {
      title: 'Peak Spending Day',
      value: 'Saturday',
      change: '+15%',
      trend: 'up' as const,
      icon: '📅',
      description: 'You spend the most on weekends',
    },
    {
      title: 'Top Category',
      value: 'Food & Dining',
      change: '35%',
      trend: 'neutral' as const,
      icon: '🍽️',
      description: 'of total expenses',
    },
    {
      title: 'Average Transaction',
      value: formatCurrency(24.50),
      change: '-8%',
      trend: 'down' as const,
      icon: '💳',
      description: 'Lower than last month',
    },
    {
      title: 'Monthly Budget',
      value: '68%',
      change: '+12%',
      trend: 'up' as const,
      icon: '🎯',
      description: 'of budget used',
    },
  ];

  const totalSpent = 2847;
  const budgetLimit = 4200;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Fade in timeout={ANIMATION_DURATIONS.MEDIUM}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            className="gradient-text responsive-text-lg"
            sx={{ mb: 1 }}
          >
            Smart Analytics 📈
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Deep insights into your spending patterns and trends
          </Typography>
        </Box>
      </Fade>

      {/* Time Range Selector */}
      <Fade in timeout={ANIMATION_DURATIONS.LONG}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            sx={{
              background: theme.palette.background.paper,
              borderRadius: '20px',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '20px !important',
                px: 3,
                py: 1,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                '&.Mui-selected': {
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${theme.palette.primary.dark})`,
                  color: 'white',
                  transform: 'scale(1.05)',
                },
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              },
            }}
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="quarter">Quarter</ToggleButton>
            <ToggleButton value="year">Year</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Fade>

      {/* Insights Cards - FIXED: Updated Grid syntax for MUI v7 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {insights.map((insight, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={insight.title}>
            <Grow in timeout={600 + index * 100}>
              <Card
                className="interactive-card"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${COLORS.primary}05 100%)`,
                  border: `1px solid ${COLORS.primary}20`,
                  transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${COLORS.primary}20`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3" sx={{ fontSize: '2rem' }}>
                      {insight.icon}
                    </Typography>
                    {insight.trend === 'up' && <TrendingUp sx={{ color: COLORS.success }} />}
                    {insight.trend === 'down' && <TrendingDown sx={{ color: COLORS.error }} />}
                  </Box>
                  
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, fontFamily: 'Inter, sans-serif' }}>
                    {insight.value}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontFamily: 'Inter, sans-serif' }}>
                    {insight.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={insight.change}
                      size="small"
                      sx={{
                        background: insight.trend === 'up' 
                          ? `${COLORS.success}20` 
                          : insight.trend === 'down'
                          ? `${COLORS.error}20`
                          : `${COLORS.primary}20`,
                        color: insight.trend === 'up' 
                          ? COLORS.success 
                          : insight.trend === 'down'
                          ? COLORS.error
                          : COLORS.primary,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontFamily: 'Inter, sans-serif' }}>
                    {insight.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section - FIXED: Updated Grid syntax for MUI v7 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Grow in timeout={1000}>
            <Card className="hover-lift">
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: 'Inter, sans-serif' }}>
                    Spending Trends Comparison
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Compare />}
                    sx={{ 
                      borderRadius: '20px',
                      fontFamily: 'Inter, sans-serif',
                      transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}
                  >
                    Compare Periods
                  </Button>
                </Box>
                <Box sx={{ height: 350 }}>
                  <Line data={spendingTrendData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Grow in timeout={1200}>
            <Card className="hover-lift">
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Inter, sans-serif' }}>
                  Category Distribution
                </Typography>
                <Box sx={{ height: 350 }}>
                  <Doughnut data={categoryData} options={doughnutOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Grow in timeout={1400}>
            <Card className="hover-lift">
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Inter, sans-serif' }}>
                  Weekly Spending Pattern
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={weeklyData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Grow in timeout={1600}>
            <Card className="hover-lift">
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Inter, sans-serif' }}>
                  Spending Behavior Analysis
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Radar data={spendingPatternData} options={radarOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* AI Insights Section */}
      <Fade in timeout={1800}>
        <Card
          className="hover-lift"
          sx={{
            mt: 4,
            background: `linear-gradient(135deg, ${COLORS.info}10, ${theme.palette.info.dark}05)`,
            border: `1px solid ${COLORS.info}20`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  background: `linear-gradient(135deg, ${COLORS.info}, ${theme.palette.info.dark})`,
                  animation: 'glow 2s ease-in-out infinite alternate',
                }}
              >
                <Insights />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: 'Inter, sans-serif' }}>
                AI-Powered Insights
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 3, borderRadius: 2, background: `${theme.palette.background.default}50` }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Inter, sans-serif' }}>
                    💡 Smart Recommendations
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'Inter, sans-serif' }}>
                    Based on your spending patterns, here are some personalized suggestions:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Chip 
                      label="Consider setting a $300 weekly food budget" 
                      size="small" 
                      sx={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <Chip 
                      label="You could save $50/month on transportation" 
                      size="small" 
                      sx={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <Chip 
                      label="Weekend spending is 40% higher than weekdays" 
                      size="small" 
                      sx={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 3, borderRadius: 2, background: `${theme.palette.background.default}50` }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Inter, sans-serif' }}>
                    📊 Trend Predictions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'Inter, sans-serif' }}>
                    AI forecasts for next month based on current patterns:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif' }}>
                        Predicted spending: {formatCurrency(2950)}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={75}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: `${COLORS.info}20`,
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${COLORS.info}, ${theme.palette.info.dark})`,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                      Budget utilization: {formatPercentage(totalSpent, budgetLimit)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default Analytics;
