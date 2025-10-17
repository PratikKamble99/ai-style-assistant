import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Button,
  Chip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Badge,
  Tooltip,
  Fab,
  Snackbar
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Share,
  Visibility,
  TrendingUp,
  Star,
  Refresh,
  FilterList
} from '@mui/icons-material';
import { trendingService, TrendingOutfit } from '../services/trendingService';
import { notificationService } from '../services/notificationService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trending-tabpanel-${index}`}
      aria-labelledby={`trending-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TrendingPage: React.FC = () => {
  const [trendingOutfits, setTrendingOutfits] = useState<TrendingOutfit[]>([]);
  const [featuredOutfits, setFeaturedOutfits] = useState<TrendingOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [likedOutfits, setLikedOutfits] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const categories = [
    { id: 'all', label: 'All Trending' },
    { id: 'Streetwear', label: 'Streetwear' },
    { id: 'Business Casual', label: 'Business Casual' },
    { id: 'Evening Wear', label: 'Evening Wear' },
    { id: 'Athleisure', label: 'Athleisure' },
    { id: 'Minimalist', label: 'Minimalist' },
  ];

  useEffect(() => {
    loadTrendingData();
  }, [tabValue]);

  const loadTrendingData = async () => {
    try {
      setLoading(true);

      if (tabValue === 0) {
        // Load featured and all trending
        const [featuredResponse, trendingResponse] = await Promise.all([
          trendingService.getFeatured(6),
          trendingService.getTrending(20, 0)
        ]);
        setFeaturedOutfits(featuredResponse);
        setTrendingOutfits(trendingResponse);
      } else {
        // Load by category
        const categoryId = categories[tabValue].id;
        const trendingResponse = await trendingService.getByCategory(categoryId, 20, 0);
        setTrendingOutfits(trendingResponse);
        setFeaturedOutfits([]);
      }
    } catch (error) {
      console.error('❌ Failed to load trending data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load trending outfits. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLikeOutfit = async (outfitId: string) => {
    try {
      const result = await trendingService.toggleLike(outfitId);
      
      // Update local state
      const newLikedOutfits = new Set(likedOutfits);
      if (result.liked) {
        newLikedOutfits.add(outfitId);
      } else {
        newLikedOutfits.delete(outfitId);
      }
      setLikedOutfits(newLikedOutfits);

      // Update outfit like count
      const updateOutfits = (outfits: TrendingOutfit[]) =>
        outfits.map(outfit =>
          outfit.id === outfitId
            ? { ...outfit, likeCount: result.liked ? outfit.likeCount + 1 : outfit.likeCount - 1 }
            : outfit
        );

      setTrendingOutfits(updateOutfits);
      setFeaturedOutfits(updateOutfits);

      setSnackbar({
        open: true,
        message: result.liked ? 'Added to favorites!' : 'Removed from favorites',
        severity: 'success'
      });
    } catch (error) {
      console.error('❌ Failed to like outfit:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update favorite. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleShareOutfit = async (outfit: TrendingOutfit) => {
    try {
      await trendingService.share(outfit.id);
      
      // Update share count
      const updateOutfits = (outfits: TrendingOutfit[]) =>
        outfits.map(o =>
          o.id === outfit.id
            ? { ...o, shareCount: o.shareCount + 1 }
            : o
        );

      setTrendingOutfits(updateOutfits);
      setFeaturedOutfits(updateOutfits);

      // Web share API or fallback
      if (navigator.share) {
        await navigator.share({
          title: outfit.title,
          text: outfit.description,
          url: window.location.href + `/${outfit.id}`,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href + `/${outfit.id}`);
        setSnackbar({
          open: true,
          message: 'Link copied to clipboard!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('❌ Failed to share outfit:', error);
      setSnackbar({
        open: true,
        message: 'Failed to share outfit. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleRefresh = () => {
    loadTrendingData();
  };

  const renderOutfitCard = (outfit: TrendingOutfit, isFeatured = false) => (
    <Grid item xs={12} sm={6} md={4} key={outfit.id}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-4px)',
            transition: 'transform 0.2s ease-in-out',
            boxShadow: 3,
          }
        }}
      >
        {isFeatured && (
          <Chip
            icon={<Star />}
            label="Featured"
            color="warning"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 1,
            }}
          />
        )}
        
        <Badge
          badgeContent={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 12 }} />
              <Typography variant="caption">
                {Math.round(outfit.trendingScore)}
              </Typography>
            </Box>
          }
          color="secondary"
          sx={{
            '& .MuiBadge-badge': {
              right: 8,
              top: 8,
              backgroundColor: '#ec4899',
              color: 'white',
            }
          }}
        >
          <CardMedia
            component="img"
            height="240"
            image={outfit.imageUrl}
            alt={outfit.title}
            sx={{ objectFit: 'cover' }}
          />
        </Badge>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            {outfit.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {outfit.description.length > 100 
              ? `${outfit.description.substring(0, 100)}...` 
              : outfit.description
            }
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            <Chip label={outfit.category} size="small" variant="outlined" />
            <Chip label={outfit.occasion.toLowerCase()} size="small" variant="outlined" />
            <Chip 
              label={outfit.priceRange.toLowerCase().replace('_', ' ')} 
              size="small" 
              variant="outlined" 
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {outfit.viewCount}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Favorite sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {outfit.likeCount}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {outfit.season}
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box>
            <Tooltip title={likedOutfits.has(outfit.id) ? "Remove from favorites" : "Add to favorites"}>
              <IconButton
                onClick={() => handleLikeOutfit(outfit.id)}
                color={likedOutfits.has(outfit.id) ? "error" : "default"}
              >
                {likedOutfits.has(outfit.id) ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Share outfit">
              <IconButton onClick={() => handleShareOutfit(outfit)}>
                <Share />
              </IconButton>
            </Tooltip>
          </Box>

          <Button
            variant="contained"
            size="small"
            sx={{ 
              backgroundColor: '#ec4899',
              '&:hover': { backgroundColor: '#db2777' }
            }}
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} sx={{ color: '#ec4899' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          🔥 Trending Outfits
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover what's hot in fashion right now
        </Typography>
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
            },
            '& .Mui-selected': {
              color: '#ec4899 !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#ec4899',
            },
          }}
        >
          {categories.map((category, index) => (
            <Tab key={category.id} label={category.label} />
          ))}
        </Tabs>
      </Box>

      {/* Featured Section */}
      {tabValue === 0 && featuredOutfits.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star sx={{ color: '#FFD700' }} />
            Featured Outfits
          </Typography>
          <Grid container spacing={3}>
            {featuredOutfits.map(outfit => renderOutfitCard(outfit, true))}
          </Grid>
        </Box>
      )}

      {/* Trending Section */}
      <TabPanel value={tabValue} index={tabValue}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp sx={{ color: '#ec4899' }} />
          {categories[tabValue].label}
        </Typography>
        
        {trendingOutfits.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No trending outfits found for this category. Check back later for new trends!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {trendingOutfits.map(outfit => renderOutfitCard(outfit))}
          </Grid>
        )}
      </TabPanel>

      {/* Refresh FAB */}
      <Fab
        color="primary"
        aria-label="refresh"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: '#ec4899',
          '&:hover': { backgroundColor: '#db2777' }
        }}
        onClick={handleRefresh}
      >
        <Refresh />
      </Fab>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TrendingPage;