'use client';

import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Popper from '@mui/material/Popper';
import { styled } from '@mui/material/styles';
import { useAppSelector } from '@/store/hooks';
import { ChevronDown, X } from 'lucide-react';

export interface AutocompleteOption<T = string> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
}

export interface BoutiqueAutocompleteProps<T = string> {
  options: (AutocompleteOption<T> | string)[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  className?: string;
  disableClearable?: boolean;
  disablePortal?: boolean;
  freeSolo?: boolean;
  startIcon?: React.ReactNode;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  id?: string;
}

// Styled Popper to ensure high z-index and luxury aesthetic above any modal (z-[9999])
const StyledPopper = styled(Popper)(({ theme }) => ({
  zIndex: '100000 !important',
  '&.MuiAutocomplete-popper': {
    zIndex: '100000 !important',
  },
  '& .MuiAutocomplete-paper': {
    marginTop: 6,
    borderRadius: 18,
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 16px 40px -8px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(223, 189, 118, 0.3)' 
      : '0 16px 36px -8px rgba(8, 76, 66, 0.16), 0 0 0 1px rgba(8, 76, 66, 0.1)',
    backgroundColor: theme.palette.mode === 'dark' ? '#072622' : '#FFFFFF',
    border: theme.palette.mode === 'dark' ? '1px solid rgba(223, 189, 118, 0.25)' : '1px solid #EADFC9',
    overflow: 'hidden',
  },
  '& .MuiAutocomplete-listbox': {
    padding: '6px',
    maxHeight: '260px',
    '&::-webkit-scrollbar': {
      width: 6,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(223, 189, 118, 0.3)' : 'rgba(8, 76, 66, 0.2)',
      borderRadius: 10,
    },
    '& .MuiAutocomplete-option': {
      borderRadius: 12,
      padding: '8px 12px',
      margin: '2px 0',
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: theme.palette.mode === 'dark' ? '#FAF6EC' : '#1C1917',
      transition: 'all 0.15s ease',
      '&[aria-selected="true"]': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(223, 189, 118, 0.18)' : 'rgba(8, 76, 66, 0.08)',
        color: theme.palette.mode === 'dark' ? '#DFBD76' : '#084C42',
        fontWeight: 700,
      },
      '&.Mui-focused, &:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(223, 189, 118, 0.12)' : 'rgba(8, 76, 66, 0.05)',
        color: theme.palette.mode === 'dark' ? '#DFBD76' : '#084C42',
      },
    },
  },
  '& .MuiAutocomplete-noOptions': {
    fontSize: '0.75rem',
    color: theme.palette.mode === 'dark' ? '#9BB5AF' : '#78716C',
    padding: '12px 16px',
    textAlign: 'center',
  },
}));

