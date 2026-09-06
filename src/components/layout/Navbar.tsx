'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme, openAuthModal, logoutUser } from '@/store/authSlice';
import { exportBoutiqueDataToExcel } from '@/lib/excelExport';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  ShieldCheck, 
  BadgeCheck, 
  FileSpreadsheet, 
  PlusCircle, 
  Calendar as CalendarIcon, 
  ShoppingBag, 
  BarChart3,
  Lock,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  activeTab: 'showroom' | 'calendar' | 'analytics' | 'bookings' | 'inventory';
  setActiveTab: (tab: 'showroom' | 'calendar' | 'analytics' | 'bookings' | 'inventory') => void;
  onOpenAddModal: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenAddModal }: NavbarProps) {
  const dispatch = useAppDispatch();
  const { currentUser, theme } = useAppSelector((state) => state.auth);
  const cholis = useAppSelector((state) => state.cholis.items);
  const bookings = useAppSelector((state) => state.bookings.items);

  const handleExportExcel = () => {
    exportBoutiqueDataToExcel(bookings, cholis, currentUser?.role);
    toast.success('Excel report downloaded successfully!');
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setActiveTab('showroom');
    toast.success('Signed out successfully. Private boutique portal locked.');
  };

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const avatarLetter = currentUser?.role === 'ADMIN' ? 'A' : (currentUser?.name?.charAt(0).toUpperCase() || 'S');

  const isDark = theme === 'dark';

  return (
    <AppBar position="sticky" elevation={0} sx={{ display: { xs: 'none', md: 'block' } }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: { xs: 68, sm: 76 }, justifyContent: 'space-between' }}>
          
          {/* Brand Logo with Official Boutique Artwork */}
          <Box 
            onClick={() => setActiveTab('showroom')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              cursor: 'pointer', 
              userSelect: 'none',
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'scale(1.02)' },
            }}
          >
            <Box
              sx={{
                height: { xs: 46, sm: 52 },
                px: 1.5,
                py: 0.5,
                borderRadius: '16px',
                bgcolor: '#025151',
                border: '1.5px solid #DFBD76',
                boxShadow: '0 4px 14px rgba(2, 81, 81, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src="/logo-cropped.png"
                alt="श्री SAKHI BOUTIQUE"
                sx={{
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Box sx={{ display: { xs: 'none', lg: 'block' }, borderLeft: isDark ? '1px solid rgba(223, 189, 118, 0.25)' : '1px solid rgba(8, 76, 66, 0.2)', pl: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography 
                  variant="caption"
                  sx={{ 
                    fontFamily: "var(--font-syne), 'Syne', sans-serif",
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: isDark ? '#DFBD76' : '#084C42',
                    lineHeight: 1.1,
                  }}
                >
                  Haute Couture
                </Typography>
                <Sparkles style={{ width: 12, height: 12, color: '#DFBD76' }} />
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  letterSpacing: '0.04em',
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: isDark ? '#9BB5AF' : '#78716C',
                  lineHeight: 1.2,
                  mt: 0.2,
                }}
              >
                Bridal & Choli Rentals
              </Typography>
            </Box>
          </Box>

          {/* Navigation Tabs (Showroom always available; operational tabs require Login) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.5,
              p: 0.5,
              borderRadius: 9999,
              bgcolor: isDark ? 'rgba(7, 38, 34, 0.8)' : 'rgba(244, 239, 230, 0.8)',
              border: isDark ? '1px solid #1A3E38' : '1px solid #EADFC9',
            }}
          >
            <Button
              size="small"
              onClick={() => setActiveTab('showroom')}
              variant={activeTab === 'showroom' ? 'contained' : 'text'}
              color="primary"
              startIcon={<ShoppingBag style={{ width: 15, height: 15 }} />}
              sx={{
                borderRadius: 9999,
                px: 2,
                py: 0.75,
                fontSize: '0.75rem',
                fontWeight: 700,
                color: activeTab === 'showroom' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#78716C',
              }}
            >
              Showroom
            </Button>

            {currentUser && (
              <>
                <Button
                  size="small"
                  onClick={() => setActiveTab('calendar')}
                  variant={activeTab === 'calendar' ? 'contained' : 'text'}
                  color="primary"
                  startIcon={<CalendarIcon style={{ width: 15, height: 15 }} />}
                  sx={{
                    borderRadius: 9999,
                    px: 2,
                    py: 0.75,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: activeTab === 'calendar' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#78716C',
                  }}
                >
                  Calendar
                </Button>

                <Button
                  size="small"
                  onClick={() => setActiveTab('bookings')}
                  variant={activeTab === 'bookings' ? 'contained' : 'text'}
                  color="primary"
                  sx={{
                    borderRadius: 9999,
                    px: 2,
                    py: 0.75,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: activeTab === 'bookings' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#78716C',
                  }}
                >
                  Bookings ({bookings.length})
                </Button>

                {/* STRICTLY ADMIN ONLY: Analytics & ROI Tab */}
                {currentUser?.role === 'ADMIN' && (
                  <Button
                    size="small"
                    onClick={() => setActiveTab('analytics')}
                    variant={activeTab === 'analytics' ? 'contained' : 'text'}
                    color="primary"
                    startIcon={<BarChart3 style={{ width: 15, height: 15 }} />}
                    sx={{
                      borderRadius: 9999,
                      px: 2,
                      py: 0.75,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: activeTab === 'analytics' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#78716C',
                    }}
                  >
                    ROI & Analytics
                  </Button>
                )}
              </>
            )}
          </Box>

          {/* Action Tools & User Authentication Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>

            {/* Excel Download (Only visible when logged in as Admin) */}
            {currentUser?.role === 'ADMIN' && (
              <Tooltip title="Download Boutique Excel Register">
                <IconButton
                  onClick={handleExportExcel}
                  sx={{
                    border: isDark ? '1px solid #1A3E38' : '1px solid #EADFC9',
                    bgcolor: isDark ? '#0A2E28' : '#FFFFFF',
                    color: '#15803D',
                    '&:hover': { bgcolor: isDark ? '#14463E' : '#F0FDF4' },
                  }}
                  size="small"
                >
                  <FileSpreadsheet style={{ width: 17, height: 17 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Add Choli Button (Strictly Admin only) */}
            {currentUser?.role === 'ADMIN' && (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={onOpenAddModal}
                startIcon={<PlusCircle style={{ width: 15, height: 15 }} />}
                sx={{
                  borderRadius: 9999,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              >
                Add Choli
              </Button>
            )}

            {/* WITHOUT LOGIN: Prominent Luxury MUI "Sign In" Button */}
            {!currentUser ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => dispatch(openAuthModal())}
                startIcon={<Lock style={{ width: 15, height: 15, color: '#DFBD76' }} />}
                sx={{
                  borderRadius: 9999,
                  px: { xs: 2, sm: 2.75 },
                  py: 0.85,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  boxShadow: '0 4px 14px rgba(114, 28, 36, 0.3)',
                }}
              >
                <span>Sign In</span>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.75, opacity: 0.85, fontWeight: 500, fontSize: '0.75rem' }}>
                  (Staff / Admin)
                </Box>
              </Button>
            ) : (
              /* LOGGED IN USER DETAILS ON RIGHT SIDE OF NAVBAR */
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  onClick={handleOpenUserMenu}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    pl: 1,
                    pr: 1.75,
                    py: 0.75,
                    borderRadius: 9999,
                    bgcolor: isDark ? 'rgba(7, 38, 34, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                    border: currentUser.role === 'ADMIN'
                      ? '1.5px solid #DFBD76'
                      : '1.5px solid rgba(8, 76, 66, 0.3)',
                    boxShadow: isDark
                      ? '0 4px 14px rgba(0, 0, 0, 0.4)'
                      : '0 4px 14px rgba(8, 76, 66, 0.08)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 18px rgba(223, 189, 118, 0.25)',
                      borderColor: '#DFBD76',
                    },
                  }}
                >
                  {/* User Initial Avatar Badge */}
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: currentUser.role === 'ADMIN' ? '#084C42' : '#0D5C51',
                      color: '#DFBD76',
                      fontWeight: 800,
                      fontFamily: "var(--font-syne), 'Syne', sans-serif",
                      fontSize: '0.95rem',
                      border: '1.5px solid #DFBD76',
                      boxShadow: '0 2px 6px rgba(8, 76, 66, 0.3)',
                    }}
                  >
                    {avatarLetter}
                  </Avatar>

                  {/* User Name & Role Specs */}
                  <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: isDark ? '#FAF6EC' : '#1C1917',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: { md: 140, lg: 180 },
                      }}
                    >
                      {currentUser.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                      <Chip
                        size="small"
                        label={currentUser.role === 'ADMIN' ? '👑 Boutique Admin' : `Staff • ${currentUser.employeeCode || 'EMP'}`}
                        sx={{
                          height: 18,
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          bgcolor: currentUser.role === 'ADMIN' 
                            ? isDark ? 'rgba(223, 189, 118, 0.2)' : 'rgba(8, 76, 66, 0.1)'
                            : isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(21, 128, 61, 0.1)',
                          color: currentUser.role === 'ADMIN' ? (isDark ? '#DFBD76' : '#084C42') : '#15803D',
                          border: currentUser.role === 'ADMIN' ? '1px solid rgba(223, 189, 118, 0.4)' : 'none',
                          '& .MuiChip-label': { px: 0.75 },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Dropdown Chevron */}
                  <ChevronDown style={{ width: 14, height: 14, color: isDark ? '#DFBD76' : '#78716C', marginLeft: 2 }} />
                </Box>

                {/* Profile & Logout Dropdown Menu */}
                <Menu
                  sx={{
                    mt: '48px',
                    '& .MuiPaper-root': {
                      borderRadius: '20px',
                      minWidth: 250,
                      bgcolor: isDark ? '#072622' : '#FFFFFF',
                      color: isDark ? '#FAF6EC' : '#1C1917',
                      border: isDark ? '1px solid rgba(223, 189, 118, 0.25)' : '1px solid #EADFC9',
                      boxShadow: isDark
                        ? '0 12px 32px rgba(0, 0, 0, 0.7)'
                        : '0 12px 32px rgba(8, 76, 66, 0.12)',
                      p: 1,
                    },
                  }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {/* User Profile Header */}
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: '#084C42',
                          color: '#DFBD76',
                          fontWeight: 800,
                          fontFamily: "var(--font-syne), 'Syne', sans-serif",
                          fontSize: '1.1rem',
                          border: '2px solid #DFBD76',
                        }}
                      >
                        {avatarLetter}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }} noWrap>
                          {currentUser.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: isDark ? '#9BB5AF' : '#78716C' }} noWrap>
                          {currentUser.email}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={currentUser.role === 'ADMIN' ? '👑 Boutique Admin' : `Staff (${currentUser.employeeCode || 'EMP'})`}
                            sx={{
                              height: 20,
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              bgcolor: currentUser.role === 'ADMIN' ? 'rgba(223, 189, 118, 0.2)' : 'rgba(8, 76, 66, 0.2)',
                              color: currentUser.role === 'ADMIN' ? '#DFBD76' : isDark ? '#9BB5AF' : '#084C42',
                              border: currentUser.role === 'ADMIN' ? '1px solid rgba(223, 189, 118, 0.4)' : '1px solid rgba(8, 76, 66, 0.3)',
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(223, 189, 118, 0.15)' : '#EADFC9' }} />

                  {/* Switch / Manage Profile */}
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      dispatch(openAuthModal());
                    }}
                    sx={{
                      borderRadius: '12px',
                      py: 1,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(223, 189, 118, 0.1)' : 'rgba(8, 76, 66, 0.06)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: '#DFBD76' }}>
                      <User style={{ width: 16, height: 16 }} />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        Switch Account / Profile
                      </Typography>
                    </ListItemText>
                  </MenuItem>

                  {/* Logout Option in Dropdown */}
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      setIsLogoutModalOpen(true);
                    }}
                    sx={{
                      borderRadius: '12px',
                      py: 1,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: '#DC2626',
                      '&:hover': {
                        bgcolor: 'rgba(220, 38, 38, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: '#DC2626' }}>
                      <LogOut style={{ width: 16, height: 16 }} />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#DC2626' }}>
                        Logout
                      </Typography>
                    </ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            )}

            {/* Dark / Light Mode Switcher */}
            <Tooltip title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}>
              <IconButton
                onClick={() => dispatch(toggleTheme())}
                size="small"
                sx={{
                  border: isDark ? '1px solid #1A3E38' : '1px solid #EADFC9',
                  bgcolor: isDark ? '#0A2E28' : '#FFFFFF',
                  color: isDark ? '#DFBD76' : '#084C42',
                  '&:hover': { bgcolor: isDark ? '#14463E' : '#FAF8F5' },
                }}
              >
                {isDark ? <Sun style={{ width: 17, height: 17 }} /> : <Moon style={{ width: 17, height: 17 }} />}
              </IconButton>
            </Tooltip>

          </Box>

        </Toolbar>
      </Container>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          handleLogout();
        }}
        type="warning"
        title="Sign Out Confirmation"
        description={`Are you sure you want to sign out from the boutique management suite as ${currentUser?.name || 'user'} (${currentUser?.role || ''})?`}
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
      />
    </AppBar>
  );
}
