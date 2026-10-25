import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearAuthError, login } from '../features/auth/authSlice';

import './Login.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { status, error } = useAppSelector((state) => state.auth);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    '/dashboard';

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    dispatch(clearAuthError());

    const result = await dispatch(
      login({
        username: username.trim(),
        password,
      })
    );

    if (login.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Box className="lm-page">
      {/* Left: live-matters branding */}
      <Box component="section" className="lm-brand-panel">
        <Box className="lm-brand">
          <Box className="lm-logo" aria-hidden="true">
            <FavoriteIcon />
            <MonitorHeartOutlinedIcon className="lm-logo-pulse" />
          </Box>

          <Typography component="span" className="lm-brand-name">
            live-matters
          </Typography>
        </Box>

        <Typography component="h1" className="lm-tagline">
          Radiology. <span>Connected.</span>
        </Typography>

        <Typography className="lm-description">
          Better images. Faster decisions.
          <br />
          For healthier tomorrows.
        </Typography>

        {/* Medical imaging composition */}
        <Box className="lm-imaging">
          <Box className="lm-xray lm-xray-main">
            <img
              src="/images/chest-xray.jpg"
              alt="Chest X-ray"
            />
            <span className="lm-image-label">RADIOLOGY</span>
          </Box>

          <Box className="lm-xray-stack">
            <Box className="lm-xray">
              <img src="/images/brain-mri.jpg" alt="Brain MRI" />
            </Box>
            <Box className="lm-xray">
              <img src="/images/knee-scan.jpg" alt="Knee scan" />
            </Box>
            <Box className="lm-xray">
              <img
                src="/images/abdomen-scan.jpg"
                alt="Abdominal scan"
              />
            </Box>
          </Box>
        </Box>

        {/* Product benefits */}
        <Box className="lm-benefits">
          <Box className="lm-benefit">
            <Box className="lm-benefit-icon">
              <SecurityOutlinedIcon />
            </Box>
            <Box>
              <Typography className="lm-benefit-title">
                Secure
              </Typography>
              <Typography className="lm-benefit-description">
                Your data. Our priority.
              </Typography>
            </Box>
          </Box>

          <Box className="lm-benefit">
            <Box className="lm-benefit-icon">
              <BoltOutlinedIcon />
            </Box>
            <Box>
              <Typography className="lm-benefit-title">
                Efficient
              </Typography>
              <Typography className="lm-benefit-description">
                Streamlined workflow.
              </Typography>
            </Box>
          </Box>

          <Box className="lm-benefit">
            <Box className="lm-benefit-icon">
              <FavoriteBorderIcon />
            </Box>
            <Box>
              <Typography className="lm-benefit-title">
                Better Care
              </Typography>
              <Typography className="lm-benefit-description">
                For every patient.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Decorative bottom wave */}
        <Box className="lm-decoration" aria-hidden="true" />
      </Box>

      {/* Right: login form */}
      <Box component="section" className="lm-login-panel">
        <Box className="lm-login-content">
          <Typography component="h2" className="lm-welcome">
            Welcome back
          </Typography>

          <Typography className="lm-login-subtitle">
            Sign in to your workspace
          </Typography>

          {error && (
            <Alert severity="error" className="lm-error">
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            className="lm-form"
          >
            <Typography
              component="label"
              htmlFor="lm-username"
              className="lm-field-label"
            >
              Username *
            </Typography>

            <TextField
              id="lm-username"
              fullWidth
              className="lm-input"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoFocus
              required
              inputProps={{ 'aria-label': 'Username' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              component="label"
              htmlFor="lm-password"
              className="lm-field-label lm-password-label"
            >
              Password *
            </Typography>

            <TextField
              id="lm-password"
              fullWidth
              className="lm-input"
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              inputProps={{ 'aria-label': 'Password' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowPassword((visible) => !visible)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon />
                      ) : (
                        <VisibilityOutlinedIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box className="lm-options">
              <Box component="label" className="lm-remember">
                <Checkbox
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  size="small"
                  disableRipple
                  inputProps={{ 'aria-label': 'Remember me' }}
                />
                <Typography>Remember me</Typography>
              </Box>

              <button
                type="button"
                className="lm-forgot"
                onClick={() => {
                  // Connect the password-recovery flow here.
                }}
              >
                Forgot password?
              </button>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="lm-submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <CircularProgress size={21} color="inherit" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <span className="lm-submit-arrow" aria-hidden="true">
                    →
                  </span>
                </>
              )}
            </Button>
          </Box>

          <Box className="lm-support">
            <SupportAgentOutlinedIcon />
            <Box>
              <Typography className="lm-support-title">
                Need help?
              </Typography>
              <Typography className="lm-support-description">
                Contact your support team
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