export function BoutiqueAutocomplete<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Search & select...',
  label,
  size = 'small',
  disabled = false,
  className = '',
  disableClearable = true,
  disablePortal = false,
  freeSolo = false,
  startIcon,
  fullWidth = true,
  error = false,
  helperText,
  id,
}: BoutiqueAutocompleteProps<T>) {
  const { theme } = useAppSelector((state) => state.auth);
  const isDark = theme === 'dark';

  // Normalize options to AutocompleteOption format
  const normalizedOptions: AutocompleteOption<T>[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return {
          value: opt as unknown as T,
          label: opt,
        };
      }
      return opt;
    });
  }, [options]);

  // Find currently selected option with case-insensitive matching fallback
  const selectedOption = React.useMemo(() => {
    if (value === undefined || value === null || value === '') return null;
    return (
      normalizedOptions.find(
        (opt) => String(opt.value).toLowerCase() === String(value).toLowerCase()
      ) || null
    );
  }, [normalizedOptions, value]);

  return (
    <div className={`flex flex-col ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="font-semibold text-xs text-[#1C1917] dark:text-[#FAF6EC] mb-1.5 block">
          {label}
        </label>
      )}

      <Autocomplete
        id={id}
        disabled={disabled}
        options={normalizedOptions}
        value={(selectedOption ?? (freeSolo && value ? ({ value, label: String(value) } as unknown as AutocompleteOption<T>) : null)) as any}
        disableClearable={disableClearable as any}
        disablePortal={disablePortal}
        freeSolo={freeSolo}
        openOnFocus={true}
        autoHighlight={true}
        fullWidth={fullWidth}
        size={size === 'small' ? 'small' : undefined}
        slots={{
          popper: StyledPopper,
        }}
        slotProps={{
          popper: {
            sx: {
              zIndex: 100000,
            },
            style: {
              zIndex: 100000,
            },
          },
        }}
        getOptionLabel={(option) => {
          if (!option) return '';
          if (typeof option === 'string') return option;
          return option.label || String(option.value) || '';
        }}
        isOptionEqualToValue={(option, val) => {
          if (!option || !val) return false;
          const optVal = typeof option === 'object' && option !== null ? option.value : option;
          const testVal = typeof val === 'object' && val !== null ? val.value : val;
          return String(optVal).toLowerCase() === String(testVal).toLowerCase();
        }}
        onInputChange={(_, newInputValue, reason) => {
          if (freeSolo && reason === 'input') {
            onChange(newInputValue as unknown as T);
          }
        }}
        onChange={(_, newValue) => {
          if (newValue && typeof newValue === 'object' && 'value' in newValue) {
            onChange(newValue.value as T);
          } else if (typeof newValue === 'string') {
            onChange(newValue as unknown as T);
          } else if (newValue === null && !disableClearable) {
            onChange('' as unknown as T);
          }
        }}
        popupIcon={<ChevronDown className="w-4 h-4 text-[#78716C] dark:text-[#DFBD76]" />}
        clearIcon={<X className="w-3.5 h-3.5 text-[#78716C] dark:text-[#DFBD76]" />}
        renderOption={(props, option, { selected }) => {
          const { key, ...otherProps } = props;
          return (
            <li key={key} {...otherProps} className={`${otherProps.className || ''} flex items-center justify-between gap-2 cursor-pointer`}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {option.icon && (
                  <span className="flex-shrink-0 text-[#084C42] dark:text-[#DFBD76]">
                    {option.icon}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs sm:text-sm font-semibold">
                    {option.label}
                  </span>
                  {option.sublabel && (
                    <span className="block truncate text-[10px] text-[#78716C] dark:text-[#9BB5AF]">
                      {option.sublabel}
                    </span>
                  )}
                </div>
              </div>

              {option.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                  option.badgeColor || (selected 
                    ? 'bg-[#084C42] text-white dark:bg-[#DFBD76] dark:text-[#041A17]' 
                    : 'bg-[#084C42]/10 text-[#084C42] dark:bg-[#DFBD76]/15 dark:text-[#DFBD76]')
                }`}>
                  {option.badge}
                </span>
              )}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={selectedOption || (freeSolo && value) ? undefined : placeholder}
            error={error}
            helperText={helperText}
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps?.input,
                startAdornment: startIcon ? (
                  <span className="pl-1.5 pr-1 flex items-center text-[#084C42] dark:text-[#DFBD76]">
                    {startIcon}
                  </span>
                ) : params.slotProps?.input?.startAdornment,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: isDark ? '#041A17' : '#FAF8F5',
                color: isDark ? '#FAF6EC' : '#1C1917',
                fontSize: size === 'small' ? '0.8125rem' : '0.875rem',
                fontWeight: 600,
                padding: size === 'small' ? '2px 8px' : '4px 10px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '& fieldset': {
                  borderColor: isDark ? '#1A3E38' : '#EADFC9',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: '#DFBD76',
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDark ? '#DFBD76' : '#084C42',
                  borderWidth: '1.5px',
                  boxShadow: isDark 
                    ? '0 0 0 3px rgba(223, 189, 118, 0.15)' 
                    : '0 0 0 3px rgba(8, 76, 66, 0.1)',
                },
                '& .MuiInputBase-input': {
                  padding: size === 'small' ? '5px 4px' : '8px 6px',
                  color: isDark ? '#FAF6EC' : '#1C1917',
                  cursor: 'pointer',
                  '&::placeholder': {
                    color: isDark ? '#9BB5AF' : '#78716C',
                    opacity: 1,
                  },
                },
              },
            }}
          />
        )}
      />
    </div>
  );
}
