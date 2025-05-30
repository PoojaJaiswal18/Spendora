import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Receipt,
  Category,
  DateRange,
  Add,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
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
} from 'chart.js';
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters';
import { COLORS, ANIMATION_DURATIONS } from '../../utils/constants';
import { localStorage } from '../../utils/localStorage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon, color, delay }) => {
  const theme = useTheme();
  
  return (
    <Grow in timeout={ANIMATION_DURATIONS.LONG + delay}>
      <Card
        className="interactive-card"
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${color}10 100%)`,
          border: `1px solid ${color}20`,
          position: 'relative',
          overflow: 'hidden',
          transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
          },
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: `0 8px 30px ${color}30`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Avatar
              sx={{
                background: `linear-gradient(135deg, ${color}, ${color}80)`,
                width: 56,
                height: 56,
                animation: 'float 3s ease-in-out infinite',
              }}
            >
              {icon}
            </Avatar>
            <IconButton 
              size="small" 
              sx={{ 
                color: theme.palette.text.secondary,
                transition: `all ${ANIMATION_DURATIONS.SHORT}ms ease`,
                '&:hover': { transform: 'rotate(90deg)' }
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>

          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: theme.palette.text.primary }}>
            {value}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {trend === 'up' ? (
              <ArrowUpward sx={{ color: COLORS.success, fontSize: 16 }} />
            ) : (
              <ArrowDownward sx={{ color: COLORS.error, fontSize: 16 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: trend === 'up' ? COLORS.success : COLORS.error,
                fontWeight: 600,
              }}
            >
              {change}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs last month
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    
    // Store dashboard visit
    localStorage.setItem('lastDashboardVisit', new Date().toISOString());
    
    return () => clearTimeout(timer);
  }, []);

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
            weight: '500',
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
          weight: '600',
        },
        bodyFont: {
          family: 'Inter, sans-serif',
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

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Expenses',
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
    ],
  };

  const doughnutData = {
    labels: ['Food & Dining', 'Transportation', 'Shopping', 'Bills', 'Entertainment'],
    datasets: [
      {
        data: [30, 20, 25, 15, 10],
        backgroundColor: [
          COLORS.primary,
          COLORS.secondary,
          COLORS.success,
          COLORS.warning,
          COLORS.error,
        ],
        borderWidth: 0,
        hoverBorderWidth: 4,
        hoverBorderColor: '#fff',
      },
    ],
  };

  const recentTransactions = [
    { id: 1, merchant: 'Starbucks', amount: 15.50, category: 'Food & Dining', date: '2024-01-15', icon: '☕' },
    { id: 2, merchant: 'Uber', amount: 25.00, category: 'Transportation', date: '2024-01-14', icon: '🚗' },
    { id: 3, merchant: 'Amazon', amount: 89.99, category: 'Shopping', date: '2024-01-13', icon: '📦' },
    { id: 4, merchant: 'Netflix', amount: 12.99, category: 'Entertainment', date: '2024-01-12', icon: '🎬' },
  ];

  const totalSpent = 2847;
  const budgetLimit = 4200;
  const budgetUsed = formatPercentage(totalSpent, budgetLimit);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} lg={3} key={item}>
              <Card sx={{ height: 200 }}>
                <CardContent>
                  <Box className="shimmer" sx={{ height: '100%', borderRadius: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Fade in timeout={ANIMATION_DURATIONS.MEDIUM}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            className="gradient-text responsive-text-lg"
            sx={{ mb: 1 }}
          >
            Welcome back! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Here's what's happening with your expenses today
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Spent This Month"
            value={formatCurrency(totalSpent)}
            change="+12.5%"
            trend="up"
            icon={<AttachMoney />}
            color={COLORS.primary}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Receipts"
            value="127"
            change="+8.2%"
            trend="up"
            icon={<Receipt />}
            color={COLORS.secondary}
            delay={100}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Categories Used"
            value="12"
            change="-2.1%"
            trend="down"
            icon={<Category />}
            color={COLORS.success}
            delay={200}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Avg. Daily Spend"
            value={formatCurrency(94.90)}
            change="+5.7%"
            trend="up"
            icon={<DateRange />}
            color={COLORS.warning}
            delay={300}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Grow in timeout={800}>
            <Card className="hover-lift">
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Spending Trends
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TrendingUp />}
                    sx={{ 
                      borderRadius: '20px',
                      transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}
                  >
                    View Details
                  </Button>
                </Box>
                <Box sx={{ height: 300 }}>
                  <Line data={lineChartData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Grow in timeout={1000}>
            <Card className="hover-lift">
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Category Breakdown
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut 
                    data={doughnutData} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: { 
                          position: 'bottom',
                          labels: {
                            ...chartOptions.plugins.legend.labels,
                            padding: 15,
                          }
                        }
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Recent Transactions & Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Fade in timeout={1200}>
            <Card className="hover-lift">
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Recent Transactions
                  </Typography>
                  <Button 
                    variant="text" 
                    size="small"
                    sx={{
                      transition: `all ${ANIMATION_DURATIONS.SHORT}ms ease`,
                      '&:hover': { transform: 'translateX(4px)' }
                    }}
                  >
                    View All
                  </Button>
                </Box>

                {recentTransactions.map((transaction, index) => (
                  <Fade in timeout={1300 + index * 100} key={transaction.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 2,
                        mb: 1,
                        transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                        cursor: 'pointer',
                        '&:hover': {
                          background: `${theme.palette.action.hover}`,
                          transform: 'translateX(4px)',
                          boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ background: 'transparent', fontSize: '1.5rem' }}>
                          {transaction.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            {transaction.merchant}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(transaction.date, 'short')}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" fontWeight="bold">
                          {formatCurrency(transaction.amount)}
                        </Typography>
                        <Chip
                          label={transaction.category}
                          size="small"
                          sx={{
                            background: `${COLORS.primary}20`,
                            color: COLORS.primary,
                            fontWeight: 500,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                    </Box>
                  </Fade>
                ))}
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Fade in timeout={1400}>
            <Card
              className="hover-lift"
              sx={{
                background: `linear-gradient(135deg, ${COLORS.primary}10, ${COLORS.secondary}05)`,
                border: `1px solid ${COLORS.primary}20`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Quick Actions
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${theme.palette.primary.dark})`,
                    transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${COLORS.primary})`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${COLORS.primary}40`,
                    },
                  }}
                  className="neon-button"
                >
                  Upload Receipt
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Receipt />}
                  sx={{ 
                    mb: 2, 
                    py: 1.5,
                    transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  Generate Report
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  sx={{ 
                    py: 1.5,
                    transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  View Analytics
                </Button>

                <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: `${theme.palette.background.default}50` }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Monthly Budget Progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(budgetUsed)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: `${COLORS.primary}20`,
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
                        borderRadius: 4,
                        transition: `all ${ANIMATION_DURATIONS.LONG}ms ease`,
                      },
                    }}
                    className="animated-progress"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {formatCurrency(totalSpent)} of {formatCurrency(budgetLimit)} used ({budgetUsed})
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
