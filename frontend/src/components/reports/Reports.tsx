import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid, // Using new Grid (formerly Grid2)
  TextField,
  MenuItem,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fade,
  Grow,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Assessment,
  FileDownload,
  PictureAsPdf,
  TableChart,
  DateRange,
  Category,
  TrendingUp,
  Receipt,
  FilterList,
  Search,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Bar, Pie } from 'react-chartjs-2';
import { formatCurrency, formatDate, formatFileSize } from '../../utils/formatters';
import { COLORS, ANIMATION_DURATIONS, CATEGORIES } from '../../utils/constants';
import { localStorage } from '../../utils/localStorage';

const Reports: React.FC = () => {
  const theme = useTheme();
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'monthly', label: 'Monthly Report', icon: <Assessment /> },
    { value: 'yearly', label: 'Yearly Report', icon: <TrendingUp /> },
    { value: 'category', label: 'Category Report', icon: <Category /> },
    { value: 'tax', label: 'Tax Report', icon: <Receipt /> },
  ];

  const categories = ['All Categories', ...CATEGORIES.map(cat => cat.name)];

  const mockData = [
    { id: 1, date: '2024-01-15', merchant: 'Starbucks', category: 'Food & Dining', amount: 15.50 },
    { id: 2, date: '2024-01-14', merchant: 'Uber', category: 'Transportation', amount: 25.00 },
    { id: 3, date: '2024-01-13', merchant: 'Amazon', category: 'Shopping', amount: 89.99 },
    { id: 4, date: '2024-01-12', merchant: 'Netflix', category: 'Entertainment', amount: 12.99 },
  ];

  const chartData = {
    labels: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment'],
    datasets: [
      {
        data: [450, 320, 280, 150],
        backgroundColor: [
          COLORS.primary,
          COLORS.secondary,
          COLORS.success,
          COLORS.warning,
        ],
        borderWidth: 0,
        hoverBorderWidth: 4,
        hoverBorderColor: '#fff',
      },
    ],
  };

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: [1200, 1900, 800, 1500, 2000, 1700],
        backgroundColor: `${COLORS.primary}80`,
        borderColor: COLORS.primary,
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: COLORS.primary,
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

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Store report generation in localStorage - FIXED: Use existing StorageKey
    const reportHistory = localStorage.getItem<any[]>('reportHistory', []) || [];
    const newReport = {
      id: Date.now(),
      type: reportType,
      dateRange,
      category: selectedCategory,
      generatedAt: new Date().toISOString(),
    };
    localStorage.setItem('reportHistory', [newReport, ...reportHistory.slice(0, 9)]);

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Simulate file download
    const filename = `report-${reportType}-${formatDate(new Date(), 'short')}.${format}`;
    console.log(`Downloading ${filename}`);
    
    // Store export action - FIXED: Use existing StorageKey with proper null safety
    const exportHistory = localStorage.getItem<any[]>('exportHistory', []) || [];
    localStorage.setItem('exportHistory', [
      { format, filename, timestamp: new Date().toISOString() },
      ...exportHistory.slice(0, 19)
    ]);
  };

  const totalExpenses = mockData.reduce((sum, item) => sum + item.amount, 0);
  const transactionCount = mockData.length;

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
            Financial Reports 📊
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Generate comprehensive expense reports and analytics
          </Typography>
        </Box>
      </Fade>

      {/* Report Configuration - FIXED: Updated Grid syntax for MUI v7 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Report Configuration
              </Typography>

              <TextField
                select
                label="Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {category !== 'All Categories' && (
                        <Typography sx={{ fontSize: '1.2rem' }}>
                          {CATEGORIES.find(cat => cat.name === category)?.icon}
                        </Typography>
                      )}
                      {category}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label="Start Date"
                    value={dateRange.start}
                    onChange={(date) => setDateRange(prev => ({ ...prev, start: date || new Date() }))}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label="End Date"
                    value={dateRange.end}
                    onChange={(date) => setDateRange(prev => ({ ...prev, end: date || new Date() }))}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateReport}
                disabled={isGenerating}
                sx={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${theme.palette.primary.dark})`,
                  transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${COLORS.primary}40`,
                  },
                  '&:disabled': {
                    background: theme.palette.action.disabled,
                  },
                }}
                className="neon-button"
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                sx={{
                  mt: 2,
                  transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              >
                Advanced Filters
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Export Options
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PictureAsPdf />}
                    onClick={() => handleExport('pdf')}
                    sx={{
                      py: 1.5,
                      transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: COLORS.error,
                        color: COLORS.error,
                      }
                    }}
                  >
                    Export as PDF
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TableChart />}
                    onClick={() => handleExport('excel')}
                    sx={{
                      py: 1.5,
                      transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: COLORS.success,
                        color: COLORS.success,
                      }
                    }}
                  >
                    Export as Excel
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<FileDownload />}
                    onClick={() => handleExport('csv')}
                    sx={{
                      py: 1.5,
                      transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: COLORS.info,
                        color: COLORS.info,
                      }
                    }}
                  >
                    Download CSV
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, background: `${COLORS.primary}05`, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Report Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Expenses: {formatCurrency(totalExpenses)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {transactionCount} transactions • {categories.length - 1} categories
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estimated file size: {formatFileSize(245760)} {/* ~240KB */}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section - FIXED: Updated Grid syntax for MUI v7 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Category Breakdown
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie data={chartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Monthly Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={barChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Card sx={{ borderRadius: '20px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            Transaction Details
          </Typography>
          
          <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Merchant</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockData.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDate(row.date, 'short')}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {row.merchant[0]}
                        </Avatar>
                        {row.merchant}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.category} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(row.amount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
