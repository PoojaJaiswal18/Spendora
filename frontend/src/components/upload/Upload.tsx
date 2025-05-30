import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Fade,
  Grow,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  useTheme,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  CloudUpload,
  PhotoCamera,
  CheckCircle,
  Edit,
  Save,
  Cancel,
  Receipt as ReceiptIcon,
  Category,
  AttachMoney,
  DateRange,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formatCurrency, formatFileSize, formatDate } from '../../utils/formatters';
import { COLORS, ANIMATION_DURATIONS, CATEGORIES, FILE_TYPES, MAX_FILE_SIZE } from '../../utils/constants';
import { localStorage } from '../../utils/localStorage';
import { validate } from '../../utils/validators';

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

interface ExtractedData {
  merchant: string;
  amount: number;
  date: Date;
  items: string[];
  category: string;
}

const Upload: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const categoryOptions = CATEGORIES.map(cat => cat.name);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`
      );
      console.error('File upload errors:', errors);
      return;
    }

    // Validate file sizes
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        console.error(`File ${file.name} is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      setActiveStep(1);
      
      // Store upload history
      const uploadHistory = localStorage.getItem('uploadHistory', []);
      const newUploads = newFiles.map(f => ({
        filename: f.file.name,
        size: f.file.size,
        type: f.file.type,
        uploadedAt: new Date().toISOString(),
      }));
      localStorage.setItem('uploadHistory', [...newUploads, ...uploadHistory.slice(0, 19)]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': FILE_TYPES.IMAGES,
      'application/pdf': FILE_TYPES.DOCUMENTS,
    },
    multiple: true,
    maxSize: MAX_FILE_SIZE,
  });

  const handleProcessReceipt = async () => {
    setProcessing(true);
    setActiveStep(2);
    setUploadProgress(0);

    // Simulate OCR processing with progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate OCR processing
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setExtractedData({
        merchant: 'Starbucks Coffee',
        amount: 15.50,
        date: new Date(),
        items: ['Grande Latte', 'Blueberry Muffin'],
        category: 'Food & Dining',
      });
      setProcessing(false);
      setActiveStep(3);
    }, 3000);
  };

  const validateExtractedData = (data: ExtractedData): boolean => {
    const errors: Record<string, string> = {};

    // Validate merchant
    const merchantValidation = validate.string(data.merchant)
      .required('Merchant name is required')
      .minLength(2, 'Merchant name must be at least 2 characters')
      .validate();
    
    if (!merchantValidation.isValid) {
      errors.merchant = merchantValidation.errors[0];
    }

    // Validate amount
    const amountValidation = validate.number(data.amount)
      .required('Amount is required')
      .positive('Amount must be positive')
      .validate();
    
    if (!amountValidation.isValid) {
      errors.amount = amountValidation.errors[0];
    }

    // Validate category
    if (!data.category || !categoryOptions.includes(data.category)) {
      errors.category = 'Please select a valid category';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveReceipt = () => {
    if (!extractedData || !validateExtractedData(extractedData)) {
      return;
    }

    setActiveStep(4);
    
    // Store processed receipt
    const processedReceipts = localStorage.getItem('processedReceipts', []);
    const newReceipt = {
      id: Date.now(),
      ...extractedData,
      processedAt: new Date().toISOString(),
      files: uploadedFiles.map(f => f.file.name),
    };
    localStorage.setItem('processedReceipts', [newReceipt, ...processedReceipts.slice(0, 49)]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(file => file.id !== id);
    });
  };

  const resetUpload = () => {
    uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setUploadedFiles([]);
    setExtractedData(null);
    setEditMode(false);
    setProcessing(false);
    setUploadProgress(0);
    setActiveStep(0);
    setValidationErrors({});
  };

  const handleDataChange = (field: keyof ExtractedData, value: any) => {
    if (extractedData) {
      setExtractedData({ ...extractedData, [field]: value });
      // Clear validation error for this field
      if (validationErrors[field]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const steps = [
    'Upload Receipt',
    'Process Image',
    'Verify Data',
    'Complete',
  ];

  const stepDescriptions = [
    'Drag and drop or click to upload receipt images',
    'Processing image with OCR technology',
    'Review and edit extracted information',
    'Receipt saved successfully!',
  ];

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
            Upload Receipt 📄
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Transform your receipts into organized digital data
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Grow in timeout={ANIMATION_DURATIONS.LONG}>
            <Card className="hover-lift">
              <CardContent sx={{ p: 3 }}>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel
                        sx={{
                          '& .MuiStepLabel-label': {
                            fontWeight: 600,
                            fontFamily: 'Inter, sans-serif',
                            color: activeStep >= index ? COLORS.primary : theme.palette.text.secondary,
                            transition: `color ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                          },
                          '& .MuiStepIcon-root': {
                            color: activeStep >= index ? COLORS.primary : theme.palette.text.disabled,
                            transition: `color ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                          {stepDescriptions[index]}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} md={8}>
          {activeStep === 0 && (
            <Grow in timeout={700}>
              <Card
                className="hover-lift"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${COLORS.primary}05 100%)`,
                  border: `2px dashed ${COLORS.primary}40`,
                  transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    {...getRootProps()}
                    sx={{
                      textAlign: 'center',
                      py: 6,
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                      '&:hover': {
                        background: `${COLORS.primary}10`,
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    <input {...getInputProps()} />
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                        animation: isDragActive ? 'pulse 1s infinite' : 'float 3s ease-in-out infinite',
                      }}
                    >
                      <CloudUpload sx={{ fontSize: 40 }} />
                    </Avatar>
                    
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Inter, sans-serif' }}>
                      {isDragActive ? 'Drop files here' : 'Upload Receipt Images'}
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontFamily: 'Inter, sans-serif' }}>
                      Drag and drop your receipt images here, or click to browse
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Chip
                        icon={<PhotoCamera />}
                        label="JPEG, PNG, GIF"
                        variant="outlined"
                        sx={{ borderColor: COLORS.primary, fontFamily: 'Inter, sans-serif' }}
                      />
                      <Chip
                        icon={<ReceiptIcon />}
                        label="PDF"
                        variant="outlined"
                        sx={{ borderColor: COLORS.secondary, fontFamily: 'Inter, sans-serif' }}
                      />
                    </Box>
                  </Box>

                  {uploadedFiles.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Inter, sans-serif' }}>
                        Uploaded Files ({uploadedFiles.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {uploadedFiles.map((file) => (
                          <Grid item xs={12} sm={6} md={4} key={file.id}>
                            <Card
                              sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: `0 8px 25px ${COLORS.primary}30`,
                                },
                                '&:hover .delete-btn': {
                                  opacity: 1,
                                },
                              }}
                            >
                              <Box
                                component="img"
                                src={file.preview}
                                alt={file.file.name}
                                sx={{
                                  width: '100%',
                                  height: 120,
                                  objectFit: 'cover',
                                }}
                              />
                              <IconButton
                                className="delete-btn"
                                onClick={() => removeFile(file.id)}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  background: 'rgba(0, 0, 0, 0.7)',
                                  color: 'white',
                                  opacity: 0,
                                  transition: `opacity ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                                  '&:hover': {
                                    background: 'rgba(0, 0, 0, 0.8)',
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              >
                                <Delete />
                              </IconButton>
                              <CardContent sx={{ p: 1 }}>
                                <Typography variant="body2" noWrap sx={{ fontFamily: 'Inter, sans-serif' }}>
                                  {file.file.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                                  {formatFileSize(file.file.size)}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                      
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleProcessReceipt}
                        sx={{
                          mt: 3,
                          py: 1.5,
                          background: `linear-gradient(135deg, ${COLORS.primary}, ${theme.palette.primary.dark})`,
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${COLORS.primary}40`,
                          },
                        }}
                        className="neon-button"
                      >
                        Process Receipts
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grow>
          )}

          {activeStep === 2 && processing && (
            <Grow in timeout={500}>
              <Card className="hover-lift">
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                      animation: 'pulse 2s infinite',
                    }}
                  >
                    <ReceiptIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Inter, sans-serif' }}>
                    Processing Receipt...
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontFamily: 'Inter, sans-serif' }}>
                    Our AI is extracting data from your receipt
                  </Typography>
                  
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
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
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontFamily: 'Inter, sans-serif' }}>
                    {Math.round(uploadProgress)}% complete
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          )}

          {activeStep === 3 && extractedData && (
            <Grow in timeout={500}>
              <Card className="hover-lift">
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: 'Inter, sans-serif' }}>
                      Verify Extracted Data
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={editMode ? <Save /> : <Edit />}
                        onClick={() => setEditMode(!editMode)}
                        variant={editMode ? 'contained' : 'outlined'}
                        sx={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {editMode ? 'Save' : 'Edit'}
                      </Button>
                      <IconButton
                        onClick={handleProcessReceipt}
                        sx={{
                          color: COLORS.primary,
                          '&:hover': { transform: 'rotate(180deg)' },
                          transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                        }}
                      >
                        <Refresh />
                      </IconButton>
                    </Box>
                  </Box>

                  {Object.keys(validationErrors).length > 0 && (
                    <Alert severity="error" sx={{ mb: 3, fontFamily: 'Inter, sans-serif' }}>
                      Please fix the following errors before saving:
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        {Object.values(validationErrors).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Merchant Name"
                        value={extractedData.merchant}
                        disabled={!editMode}
                        error={!!validationErrors.merchant}
                        helperText={validationErrors.merchant}
                        onChange={(e) => handleDataChange('merchant', e.target.value)}
                        InputProps={{
                          startAdornment: <ReceiptIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                        }}
                        sx={{ mb: 2, '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Amount"
                        value={extractedData.amount}
                        disabled={!editMode}
                        type="number"
                        error={!!validationErrors.amount}
                        helperText={validationErrors.amount}
                        onChange={(e) => handleDataChange('amount', parseFloat(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: <AttachMoney sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                        }}
                        sx={{ mb: 2, '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Date"
                        value={extractedData.date}
                        disabled={!editMode}
                        onChange={(date) => handleDataChange('date', date || new Date())}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            InputProps: {
                              startAdornment: <DateRange sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                            },
                            sx: { '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } },
                          },
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={categoryOptions}
                        value={extractedData.category}
                        disabled={!editMode}
                        onChange={(_, value) => handleDataChange('category', value || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Category"
                            error={!!validationErrors.category}
                            helperText={validationErrors.category}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: <Category sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                            }}
                            sx={{ '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Inter, sans-serif' }}>
                        Items
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {extractedData.items.map((item, index) => (
                          <Chip
                            key={index}
                            label={item}
                            variant="outlined"
                            sx={{
                              borderColor: COLORS.primary,
                              color: COLORS.primary,
                              fontFamily: 'Inter, sans-serif',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: `0 4px 12px ${COLORS.primary}30`,
                              },
                              transition: `all ${ANIMATION_DURATIONS.SHORT}ms ease`,
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleSaveReceipt}
                      sx={{
                        py: 1.5,
                        background: `linear-gradient(135deg, ${COLORS.success}, ${theme.palette.success.dark})`,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${COLORS.success}40`,
                        },
                      }}
                    >
                      Save Receipt
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<Cancel />}
                      onClick={resetUpload}
                      sx={{ 
                        fontFamily: 'Inter, sans-serif',
                        transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                        '&:hover': { transform: 'translateY(-2px)' }
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          )}

          {activeStep === 4 && (
            <Grow in timeout={500}>
              <Card
                className="hover-lift"
                sx={{
                  background: `linear-gradient(135deg, ${COLORS.success}10, ${theme.palette.success.dark}05)`,
                  border: `1px solid ${COLORS.success}30`,
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      background: `linear-gradient(135deg, ${COLORS.success}, ${theme.palette.success.dark})`,
                      animation: 'pulse 2s infinite',
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 40 }} />
                  </Avatar>
                  
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: COLORS.success, fontFamily: 'Inter, sans-serif' }}>
                    Receipt Saved Successfully! 🎉
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontFamily: 'Inter, sans-serif' }}>
                    Your receipt has been processed and saved to your account
                  </Typography>

                  {extractedData && (
                    <Box sx={{ mb: 4, p: 3, borderRadius: 2, background: `${theme.palette.background.default}50` }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Inter, sans-serif' }}>
                        Receipt Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                            Merchant:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'Inter, sans-serif' }}>
                            {extractedData.merchant}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                            Amount:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'Inter, sans-serif' }}>
                            {formatCurrency(extractedData.amount)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                            Date:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'Inter, sans-serif' }}>
                            {formatDate(extractedData.date, 'short')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                            Category:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'Inter, sans-serif' }}>
                            {extractedData.category}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={resetUpload}
                      sx={{
                        background: `linear-gradient(135deg, ${COLORS.primary}, ${theme.palette.primary.dark})`,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${COLORS.primary}40`,
                        },
                      }}
                    >
                      Upload Another
                    </Button>
                    <Button 
                      variant="outlined"
                      sx={{ 
                        fontFamily: 'Inter, sans-serif',
                        transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                        '&:hover': { transform: 'translateY(-2px)' }
                      }}
                    >
                      View Dashboard
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Upload;
