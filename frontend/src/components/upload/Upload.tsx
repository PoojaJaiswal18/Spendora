import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid, // Using new Grid (formerly Grid2)
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

// Define category type based on CATEGORIES constant
type CategoryType = 'Food & Dining' | 'Transportation' | 'Shopping' | 'Entertainment' | 'Bills & Utilities' | 'Healthcare' | 'Travel' | 'Education' | 'Other';

const Upload: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const categoryOptions: CategoryType[] = CATEGORIES.map(cat => cat.name as CategoryType);

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

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    if (newFiles.length > 0) {
      setActiveStep(1);
      // Store upload history - FIXED: Use existing StorageKey
      const uploadHistory = localStorage.getItem<any[]>('tempUploads', []) || [];
      const newUploads = newFiles.map(f => ({
        filename: f.file.name,
        size: f.file.size,
        type: f.file.type,
        uploadedAt: new Date().toISOString(),
      }));
      localStorage.setItem('tempUploads', [...newUploads, ...uploadHistory.slice(0, 19)]);
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

    // Validate category - FIXED: Use proper type checking
    if (!data.category || !categoryOptions.includes(data.category as CategoryType)) {
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
    // Store processed receipt - FIXED: Use existing StorageKey
    const processedReceipts = localStorage.getItem<any[]>('offlineData', []) || [];
    const newReceipt = {
      id: Date.now(),
      ...extractedData,
      processedAt: new Date().toISOString(),
      files: uploadedFiles.map(f => f.file.name),
    };
    localStorage.setItem('offlineData', [newReceipt, ...processedReceipts.slice(0, 49)]);
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
        {/* Stepper - FIXED: Updated Grid syntax for MUI v7 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: '20px', height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
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
                      <Typography variant="body2" color="text.secondary">
                        {stepDescriptions[index]}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content - FIXED: Updated Grid syntax for MUI v7 */}
        <Grid size={{ xs: 12, md: 8 }}>
          {activeStep === 0 && (
            <Card sx={{ borderRadius: '20px' }}>
              <CardContent sx={{ p: 4 }}>
                <Box
                  {...getRootProps()}
                  sx={{
                    border: `2px dashed ${isDragActive ? COLORS.primary : theme.palette.divider}`,
                    borderRadius: '20px',
                    p: 6,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                    background: isDragActive ? `${COLORS.primary}05` : 'transparent',
                    '&:hover': {
                      borderColor: COLORS.primary,
                      background: `${COLORS.primary}05`,
                      transform: 'translateY(-2px)',
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
                      background: `linear-gradient(135deg, ${COLORS.primary}, ${theme.palette.primary.dark})`,
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 40 }} />
                  </Avatar>
                  
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                    {isDragActive ? 'Drop files here' : 'Upload Receipt Images'}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Drag and drop your receipt images here, or click to browse
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label="JPEG, PNG, GIF"
                      variant="outlined"
                      sx={{ borderColor: COLORS.primary, fontFamily: 'Inter, sans-serif' }}
                    />
                    <Chip
                      label="PDF"
                      variant="outlined"
                      sx={{ borderColor: COLORS.secondary, fontFamily: 'Inter, sans-serif' }}
                    />
                  </Box>
                </Box>

                {uploadedFiles.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      Uploaded Files ({uploadedFiles.length})
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {uploadedFiles.map((file) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id}>
                          <Card
                            sx={{
                              position: 'relative',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              '&:hover .delete-button': {
                                opacity: 1,
                              },
                            }}
                          >
                            {file.file.type.startsWith('image/') ? (
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
                            ) : (
                              <Box
                                sx={{
                                  height: 120,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: `${COLORS.secondary}20`,
                                }}
                              >
                                <ReceiptIcon sx={{ fontSize: 40, color: COLORS.secondary }} />
                              </Box>
                            )}
                            
                            <IconButton
                              className="delete-button"
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
                            
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="body2" fontWeight="medium" noWrap>
                                {file.file.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(file.file.size)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleProcessReceipt}
                      sx={{
                        mt: 3,
                        py: 1.5,
                        background: `linear-gradient(135deg, ${COLORS.primary}, ${theme.palette.primary.dark})`,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      Process Receipts
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {activeStep === 2 && processing && (
            <Card sx={{ borderRadius: '20px' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                  Processing Receipt...
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Our AI is extracting data from your receipt
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 2,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.round(uploadProgress)}% complete
                </Typography>
              </CardContent>
            </Card>
          )}

          {activeStep === 3 && extractedData && (
            <Card sx={{ borderRadius: '20px' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold">
                    Verify Extracted Data
                  </Typography>
                  <Button
                    startIcon={editMode ? <Save /> : <Edit />}
                    onClick={() => setEditMode(!editMode)}
                    variant={editMode ? 'contained' : 'outlined'}
                    sx={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {editMode ? 'Save' : 'Edit'}
                  </Button>
                </Box>

                {Object.keys(validationErrors).length > 0 && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    Please fix the following errors before saving:
                    <ul>
                      {Object.values(validationErrors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                )}

                <Grid container spacing={3}>
                  {/* Merchant - FIXED: Updated Grid syntax for MUI v7 */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Merchant"
                      fullWidth
                      disabled={!editMode}
                      value={extractedData.merchant}
                      onChange={(e) => handleDataChange('merchant', e.target.value)}
                      error={!!validationErrors.merchant}
                      helperText={validationErrors.merchant}
                      InputProps={{
                        startAdornment: <ReceiptIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      sx={{ mb: 2, '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
                    />
                  </Grid>

                  {/* Amount - FIXED: Updated Grid syntax for MUI v7 */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Amount"
                      type="number"
                      fullWidth
                      disabled={!editMode}
                      value={extractedData.amount}
                      onChange={(e) => handleDataChange('amount', parseFloat(e.target.value) || 0)}
                      error={!!validationErrors.amount}
                      helperText={validationErrors.amount}
                      InputProps={{
                        startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      sx={{ mb: 2, '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
                    />
                  </Grid>

                  {/* Date - FIXED: Updated Grid syntax for MUI v7 */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker
                      label="Date"
                      value={extractedData.date}
                      disabled={!editMode}
                      onChange={(date) => handleDataChange('date', date || new Date())}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          InputProps: {
                            startAdornment: <DateRange sx={{ mr: 1, color: 'text.secondary' }} />,
                          },
                          sx: { '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } },
                        },
                      }}
                    />
                  </Grid>

                  {/* Category - FIXED: Updated Grid syntax for MUI v7 */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      options={categoryOptions}
                      value={extractedData.category as CategoryType}
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
                            startAdornment: <Category sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                          sx={{ '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Items - FIXED: Updated Grid syntax for MUI v7 */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                      Items
                    </Typography>
                    {extractedData.items.map((item, index) => (
                      <Chip
                        key={index}
                        label={item}
                        sx={{ mr: 1, mb: 1, fontFamily: 'Inter, sans-serif' }}
                      />
                    ))}
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveReceipt}
                    disabled={Object.keys(validationErrors).length > 0}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Save Receipt
                  </Button>
                  <Button
                    variant="outlined"
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
          )}

          {activeStep === 4 && (
            <Card sx={{ borderRadius: '20px' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                    background: `linear-gradient(135deg, ${COLORS.success}, ${theme.palette.success.dark})`,
                  }}
                >
                  <CheckCircle sx={{ fontSize: 40 }} />
                </Avatar>

                <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                  Receipt Saved Successfully! 🎉
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Your receipt has been processed and saved to your account
                </Typography>

                {extractedData && (
                  <Card sx={{ mb: 4, background: `${COLORS.success}05` }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Receipt Summary
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {/* Summary Items - FIXED: Updated Grid syntax for MUI v7 */}
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight="medium">Merchant:</Typography>
                            <Typography variant="body2">{extractedData.merchant}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight="medium">Amount:</Typography>
                            <Typography variant="body2">{formatCurrency(extractedData.amount)}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight="medium">Date:</Typography>
                            <Typography variant="body2">{formatDate(extractedData.date, 'short')}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight="medium">Category:</Typography>
                            <Typography variant="body2">{extractedData.category}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={resetUpload}
                    sx={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Upload Another
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    View Dashboard
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Upload;
