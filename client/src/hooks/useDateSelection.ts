import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import moment from 'moment';
import { message } from 'antd';

interface DateValidationResult {
  isValid: boolean;
  errorMessage?: string;
  warnings?: string[];
}

interface DateSelectionState {
  checkInDate: string;
  checkOutDate: string;
  datePickerValue: [moment.Moment, moment.Moment] | null;
  numberOfNights: number;
  isValidRange: boolean;
}

interface UseDateSelectionProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  minStay?: number;
  maxStay?: number;
  onDateChange?: (checkIn: string, checkOut: string) => void;
}

export const useDateSelection = ({
  initialCheckIn,
  initialCheckOut,
  minStay = 1,
  maxStay = 30,
  onDateChange
}: UseDateSelectionProps = {}) => {
  
  // Initialize dates
  const getInitialDates = useMemo(() => {
    const checkIn = initialCheckIn || moment().add(1, 'day').format('YYYY-MM-DD');
    const checkOut = initialCheckOut || moment().add(2, 'days').format('YYYY-MM-DD');
    
    return {
      checkInDate: checkIn,
      checkOutDate: checkOut,
      datePickerValue: [moment(checkIn), moment(checkOut)] as [moment.Moment, moment.Moment],
      numberOfNights: moment(checkOut).diff(moment(checkIn), 'days'),
      isValidRange: true
    };
  }, [initialCheckIn, initialCheckOut]);

  const [state, setState] = useState<DateSelectionState>(getInitialDates);
  
  // Use ref to store callback and avoid dependency issues
  const onDateChangeRef = useRef(onDateChange);
  
  // Update ref when callback changes
  useEffect(() => {
    onDateChangeRef.current = onDateChange;
  }, [onDateChange]);

  // Validation logic
  const validateDateRange = useCallback((checkIn: moment.Moment, checkOut: moment.Moment): DateValidationResult => {
    const today = moment().startOf('day');
    const daysDiff = checkOut.diff(checkIn, 'days');
    
    // Check if dates are in the past
    if (checkIn.isBefore(today)) {
      return {
        isValid: false,
        errorMessage: 'Ngày nhận phòng không thể là ngày trong quá khứ'
      };
    }
    
    // Check minimum stay
    if (daysDiff < minStay) {
      return {
        isValid: false,
        errorMessage: `Thời gian lưu trú tối thiểu là ${minStay} đêm`
      };
    }
    
    // Check maximum stay
    if (daysDiff > maxStay) {
      return {
        isValid: false,
        errorMessage: `Thời gian lưu trú không được quá ${maxStay} đêm`
      };
    }
    
    // Check if checkout is too far in future (1 year)
    if (checkOut.isAfter(moment().add(1, 'year'))) {
      return {
        isValid: false,
        errorMessage: 'Không thể đặt phòng quá 1 năm trước'
      };
    }
    
    // Warnings for special cases
    const warnings: string[] = [];
    
    // Weekend warning
    if (checkIn.day() === 5 || checkIn.day() === 6) { // Friday or Saturday
      warnings.push('Cuối tuần có thể có giá cao hơn');
    }
    
    // Long stay discount
    if (daysDiff >= 7) {
      warnings.push('Lưu trú dài có thể được giảm giá');
    }
    
    // Peak season (summer months)
    if (checkIn.month() >= 5 && checkIn.month() <= 8) {
      warnings.push('Mùa cao điểm - nên đặt sớm');
    }
    
    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }, [minStay, maxStay]);

  // Handle date change
  const handleDateChange = useCallback((dates: [moment.Moment, moment.Moment] | null) => {
    if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
      // Clear dates
      setState({
        checkInDate: '',
        checkOutDate: '',
        datePickerValue: null,
        numberOfNights: 0,
        isValidRange: false
      });
      return;
    }
    
    const [checkIn, checkOut] = dates;
    const validation = validateDateRange(checkIn, checkOut);
    
    if (!validation.isValid) {
      // Show error but don't update state
      message.error(validation.errorMessage);
      return;
    }
    
    // Show warnings if any
    if (validation.warnings) {
      validation.warnings.forEach(warning => {
        message.warning(warning);
      });
    }
    
    const newCheckIn = checkIn.format('YYYY-MM-DD');
    const newCheckOut = checkOut.format('YYYY-MM-DD');
    const numberOfNights = checkOut.diff(checkIn, 'days');
    
    setState({
      checkInDate: newCheckIn,
      checkOutDate: newCheckOut,
      datePickerValue: [checkIn, checkOut],
      numberOfNights,
      isValidRange: true
    });
    
    // Callback for parent component using ref
    if (onDateChangeRef.current) {
      onDateChangeRef.current(newCheckIn, newCheckOut);
    }
  }, [validateDateRange]);

  // Utility functions
  const clearDates = useCallback(() => {
    setState({
      checkInDate: '',
      checkOutDate: '',
      datePickerValue: null,
      numberOfNights: 0,
      isValidRange: false
    });
  }, []);

  const setQuickDates = useCallback((nights: number) => {
    const checkIn = moment().add(1, 'day');
    const checkOut = checkIn.clone().add(nights, 'days');
    handleDateChange([checkIn, checkOut]);
  }, [handleDateChange]);

  // Disabled date function for DatePicker
  const disabledDate = useCallback((current: moment.Moment) => {
    const today = moment().startOf('day');
    const maxDate = moment().add(1, 'year');
    
    return current && (current.isBefore(today) || current.isAfter(maxDate));
  }, []);

  // Get formatted date strings for display
  const getFormattedDates = useMemo(() => {
    if (!state.checkInDate || !state.checkOutDate) {
      return {
        checkInFormatted: '',
        checkOutFormatted: '',
        dateRangeText: ''
      };
    }
    
    const checkInMoment = moment(state.checkInDate);
    const checkOutMoment = moment(state.checkOutDate);
    
    return {
      checkInFormatted: checkInMoment.format('DD/MM/YYYY'),
      checkOutFormatted: checkOutMoment.format('DD/MM/YYYY'),
      dateRangeText: `${checkInMoment.format('DD/MM')} - ${checkOutMoment.format('DD/MM/YYYY')} (${state.numberOfNights} đêm)`
    };
  }, [state.checkInDate, state.checkOutDate, state.numberOfNights]);

  return {
    // State
    ...state,
    
    // Actions
    handleDateChange,
    clearDates,
    setQuickDates,
    
    // Utilities
    disabledDate,
    validateDateRange,
    getFormattedDates,
    
    // Quick date setters
    setWeekendStay: () => setQuickDates(2),
    setWeekStay: () => setQuickDates(7),
    setTwoWeekStay: () => setQuickDates(14)
  };
};
